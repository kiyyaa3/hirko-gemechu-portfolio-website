import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import SiteContent from "../models/SiteContent.js";
import Project from "../models/Project.js";
import Post from "../models/Post.js";
import Testimonial from "../models/Testimonial.js";
import ChatMessage from "../models/ChatMessage.js";
import Message from "../models/Message.js";
import KnowledgeEntry from "../models/KnowledgeEntry.js";
import { requireAdmin } from "../middleware/auth.js";
import { sendChatNotification } from "../services/email.js";
import { extractDocxText } from "../utils/docxText.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function cleanSessionId(value = "") {
  const sessionId = cleanText(value).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return sessionId || `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function truncateText(value = "", maxLength = 4500) {
  const text = cleanText(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function extractProfileLinks(value = "") {
  return Array.from(new Set(String(value).match(/(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com|facebook\.com)\/[^\s,;]+/gi) || []));
}

async function saveChatExchange(req, { sessionId, question, answer, source, history }) {
  try {
    const previousMessages = await ChatMessage.countDocuments({ sessionId });
    const chatMessage = await ChatMessage.create({
      sessionId,
      question,
      answer,
      source,
      history,
      visitorIp: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: String(req.headers["user-agent"] || "").slice(0, 300)
    });

    return { chatMessage, isFirstMessage: previousMessages === 0 };
  } catch (error) {
    console.warn("Chat log was not saved:", error.message);
    return { chatMessage: null, isFirstMessage: false };
  }
}

function notifyFirstChatMessage(savedChat) {
  if (!savedChat?.isFirstMessage || !savedChat.chatMessage) return;

  sendChatNotification(savedChat.chatMessage).catch((error) => {
    console.warn("Chat email notification failed:", error.message);
  });
}

async function loadPortfolioContext() {
  const [content, projects, posts, testimonials, knowledgeEntries, contactStats] = await Promise.all([
    SiteContent.findOne().lean(),
    Project.find().sort({ sortOrder: 1, createdAt: -1 }).limit(8).lean(),
    Post.find({ published: true }).sort({ sortOrder: 1, publishedAt: -1 }).limit(5).lean(),
    Testimonial.find({ public: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(5).lean(),
    KnowledgeEntry.find({ public: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(30).lean(),
    loadContactStats()
  ]);

  const projectLines = projects.map((project) => (
    `Project: ${project.title}. Category: ${project.category}. Description: ${cleanText(project.description)}. Tech: ${(project.technologies || []).join(", ")}.`
  ));
  const postLines = posts.map((post) => `Post: ${post.title}. ${cleanText(post.excerpt)}`);
  const proofLines = testimonials.map((item) => `${item.type}: ${item.name}. ${cleanText(item.quote)}`);
  const knowledgeLines = knowledgeEntries.map((entry) => (
    `Knowledge Q&A: ${entry.question}. Answer: ${cleanText(entry.answer)}${entry.sourceUrl ? ` Source: ${entry.sourceUrl}` : ""}${entry.aliases?.length ? ` Related questions: ${entry.aliases.join(", ")}` : ""}`
  ));
  const serviceLines = (content?.services || []).map((service) => `${service.title}: ${service.description}`);
  const skillLines = (content?.skillGroups || []).map((group) => `${group.title}: ${(group.items || []).join(", ")}`);
  const downloadLines = (content?.publicDownloads || []).map((download) => (
    `Download: ${download.title}. Category: ${download.category}. Description: ${download.description}. File: ${download.fileUrl}.`
  ));
  const socialLines = (content?.links || []).filter((link) => link?.url).map((link) => `${link.label}: ${link.url}`);
  const cvText = await loadCvText(content);
  const cvProfileLinks = extractProfileLinks(cvText);

  return [
    `Name: ${content?.headerTitle || "Hirko Gemechu"}`,
    `Role: ${content?.headerSubtitle || "MERN Developer"}`,
    `Hero summary: ${cleanText(content?.heroTitle || "")} ${cleanText(content?.heroBody || "")}`,
    `About: ${cleanText(content?.aboutBody || "")}`,
    `Services: ${serviceLines.join(" | ")}`,
    `Skills: ${skillLines.join(" | ")}`,
    `Contact: ${content?.email || ""} ${content?.phone || ""} ${content?.location || ""}`,
    contactStats ? `Website contact database stats: ${contactStats}.` : "",
    `Verified social/profile links listed on the website: ${socialLines.join(" | ") || "No public social links listed."}`,
    cvProfileLinks.length ? `Social/profile links found in the public CV: ${cvProfileLinks.join(" | ")}` : "",
    ...downloadLines,
    cvText ? `CV text extracted from public CV file: ${truncateText(cvText)}` : "",
    ...knowledgeLines,
    ...projectLines,
    ...postLines,
    ...proofLines
  ].filter(Boolean).join("\n");
}

async function loadContactStats() {
  try {
    const total = await Message.countDocuments();
    return `total contact messages ${total}`;
  } catch (error) {
    console.warn("Contact stats unavailable for chat context:", error.message);
    return "";
  }
}

async function loadCvText(content) {
  const downloads = content?.publicDownloads || [];
  const cvDownload = downloads.find((download) => (
    /cv|resume/i.test(`${download?.title || ""} ${download?.category || ""} ${download?.fileUrl || ""}`)
    && /\.docx($|\?)/i.test(download?.fileUrl || "")
  ));

  const fileUrl = cvDownload?.fileUrl || "/starter/hirko-gemechu-cv.docx";
  const filePath = resolvePublicFilePath(fileUrl);
  return filePath ? extractDocxText(filePath) : "";
}

function resolvePublicFilePath(fileUrl = "") {
  const value = String(fileUrl).trim();
  if (!value || /^(https?:|data:|blob:)/i.test(value)) return "";

  if (value.startsWith("/starter/")) {
    return path.resolve(__dirname, "../../../client/public", value.slice(1));
  }

  if (value.startsWith("/uploads/")) {
    return path.resolve(__dirname, "../..", value.slice(1));
  }

  return "";
}

function fallbackAnswer(question, context) {
  const lower = question.toLowerCase();
  const lines = context.split("\n").filter(Boolean);
  const cvSummary = extractContextBlock(context, "CV text extracted from public CV file");
  const websiteSocial = extractContextLine(context, "Verified social/profile links listed on the website");
  const cvSocial = extractContextLine(context, "Social/profile links found in the public CV");
  const skills = extractContextLine(context, "Skills");
  const contact = extractContextLine(context, "Contact");
  const contactStats = extractContextLine(context, "Website contact database stats");
  const projects = lines.filter((line) => line.startsWith("Project:")).slice(0, 4);
  const downloads = lines.filter((line) => line.startsWith("Download:")).slice(0, 4);
  const knowledgeAnswer = findKnowledgeAnswer(question, lines);

  if (knowledgeAnswer) {
    return knowledgeAnswer;
  }

  if (lower.includes("gpa") || lower.includes("cgpa")) {
    const gpa = extractGpa(cvSummary);
    return gpa
      ? `Hirko's public CV lists a BSc CGPA of ${gpa} from Arba Minch University.`
      : "I could not find a GPA in the public portfolio context.";
  }

  if (isContactStatsQuestion(lower)) {
    return contactStats
      ? contactStats
      : "I could not read the contact-message count from the database right now.";
  }

  if (/\b(hi|hello|helo|hey)\b/.test(lower)) {
    return "Hello. I am Hirko Gemechu's portfolio assistant. You can ask me about Hirko, his skills, projects, services, downloads, or contact details.";
  }

  if (lower.includes("cv") || lower.includes("resume") || lower.includes("education") || lower.includes("graduate")) {
    if (cvSummary) {
      return `From Hirko's public CV: ${truncateText(cvSummary, 900)}`;
    }
    return "Hirko's CV is available in the Downloads section. You can ask me about his skills, projects, education, or contact details.";
  }

  if (lower.includes("social") || lower.includes("linkedin") || lower.includes("github") || lower.includes("facebook") || lower.includes("profile")) {
    return [
      websiteSocial ? `Website-listed profile links: ${websiteSocial}.` : "",
      cvSocial ? `Profile links found in the public CV: ${cvSocial}.` : "",
      "I only use links listed on this website or in the public CV, so I do not invent social media details."
    ].filter(Boolean).join(" ");
  }

  if (
    lower.includes("who is hirko")
    || lower.includes("who is hirko gemechu")
    || lower.includes("about hirko")
    || lower.includes("tell me about hirko")
    || lower.includes("hirko gemechu")
  ) {
    return "Hirko Gemechu is a software engineer and MERN developer who builds clean websites, dashboards, business systems, portfolio sites, and database-backed web applications. He also has practical technical support experience.";
  }

  if (lower.includes("contact") || lower.includes("email") || lower.includes("phone")) {
    return contact
      ? `You can contact Hirko through the contact section. Listed contact details: ${contact}.`
      : "You can contact Hirko Gemechu from the contact section of this site. The portfolio lists email, phone, and a message form for project or job opportunities.";
  }

  if (lower.includes("service") || lower.includes("build") || lower.includes("offer")) {
    return "Hirko Gemechu offers web development, business systems, dashboards, responsive portfolio/company sites, database-backed workflows, and technical support solutions.";
  }

  if (lower.includes("project") || lower.includes("work")) {
    return projects.length
      ? `Here are projects from the portfolio: ${projects.join(" ")}`
      : "Hirko Gemechu builds responsive websites, dashboards, portfolio systems, and practical business tools. You can see the latest project showcase in the Projects section.";
  }

  if (lower.includes("skill") || lower.includes("tech")) {
    return skills
      ? `Hirko's listed skills include: ${skills}.`
      : "Hirko works with React, JavaScript, Node.js, Express, MongoDB, PHP, MySQL, responsive UI, REST APIs, dashboards, and support workflows.";
  }

  if (lower.includes("download") || lower.includes("certificate") || lower.includes("file")) {
    return downloads.length
      ? `Available downloads: ${downloads.join(" ")}`
      : "The Downloads section includes Hirko's CV and certificate files when they are published.";
  }

  return `I can answer questions about Hirko Gemechu, projects, skills, services, downloads, and contact details. ${context ? "Ask me about the portfolio or available services." : ""}`;
}

