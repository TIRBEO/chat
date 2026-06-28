import { useState } from "react";
import { Hash, Lock, VolumeX, Plus, LogOut, MessageSquare } from "lucide-react";
import type { Channel } from "@/types";

const channelIcon = (type: Channel["type"]) => {
  switch (type) {
    case "announcement": return VolumeX;
    case "private": return Lock;
    default: return Hash;
  }
};

interface ChannelSidebarProps {
  channels: Channel[];
  activeChannelId: string | null;
  onSelect: (channel: Channel) => void;
  onCreateClick: () => void;
  displayName: string;
  onLogout: () => void;
}

export function ChannelSidebar({ channels, activeChannelId, onSelect, onCreateClick, displayName, onLogout }: ChannelSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="flex w-14 flex-col items-center border-r border-border bg-surface py-3 gap-3">
        <button onClick={() => setCollapsed(false)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-hover text-muted hover:text-foreground">
          <MessageSquare className="h-5 w-5" />
        </button>
        {channels.map((ch) => {
          const Icon = channelIcon(ch.type);
          return (
            <button key={ch.id} onClick={() => onSelect(ch)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                ch.id === activeChannelId ? "bg-accent text-white" : "hover:bg-surface-hover text-muted hover:text-foreground"
              }`}
              title={ch.name}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Channels</span>
        <button onClick={() => setCollapsed(true)} className="text-muted hover:text-foreground text-xs p-1">▲</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {channels.map((ch) => {
          const Icon = channelIcon(ch.type);
          return (
            <button key={ch.id} onClick={() => onSelect(ch)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                ch.id === activeChannelId ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{ch.name}</span>
            </button>
          );
        })}
      </div>
      <div className="p-2 border-t border-border">
        <button onClick={onCreateClick}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Channel
        </button>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <span className="text-xs text-muted truncate max-w-[140px]">{displayName}</span>
        <button onClick={onLogout} className="text-muted hover:text-foreground p-1">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
