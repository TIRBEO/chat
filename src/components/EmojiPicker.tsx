import { useRef, useEffect } from "react";

const EMOJIS = ["👍", "❤️", "🔥", "🎉", "😂", "😮", "😢", "🙏", "💯", "🚀", "👀", "🤝"];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="flex gap-1 rounded-xl border border-border bg-surface p-2 shadow-lg">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-surface-hover transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
