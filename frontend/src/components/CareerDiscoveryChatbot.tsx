"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, User, Sparkles, Compass, RefreshCw, MessageSquare } from "lucide-react";
import api from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: string;
}

interface CareerDiscoveryChatbotProps {
  roles?: { roleId: string; name: string; requiredSkills: string[] }[];
}

export default function CareerDiscoveryChatbot({ roles = [] }: CareerDiscoveryChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your **Career Discovery AI Assistant**. Ask me anything about exploring career paths, understanding why skills are required, or finding roles that match your style!",
      source: "Career Navigator Assistant",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      api
        .get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.data) {
            setUserProfile({
              name: res.data.name,
              skills: res.data.profile?.skills || [],
              education: res.data.profile?.education || [],
              experience: res.data.profile?.experience || [],
              interests: res.data.profile?.interests || [],
            });
          }
        })
        .catch((err) => console.error("Could not fetch profile for chatbot:", err));
    }
  }, []);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "assistant",
          text: "Please log in to use the Career Discovery AI Assistant.",
        },
      ]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: queryText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await api.post(
        "/ai/career-discovery",
        {
          query: queryText.trim(),
          userProfile,
          availableRoles: roles.map((r) => ({
            roleId: r.roleId,
            name: r.name,
            requiredSkills: r.requiredSkills,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: response.data?.response || "I couldn't generate a response. Please try again.",
        source: response.data?.source,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error("Chatbot error:", err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "Sorry, I ran into an issue connecting to the service. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const presetQuestions = [
    "I like coding but I don't want a career with too much coding. What careers can I explore?",
    "Which career path matches my current profile skills best?",
    "Why is a specific skill required for a frontend or cloud role?",
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-[#0B1120] p-6 shadow-2xl my-8">
      {/* Glow background */}
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🧭 Career Discovery Assistant
            </h2>
            <p className="text-xs text-slate-400">
              Ask AI about tailored career paths, skill requirements, or personal exploration
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
          AI Powered
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="my-4 h-[320px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs ${
                msg.sender === "user"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800 border-slate-700 text-blue-400"
              }`}
            >
              {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={`max-w-[82%] rounded-xl p-4 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600/90 text-white"
                  : "bg-[#060B16] border border-slate-800 text-slate-200"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.source && (
                <div className="mt-2 text-[10px] text-slate-500 text-right font-mono">
                  via {msg.source}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-blue-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-xl bg-[#060B16] border border-slate-800 p-4 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-400" />
              <span>Analyzing profile & career opportunities...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Suggestion Chips */}
      <div className="my-3 flex flex-wrap gap-2">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#060B16] px-3 py-1.5 text-[11px] text-slate-300 hover:border-blue-500/40 hover:text-blue-400 transition"
          >
            <MessageSquare className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-none">{q}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Ask anything about career options, skill doubts, or profile matching..."
          className="flex-1 rounded-xl border border-slate-800 bg-[#060B16] px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition shrink-0 cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
