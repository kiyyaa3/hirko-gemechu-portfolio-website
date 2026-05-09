import { useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { apiRequest } from "../lib/api.js";

const starterMessages = [
  {
    role: "assistant",
    content: "Hi, I am Hirko's portfolio assistant. Ask me about projects, skills, services, downloads, or contact details."
  }
];

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
        { role: "assistant", content: error.message || "Chat is not available right now. Please use the contact form." }
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
