// src/pages/ChatPage.jsx
import { useParams } from "react-router-dom";
import { personas } from "../services/personas";
import { useMemo, useState } from "react";

export default function ChatPage() {
  const { personaId } = useParams();
  const persona = useMemo(
    () => personas.find((p) => p.id === personaId),
    [personaId],
  );
  const [messages, setMessages] = useState([]); // start with no system line
  const [input, setInput] = useState("");

  if (!persona) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Persona not found</h1>
        <p className="text-gray-600">
          The selected mentor is unavailable. Please go back and choose another.
        </p>
      </div>
    );
  }

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    // Placeholder AI reply for prototype
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Thanks for sharing. Let's break this down step by step.`,
        },
      ]);
    }, 300);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{persona.name}</h1>
        <p className="text-gray-600">
          {persona.field} • {persona.tagline}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white border rounded-lg p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">
            Start the conversation by asking a question.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <div
              className={`inline-block px-3 py-2 rounded-lg ${m.role === "user" ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded-md px-3 py-2"
          placeholder={`Ask ${persona.name} for guidance...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-primary text-white px-4 py-2 rounded-md">
          Send
        </button>
      </form>
    </div>
  );
}
