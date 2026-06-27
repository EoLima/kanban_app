"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import { sendChatMessage } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onBoardChanged: () => void;
};

const SUGGESTIONS = [
  "Create a card in Backlog to write tests",
  "Move the first card in Discovery to In Progress",
  "Add a card to Done for the release notes",
];

export const ChatSidebar = ({ isOpen, onClose, onBoardChanged }: ChatSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(text, history);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);

      if (res.updates.length > 0) {
        onBoardChanged();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, onBoardChanged]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed right-0 top-0 z-50 flex h-full flex-col",
          "w-[400px] border-l border-[var(--stroke)]",
          "bg-white/80 backdrop-blur-xl shadow-2xl",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--stroke)] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-2 w-8 rounded-full bg-[var(--secondary-purple)]" />
            <h2 className="font-display text-lg font-semibold text-[var(--navy-dark)]">
              AI Assistant
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--gray-text)] transition hover:bg-[var(--stroke)] hover:text-[var(--navy-dark)] cursor-pointer"
            aria-label="Close sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4.5 13.5L13.5 4.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && !isTyping && (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <div className="mb-4 h-12 w-12 rounded-2xl bg-[var(--secondary-purple)]/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.54 3.63 1.48 5.12L2 22l4.88-1.48C8.37 21.46 10.12 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="var(--secondary-purple)" opacity="0.8" />
                </svg>
              </div>
              <p className="font-display text-base font-semibold text-[var(--navy-dark)]">
                Ask the AI to manage your board
              </p>
              <p className="mt-2 text-sm text-[var(--gray-text)]">
                Create, move, edit, or delete cards with natural language.
              </p>
              <div className="mt-6 flex flex-col gap-2 w-full max-w-[280px]">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2.5 text-left text-xs font-medium text-[var(--gray-text)] transition hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)] cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={clsx(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6",
                    msg.role === "user"
                      ? "bg-[var(--secondary-purple)] text-white rounded-br-md"
                      : "border border-[var(--stroke)] bg-white text-[var(--navy-dark)] rounded-bl-md",
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-[var(--stroke)] bg-white px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--gray-text)]" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--gray-text)]" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--gray-text)]" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-[var(--stroke)] px-4 py-4">
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-white px-4 py-2 focus-within:border-[var(--primary-blue)] transition">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI to manage cards..."
              disabled={isTyping}
              className="flex-1 bg-transparent text-sm text-[var(--navy-dark)] outline-none placeholder:text-[var(--gray-text)]"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="rounded-full bg-[var(--secondary-purple)] p-2 text-white transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1.5 8L14.5 1.5L10 8L14.5 14.5L1.5 8Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
