import { useState, useRef, useEffect } from "react";
import { Search, X, MessageSquare } from "lucide-react";
import { searchMessages } from "@/lib/channels";
import type { Channel, Message } from "@/types";

interface SearchModalProps {
  activeChannel: Channel;
  onSelectMessage: (message: Message) => void;
  onClose: () => void;
}

export function SearchModal({ activeChannel, onSelectMessage, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      const msgs = await searchMessages(activeChannel.id, query.trim());
      setResults(msgs);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeChannel.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search in #${activeChannel.name}...`}
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <p className="p-3 text-sm text-muted text-center">Searching...</p>
          )}
          {!loading && query && results.length === 0 && (
            <p className="p-3 text-sm text-muted text-center">No results found.</p>
          )}
          {results.map((msg) => (
            <button
              key={msg.id}
              onClick={() => onSelectMessage(msg)}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface-hover transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-muted mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-accent font-medium">{msg.sender_email}</p>
                <p className="text-sm text-foreground truncate">{msg.content}</p>
                <p className="text-[10px] text-muted mt-0.5">
                  {new Date(msg.created_at).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
