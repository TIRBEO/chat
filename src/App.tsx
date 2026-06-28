import { useEffect, useState, useCallback } from "react";
import { getSession, setSession, clearSession, decodeSession } from "@/lib/session";
import { getChannels, getMessages, getThreadMessages, getThreadCounts, sendMessage, sendMessageWithAttachment, createChannel, subscribeToMessages, subscribeToThread, getAttachmentsForMessages, getReactions, toggleReaction } from "@/lib/channels";
import { uploadFile } from "@/lib/storage";
import { subscribeTyping, sendTyping } from "@/lib/typing";
import type { AppSession, Channel, Message, MessageAttachment, Reaction } from "@/types";
import { ChannelSidebar } from "@/components/ChannelSidebar";
import { ChannelHeader } from "@/components/ChannelHeader";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { ThreadPanel } from "@/components/ThreadPanel";
import { CreateChannelModal } from "@/components/CreateChannelModal";
import { SearchModal } from "@/components/SearchModal";
import { Loader2, MessageSquare } from "lucide-react";
import { ACCOUNTS_URL } from "@/lib/config";

export default function ChatApp() {
  const [session, setSessionState] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadCounts, setThreadCounts] = useState<Record<string, number>>({});
  const [threadParent, setThreadParent] = useState<Message | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [attachmentsMap, setAttachmentsMap] = useState<Record<string, MessageAttachment[]>>({});
  const [reactionsMap, setReactionsMap] = useState<Record<string, Reaction[]>>({});
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("session");
    if (encoded) {
      const appSession = decodeSession(encoded);
      if (appSession) {
        setSession(appSession);
        setSessionState(appSession);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    const stored = getSession();
    setSessionState(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!session) return;
    getChannels().then((data) => {
      setChannels(data);
      if (data.length > 0 && !activeChannel) {
        setActiveChannel(data[0]);
      }
    });
  }, [session]);

  // --- Load messages, attachments, reactions for active channel ---
  useEffect(() => {
    if (!activeChannel) return;
    setThreadParent(null);
    setThreadMessages([]);
    setTypingUsers([]);

    getMessages(activeChannel.id).then((msgs) => {
      setMessages(msgs);
      const ids = msgs.map((m) => m.id);
      if (ids.length === 0) return;
      getAttachmentsForMessages(ids).then(setAttachmentsMap);
      getReactions(ids).then((reactions) => {
        const map: Record<string, Reaction[]> = {};
        reactions.forEach((r) => {
          if (!map[r.message_id]) map[r.message_id] = [];
          map[r.message_id].push(r);
        });
        setReactionsMap(map);
      });
    });
    getThreadCounts(activeChannel.id).then(setThreadCounts);

    const sub = subscribeToMessages(activeChannel.id, (msg) => {
      if (msg.thread_parent_id) {
        const pid = msg.thread_parent_id;
        setThreadCounts((prev) => ({ ...prev, [pid]: (prev[pid] ?? 0) + 1 }));
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => { sub.unsubscribe().catch(() => {}); };
  }, [activeChannel]);

  // --- Subscribe to typing for active channel ---
  useEffect(() => {
    if (!activeChannel || !session?.user) return;
    const unsub = subscribeTyping(
      activeChannel.id,
      session.user.id,
      ({ userName, typing }) => {
        setTypingUsers((prev) => {
          if (typing) return prev.includes(userName) ? prev : [...prev, userName];
          return prev.filter((n) => n !== userName);
        });
      },
    );
    return unsub;
  }, [activeChannel, session?.user.id]);

  // --- Thread subscription ---
  useEffect(() => {
    if (!threadParent) return;
    getThreadMessages(threadParent.id).then(setThreadMessages);
    const sub = subscribeToThread(threadParent.id, (msg) => {
      setThreadMessages((prev) => [...prev, msg]);
    });
    return () => { sub.unsubscribe().catch(() => {}); };
  }, [threadParent]);

  const handleSend = useCallback(async (content: string) => {
    if (!activeChannel || !session?.user) return;
    await sendMessage(activeChannel.id, content, session.user.id, session.user.email);
  }, [activeChannel, session]);

  const handleFileAttach = useCallback(async (file: File) => {
    if (!activeChannel || !session?.user) return;
    const storagePath = await uploadFile(file);
    await sendMessageWithAttachment(
      activeChannel.id,
      file.name,
      session.user.id,
      session.user.email,
      { name: file.name, size: file.size, type: file.type, storagePath },
    );
  }, [activeChannel, session]);

  const handleThreadReply = useCallback(async (content: string) => {
    if (!activeChannel || !threadParent || !session?.user) return;
    await sendMessage(activeChannel.id, content, session.user.id, session.user.email, threadParent.id);
  }, [activeChannel, threadParent, session]);

  const handleReply = useCallback((msg: Message) => {
    setThreadParent(msg);
  }, []);

  const handleToggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!session?.user) return;
    await toggleReaction(messageId, session.user.id, emoji);
    const reactions = await getReactions([messageId]);
    setReactionsMap((prev) => ({ ...prev, [messageId]: reactions }));
  }, [session]);

  const handleCreateChannel = useCallback(async (name: string, type: Channel["type"], topic: string) => {
    if (!session?.user) return;
    try {
      const channel = await createChannel(name, type, topic, session.user.id);
      setChannels((prev) => [...prev, channel]);
      setActiveChannel(channel);
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create channel:", err);
    }
  }, [session]);

  const handleSelectSearchResult = useCallback((msg: Message) => {
    setActiveChannel(channels.find((c) => c.id === msg.channel_id) ?? activeChannel);
    setShowSearch(false);
  }, [channels, activeChannel]);

  const handleLogout = () => {
    clearSession();
    setSessionState(null);
    window.location.href = ACCOUNTS_URL;
  };

  const handleType = useCallback(() => {
    if (!activeChannel || !session?.user) return;
    sendTyping(activeChannel.id, session.user.id, session.user.displayName || session.user.email, true);
  }, [activeChannel, session]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <MessageSquare className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Tirbeo Chat</h1>
          <p className="text-muted">Sign in to start chatting.</p>
          <a
            href={`${ACCOUNTS_URL}/login?redirect_to=${encodeURIComponent(window.location.origin)}`}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <ChannelSidebar
        channels={channels}
        activeChannelId={activeChannel?.id ?? null}
        onSelect={setActiveChannel}
        onCreateClick={() => setShowCreate(true)}
        displayName={session.user.displayName || session.user.email}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 flex-col min-w-0">
        {activeChannel ? (
          <>
            <ChannelHeader channel={activeChannel} onSearchClick={() => setShowSearch(true)} />
            <MessageList
              messages={messages}
              currentUserId={session.user.id}
              threadCounts={threadCounts}
              attachmentsMap={attachmentsMap}
              reactionsMap={reactionsMap}
              typingUsers={typingUsers}
              onReply={handleReply}
              onToggleReaction={handleToggleReaction}
            />
            {activeChannel.type !== "announcement" && (
              <MessageInput onSend={handleSend} onFileAttach={handleFileAttach} onType={handleType} />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Select a channel to start chatting
          </div>
        )}
      </div>
      {threadParent && (
        <ThreadPanel
          parentMessage={threadParent}
          messages={threadMessages}
          currentUserId={session.user.id}
          onSend={handleThreadReply}
          onClose={() => setThreadParent(null)}
        />
      )}
      {showCreate && (
        <CreateChannelModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateChannel}
        />
      )}
      {showSearch && activeChannel && (
        <SearchModal
          activeChannel={activeChannel}
          onSelectMessage={handleSelectSearchResult}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
}