function findKnowledgeAnswer(question, lines) {
  const normalizedQuestion = normalizeSearchText(question);
  const entries = lines
    .filter((line) => line.startsWith("Knowledge Q&A:"))
    .map(parseKnowledgeLine)
    .filter(Boolean);

  const exact = entries.find((entry) => (
    normalizeSearchText(entry.question) === normalizedQuestion
    || entry.aliases.some((alias) => normalizeSearchText(alias) === normalizedQuestion)
  ));
  if (exact) return withSource(exact);

  const scored = entries
    .map((entry) => {
      const haystack = normalizeSearchText([entry.question, ...entry.aliases].join(" "));
      const score = normalizedQuestion.split(" ").filter((word) => word.length > 2 && haystack.includes(word)).length;
      return { entry, score };
    })
    .filter((item) => item.score >= 2)
    .sort((a, b) => b.score - a.score);

  return scored[0] ? withSource(scored[0].entry) : "";
}

function parseKnowledgeLine(line) {
  const match = line.match(/^Knowledge Q&A: (.*?)\. Answer: (.*?)(?: Source: (.*?))?(?: Related questions: (.*))?$/);
  if (!match) return null;

  return {
    question: match[1] || "",
    answer: match[2] || "",
    sourceUrl: match[3] || "",
    aliases: (match[4] || "").split(",").map((item) => item.trim()).filter(Boolean)
  };
}

