import { useEffect, useState } from "react";
import { appsSupabase } from "@/lib/apps-db";
import { getSession, setSession, clearSession, decodeSession, type AppSession } from "@/lib/session";
import { MessageSquare, Send, LogOut, User, Loader2 } from "lucide-react";
import { ACCOUNTS_URL } from "@/lib/config";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_email: string;
  created_at: string;
}

export default function ChatApp() {
  const [session, setSessionState] = useState<AppSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("session");
    if (encoded) {
      const appSession = decodeSession(encoded);
      if (appSession) {
        setSession(appSession);
        setSessionState(appSession);
        window.history.replaceState({}, "", window.location.pathname);
        setLoading(false);
        return;
      }
    }

    const stored = getSession();
    setSessionState(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!session) return;

    appsSupabase.from("messages").select("*").order("created_at", { ascending: true }).then(({ data }) => {
      if (data) setMessages(data as Message[]);
    });

    const channel = appsSupabase.channel("messages").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      }
    ).subscribe((status) => {
      console.log("Realtime status:", status);
    });

    return () => { appsSupabase.removeChannel(channel); };
  }, [session]);

  const sendMessage = async () => {
    if (!input.trim() || !session?.user) return;
    const { error } = await appsSupabase.from("messages").insert({
      content: input.trim(),
      sender_id: session.user.id,
      sender_email: session.user.email,
    });
    if (!error) setInput("");
  };

  const handleLogout = () => {
    clearSession();
    setSessionState(null);
    window.location.href = ACCOUNTS_URL;
  };

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
          <h1 className="text-2xl font-bold text-foreground">Welcome to Tirbeo Chat</h1>
          <p className="text-muted">Sign in to start chatting with the community.</p>
          <a href={`${ACCOUNTS_URL}/login?redirect_to=${encodeURIComponent(window.location.origin)}`} className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <MessageSquare className="h-5 w-5 text-accent" />
          </div>
          <span className="font-semibold text-foreground">Tirbeo Chat</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface border border-border">
              <User className="h-3.5 w-3.5" />
            </div>
            <span>{session.user.displayName || session.user.email}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No messages yet. Say something!
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === session.user.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isOwn ? "bg-accent text-white" : "bg-surface border border-border text-foreground"}`}>
                {!isOwn && (
                  <p className="text-xs text-accent font-medium mb-1">{msg.sender_email}</p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-muted"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border px-6 py-4">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:border-accent transition-colors"
          />
          <button type="submit" disabled={!input.trim()} className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors">
            <Send className="h-4 w-4" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
