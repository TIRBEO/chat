import { useEffect, useRef, useState } from "react";
import { X, Send, MessageSquare } from "lucide-react";
import type { Message } from "@/types";

interface ThreadPanelProps {
  parentMessage: Message;
  messages: Message[];
  currentUserId: string;
  onSend: (content: string) => void;
  onClose: () => void;
}

export function ThreadPanel({ parentMessage, messages, currentUserId, onSend, onClose }: ThreadPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex w-96 flex-col border-l border-border bg-surface">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted" />
          <span className="text-sm font-semibold text-foreground">Thread</span>
        </div>
        <button onClick={onClose} className="text-muted hover:text-foreground p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-accent font-medium mb-1">{parentMessage.sender_email}</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{parentMessage.content}</p>
          <p className="text-[10px] text-muted mt-2">
            {new Date(parentMessage.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="border-t border-border pt-3 space-y-3">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  isOwn ? "bg-accent text-white" : "bg-background border border-border text-foreground"
                }`}>
                  {!isOwn && (
                    <p className="text-xs text-accent font-medium mb-1">{msg.sender_email}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-muted"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-border px-4 py-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Reply in thread..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-xl bg-accent px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
