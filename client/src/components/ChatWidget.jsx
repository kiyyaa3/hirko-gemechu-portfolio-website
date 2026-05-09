import { useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { apiRequest } from "../lib/api.js";

const starterMessages = [
  {
    role: "assistant",
    content: "Hi, I am Hirko's portfolio assistant. Ask me about projects, skills, services, downloads, or contact details."
  }
];

function fallbackReply(text) {
  const question = text.toLowerCase();

  if (question.includes("hello") || question.includes("helo") || question.includes("hi")) {
    return "Hello. I can help you learn about Hirko Gemechu's projects, skills, services, downloads, and contact details.";
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

  async function sendMessage(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await apiRequest("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(-8)
        })
      });
      setMessages([...nextMessages, { role: "assistant", content: response.reply }]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: fallbackReply(text) }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`chat-widget ${open ? "open" : ""}`}>
      {open ? (
        <section className="chat-panel" aria-label="Portfolio assistant">
          <div className="chat-head">
            <div>
              <span><Bot size={18} /> Hirko Assistant</span>
              <p>Portfolio answers powered by Ollama</p>
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
