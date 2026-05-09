import express from "express";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import SiteContent from "../models/SiteContent.js";
import Project from "../models/Project.js";
import Post from "../models/Post.js";
import Testimonial from "../models/Testimonial.js";

const router = express.Router();

const ChatState = Annotation.Root({
  question: Annotation(),
  history: Annotation({
    reducer: (_current, update) => update || [],
    default: () => []
  }),
  context: Annotation({
    reducer: (_current, update) => update || "",
    default: () => ""
  }),
  answer: Annotation({
    reducer: (_current, update) => update || "",
    default: () => ""
  }),
  source: Annotation({
    reducer: (_current, update) => update || "fallback",
    default: () => "fallback"
  })
});

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function messageText(message) {
  if (typeof message?.content === "string") return message.content;
  if (Array.isArray(message?.content)) {
    return message.content.map((part) => part?.text || "").join(" ").trim();
  }
  return "";
}

async function loadPortfolioContext() {
  const [content, projects, posts, testimonials] = await Promise.all([
    SiteContent.findOne().lean(),
    Project.find().sort({ sortOrder: 1, createdAt: -1 }).limit(8).lean(),
    Post.find({ published: true }).sort({ sortOrder: 1, publishedAt: -1 }).limit(5).lean(),
    Testimonial.find({ public: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(5).lean()
  ]);

  const projectLines = projects.map((project) => (
    `Project: ${project.title}. Category: ${project.category}. Description: ${cleanText(project.description)}. Tech: ${(project.technologies || []).join(", ")}.`
  ));
  const postLines = posts.map((post) => `Post: ${post.title}. ${cleanText(post.excerpt)}`);
  const proofLines = testimonials.map((item) => `${item.type}: ${item.name}. ${cleanText(item.quote)}`);

  return [
    `Name: ${content?.headerTitle || "Hirko Gemechu"}`,
    `Role: ${content?.headerSubtitle || "MERN Developer"}`,
    `About: ${cleanText(content?.aboutBody || "")}`,
    `Services: ${(content?.services || []).map((service) => `${service.title}: ${service.description}`).join(" | ")}`,
    `Skills: ${(content?.skillGroups || []).map((group) => `${group.title}: ${(group.items || []).join(", ")}`).join(" | ")}`,
    `Contact: ${content?.email || ""} ${content?.phone || ""} ${content?.location || ""}`,
    ...projectLines,
    ...postLines,
    ...proofLines
  ].filter(Boolean).join("\n");
}

function fallbackAnswer(question, context) {
  const lower = question.toLowerCase();
  if (lower.includes("contact") || lower.includes("email") || lower.includes("phone")) {
    return "You can contact Hirko Gemechu from the contact section of this site. The portfolio lists email, phone, and a message form for project or job opportunities.";
  }

  if (lower.includes("service") || lower.includes("build") || lower.includes("offer")) {
    return "Hirko Gemechu offers web development, business systems, dashboards, responsive portfolio/company sites, database-backed workflows, and technical support solutions.";
  }

  if (lower.includes("project") || lower.includes("work")) {
    return "Hirko Gemechu builds responsive websites, dashboards, portfolio systems, and practical business tools. You can see the latest project showcase in the Projects section.";
  }

  if (lower.includes("skill") || lower.includes("tech")) {
    return "Hirko works with React, JavaScript, Node.js, Express, MongoDB, PHP, MySQL, responsive UI, REST APIs, dashboards, and technical support workflows.";
  }

  return `I can answer questions about Hirko Gemechu, projects, skills, services, downloads, and contact details. ${context ? "Ask me about the portfolio or available services." : ""}`;
}

const graph = new StateGraph(ChatState)
  .addNode("load_context", async () => {
    const context = await loadPortfolioContext();
    return { context };
  })
  .addNode("generate_reply", async (state) => {
    const model = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
      model: process.env.OLLAMA_MODEL || "llama3.1",
      temperature: 0.3
    });

    const history = (state.history || [])
      .slice(-6)
      .map((item) => `${item.role === "assistant" ? "Assistant" : "Visitor"}: ${cleanText(item.content)}`)
      .join("\n");

    const response = await model.invoke([
      new SystemMessage([
        "You are Hirko Gemechu's portfolio assistant.",
        "Answer warmly, briefly, and only from the portfolio context.",
        "If the question is outside the portfolio, invite the visitor to ask about Hirko's projects, skills, services, or contact details.",
        "Do not invent credentials, prices, private data, or unavailable links.",
        "",
        "Portfolio context:",
        state.context
      ].join("\n")),
      new HumanMessage(`${history ? `Recent chat:\n${history}\n\n` : ""}Visitor question: ${state.question}`)
    ]);

    return { answer: messageText(response), source: "ollama" };
  })
  .addEdge(START, "load_context")
  .addEdge("load_context", "generate_reply")
  .addEdge("generate_reply", END)
  .compile();

router.post("/", async (req, res, next) => {
  try {
    const question = cleanText(req.body?.message);
    if (!question) {
      return res.status(400).json({ message: "Message is required." });
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history.slice(-8).map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: cleanText(item.content).slice(0, 800)
      }))
      : [];

    try {
      const result = await graph.invoke({ question: question.slice(0, 1000), history });
      return res.json({ reply: result.answer || fallbackAnswer(question, result.context), source: result.source });
    } catch (error) {
      console.warn("Ollama chat fallback:", error.message);
      const context = await loadPortfolioContext();
      return res.json({
        reply: fallbackAnswer(question, context),
        source: "fallback",
        warning: "Ollama is not available. Set OLLAMA_BASE_URL and OLLAMA_MODEL to enable AI answers."
      });
    }
  } catch (error) {
    return next(error);
  }
});

export default router;
