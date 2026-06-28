import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { EmojiPicker } from "@/components/EmojiPicker";
import type { Reaction } from "@/types";

interface ReactionBarProps {
  reactions: Reaction[];
  currentUserId: string;
  onToggle: (emoji: string) => void;
}

export function ReactionBar({ reactions, currentUserId, onToggle }: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false);

  const grouped = reactions.reduce<Record<string, { count: number; hasMine: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasMine: false };
    acc[r.emoji].count++;
    if (r.user_id === currentUserId) acc[r.emoji].hasMine = true;
    return acc;
  }, {});

  if (Object.keys(grouped).length === 0 && !showPicker) return null;

  return (
    <div className="flex items-center gap-1 mt-1.5 flex-wrap relative">
      {Object.entries(grouped).map(([emoji, { count, hasMine }]) => (
        <button
          key={emoji}
          onClick={() => onToggle(emoji)}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
            hasMine
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:bg-surface-hover"
          }`}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </button>
      ))}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
      >
        <SmilePlus className="h-3.5 w-3.5" />
      </button>
      {showPicker && (
        <div className="absolute top-8 left-0 z-10">
          <EmojiPicker
            onSelect={(emoji) => { onToggle(emoji); setShowPicker(false); }}
            onClose={() => setShowPicker(false)}
          />
        </div>
      )}
    </div>
  );
}
