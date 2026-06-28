import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { FileAttachment } from "@/components/FileAttachment";
import { ReactionBar } from "@/components/ReactionBar";
import { TypingIndicator } from "@/components/TypingIndicator";
import type { Message, MessageAttachment, Reaction } from "@/types";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  threadCounts: Record<string, number>;
  attachmentsMap: Record<string, MessageAttachment[]>;
  reactionsMap: Record<string, Reaction[]>;
  typingUsers: string[];
  onReply: (message: Message) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

export function MessageList({ messages, currentUserId, threadCounts, attachmentsMap, reactionsMap, typingUsers, onReply, onToggleReaction }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
      {messages.map((msg) => {
        const isOwn = msg.sender_id === currentUserId;
        const replyCount = threadCounts[msg.id] ?? 0;
        const attachments = attachmentsMap[msg.id] ?? [];
        const reactions = reactionsMap[msg.id] ?? [];
        return (
          <div key={msg.id} className="group">
            <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                isOwn ? "bg-accent text-white" : "bg-surface border border-border text-foreground"
              }`}>
                {!isOwn && (
                  <p className="text-xs text-accent font-medium mb-1">{msg.sender_email}</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                {attachments.map((att) => (
                  <FileAttachment key={att.id} attachment={att} />
                ))}
                <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-muted"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {msg.edited_at && " (edited)"}
                </p>
              </div>
            </div>
            <div className={`flex flex-col ${isOwn ? "items-end mr-1" : "items-start ml-1"}`}>
              <ReactionBar
                reactions={reactions}
                currentUserId={currentUserId}
                onToggle={(emoji) => onToggleReaction(msg.id, emoji)}
              />
              <button
                onClick={() => onReply(msg)}
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-muted opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-surface-hover transition-all"
              >
                <MessageSquare className="h-3 w-3" />
                {replyCount > 0 ? `${replyCount} ${replyCount === 1 ? "reply" : "replies"}` : "Reply"}
              </button>
            </div>
          </div>
        );
      })}
      <TypingIndicator names={typingUsers} />
      <div ref={bottomRef} />
    </div>
  );
}
