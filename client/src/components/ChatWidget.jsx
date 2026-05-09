import { useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { apiRequest } from "../lib/api.js";

const starterMessages = [
  {
    role: "assistant",
    content: "Hi, I am Hirko's portfolio assistant. Ask me about projects, skills, services, downloads, or contact details."
  }
];

const quickQuestions = [
  "Who is Hirko Gemechu?",
  "What services do you offer?",
  "What skills do you have?",
  "How can I contact you?"
];

function fallbackReply(text) {
  const question = text.toLowerCase();

  if (question.includes("hello") || question.includes("helo") || question.includes("hi")) {
    return "Hello. I can help you learn about Hirko Gemechu's projects, skills, services, downloads, and contact details.";
  }

  if (
    question.includes("who is hirko")
    || question.includes("who is hirko gemechu")
    || question.includes("about hirko")
    || question.includes("tell me about hirko")
    || question.includes("hirko gemechu")
  ) {
    return "Hirko Gemechu is a software engineer and MERN developer who builds clean websites, dashboards, business systems, portfolio sites, and database-backed web applications. He also has practical technical support experience.";
  }

  if (question.includes("service") || question.includes("build") || question.includes("offer")) {
    return "Hirko Gemechu offers web development, dashboards, portfolio/company sites, business systems, database-backed workflows, and technical support solutions.";
  }

  if (question.includes("skill") || question.includes("tech")) {
    return "Hirko works with React, JavaScript, Node.js, Express, MongoDB, PHP, MySQL, REST APIs, responsive UI, dashboards, and support workflows.";
  }

  if (question.includes("project") || question.includes("work")) {
    return "Hirko builds responsive websites, dashboards, portfolio systems, and practical business tools. The Projects section shows the latest work.";
  }

  if (question.includes("contact") || question.includes("email") || question.includes("phone")) {
    return "You can contact Hirko through the contact form, email button, or phone button on this portfolio.";
  }

  if (question.includes("download") || question.includes("cv") || question.includes("certificate")) {
    return "The Downloads section includes Hirko's CV and certificate files when they are published.";
  }

  return "I can help with Hirko Gemechu's portfolio, projects, skills, services, downloads, and contact details.";
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function askQuestion(text) {
    const question = text.trim();
    if (!question || loading) return;

    const nextMessages = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await apiRequest("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: question,
          history: nextMessages.slice(-8)
        })
      });
      const reply = response.reply || "";
      const genericReply = reply.includes("I can answer questions about Hirko Gemechu");
      setMessages([...nextMessages, { role: "assistant", content: genericReply ? fallbackReply(question) : reply }]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: fallbackReply(question) }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    await askQuestion(input);
  }

  return (
    <div className={`chat-widget ${open ? "open" : ""}`}>
      {open ? (
        <section className="chat-panel" aria-label="Portfolio assistant">
          <div className="chat-head">
            <div>
              <span><Bot size={18} /> Hirko Assistant</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {loading ? (
              <div className="chat-bubble assistant loading"><Loader2 size={16} /> Thinking...</div>
            ) : null}
          </div>
          <div className="chat-quick-actions">
            {quickQuestions.map((question) => (
              <button key={question} type="button" onClick={() => askQuestion(question)} disabled={loading}>
                {question}
              </button>
            ))}
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about Hirko..."
              aria-label="Ask the portfolio assistant"
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send message"><Send size={18} /></button>
          </form>
        </section>
      ) : null}
      <button className="chat-fab" type="button" onClick={() => setOpen(!open)} aria-label="Open chat">
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
