import { useState } from "react";
import { X } from "lucide-react";
import type { Channel } from "@/types";

interface CreateChannelModalProps {
  onClose: () => void;
  onCreate: (name: string, type: Channel["type"], topic: string) => void;
}

export function CreateChannelModal({ onClose, onCreate }: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<Channel["type"]>("text");
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), type, topic.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Create Channel</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. design-talk"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:border-accent"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Channel["type"])}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
            >
              <option value="text">Text</option>
              <option value="announcement">Announcement</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Topic (optional)</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What's this channel about?"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm text-muted hover:text-foreground">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
