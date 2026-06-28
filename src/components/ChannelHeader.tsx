import { Hash, Lock, VolumeX, Search } from "lucide-react";
import type { Channel } from "@/types";

interface ChannelHeaderProps {
  channel: Channel;
  onSearchClick?: () => void;
}

const iconMap = {
  text: Hash,
  announcement: VolumeX,
  thread: Hash,
  private: Lock,
};

export function ChannelHeader({ channel, onSearchClick }: ChannelHeaderProps) {
  const Icon = iconMap[channel.type];

  return (
    <div className="flex items-center gap-3 border-b border-border px-6 py-3">
      <Icon className="h-5 w-5 text-muted" />
      <span className="font-semibold text-foreground">{channel.name}</span>
      {channel.topic && (
        <span className="text-sm text-muted truncate hidden sm:block">— {channel.topic}</span>
      )}
      <div className="flex-1" />
      <button
        onClick={onSearchClick}
        className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors border border-border"
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}
