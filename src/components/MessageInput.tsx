import { useState, useRef } from "react";
import { Send, Paperclip } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  onFileAttach?: (file: File) => void;
  onType?: () => void;
  placeholder?: string;
}

export function MessageInput({ onSend, onFileAttach, onType, placeholder = "Type your message..." }: MessageInputProps) {
  const [input, setInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const handleChange = (value: string) => {
    setInput(value);
    onType?.();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onFileAttach) {
      onFileAttach(file);
    } else {
      onSend(`📎 ${file.name} (uploaded)`);
    }
    e.target.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border px-6 py-4">
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:border-accent transition-colors"
        />
        <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-border px-3 py-2.5 text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