function normalizeSearchText(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function extractGpa(text = "") {
  const match = text.match(/\b(?:CGPA|GPA)\s*[:,-]?\s*([0-9]+(?:\.[0-9]+)?)/i);
  return match ? match[1] : "";
}

function isContactStatsQuestion(lower = "") {
  const wantsCount = /\b(how many|count|total|number)\b/.test(lower);
  const mentionsPeople = /\b(man|men|person|people|visitor|customer|client|user|users|contacts?)\b/.test(lower);
  const mentionsContact = /\b(contact|message|messaged|submit|submitted|through this website|through this system)\b/.test(lower);
  return wantsCount && mentionsPeople && mentionsContact;
}

function withSource(entry) {
  return entry.sourceUrl ? `${entry.answer} Source: ${entry.sourceUrl}` : entry.answer;
}

function extractContextLine(context, label) {
  const line = context.split("\n").find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line ? line.slice(label.length + 1).trim() : "";
}

function extractContextBlock(context, label) {
  const start = `${label}:`;
  const startIndex = context.indexOf(start);
  if (startIndex < 0) return "";

  const afterStart = startIndex + start.length;
  const nextIndex = context.slice(afterStart).search(/\n(?:Project|Post|Download|Verified|Social|Contact|Skills|Services):/);
  const raw = nextIndex >= 0
    ? context.slice(afterStart, afterStart + nextIndex)
    : context.slice(afterStart);
  return raw.trim();
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
        "Answer warmly, briefly, and only from the portfolio context, extracted CV text, projects, downloads, testimonials, posts, and listed social/profile links.",
        "When asked how many people contacted Hirko, show only the total contact message count from the website database. Do not reveal history, statuses, names, emails, phone numbers, or message contents.",
        "Treat listed social/profile links as cross-check links, but do not claim details from LinkedIn, Facebook, or other social sites unless those details appear in the provided context.",
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

router.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const chatMessages = await ChatMessage.find().sort({ createdAt: -1 }).limit(100).lean();
    return res.json(chatMessages);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const question = cleanText(req.body?.message);
    if (!question) {
      return res.status(400).json({ message: "Message is required." });
    }
    const sessionId = cleanSessionId(req.body?.sessionId);

    const history = Array.isArray(req.body?.history)
      ? req.body.history.slice(-8).map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: cleanText(item.content).slice(0, 800)
      }))
      : [];

    try {
      const result = await graph.invoke({ question: question.slice(0, 1000), history });
      const reply = result.answer || fallbackAnswer(question, result.context);
      const savedChat = await saveChatExchange(req, { sessionId, question, answer: reply, source: result.source, history });
      notifyFirstChatMessage(savedChat);
      return res.json({ reply, source: result.source, sessionId });
    } catch (error) {
      console.warn("Ollama chat fallback:", error.message);
      const context = await loadPortfolioContext();
      const reply = fallbackAnswer(question, context);
      const savedChat = await saveChatExchange(req, { sessionId, question, answer: reply, source: "fallback", history });
      notifyFirstChatMessage(savedChat);
      return res.json({
        reply,
        source: "fallback",
        sessionId,
        warning: "Ollama is not available. Set OLLAMA_BASE_URL and OLLAMA_MODEL to enable AI answers."
      });
    }
  } catch (error) {
    return next(error);
  }
});

export default router;
