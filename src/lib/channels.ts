import { supabase } from "@/lib/supabase";
import type { Channel, Message, MessageAttachment, Reaction } from "@/types";

export async function getChannels(): Promise<Channel[]> {
  const { data } = await supabase
    .from("channels")
    .select("*")
    .is("archived_at", null)
    .order("name");
  return (data as Channel[]) ?? [];
}

export async function getMessages(channelId: string): Promise<Message[]> {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("channel_id", channelId)
    .is("thread_parent_id", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  return (data as Message[]) ?? [];
}

export async function getThreadMessages(parentId: string): Promise<Message[]> {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_parent_id", parentId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  return (data as Message[]) ?? [];
}

export async function getThreadCounts(channelId: string): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("messages")
    .select("thread_parent_id")
    .eq("channel_id", channelId)
    .not("thread_parent_id", "is", null)
    .is("deleted_at", null);
  const counts: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    const pid = (row as { thread_parent_id: string }).thread_parent_id;
    counts[pid] = (counts[pid] ?? 0) + 1;
  });
  return counts;
}

export async function sendMessage(channelId: string, content: string, senderId: string, senderEmail: string, threadParentId?: string) {
  return supabase.from("messages").insert({
    channel_id: channelId,
    content,
    sender_id: senderId,
    sender_email: senderEmail,
    thread_parent_id: threadParentId ?? null,
  });
}

export function subscribeToThread(parentId: string, onMessage: (msg: Message) => void) {
  return supabase
    .channel(`thread:${parentId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `thread_parent_id=eq.${parentId}` },
      (payload) => onMessage(payload.new as Message),
    )
    .subscribe();
}

// ---- Attachments ----

export async function getAttachments(messageId: string): Promise<MessageAttachment[]> {
  const { data } = await supabase
    .from("message_attachments")
    .select("*")
    .eq("message_id", messageId);
  return (data as MessageAttachment[]) ?? [];
}

export async function getAttachmentsForMessages(messageIds: string[]): Promise<Record<string, MessageAttachment[]>> {
  if (messageIds.length === 0) return {};
  const { data } = await supabase
    .from("message_attachments")
    .select("*")
    .in("message_id", messageIds);
  const map: Record<string, MessageAttachment[]> = {};
  (data as MessageAttachment[] ?? []).forEach((a) => {
    if (!map[a.message_id]) map[a.message_id] = [];
    map[a.message_id].push(a);
  });
  return map;
}

export async function createAttachment(record: Omit<MessageAttachment, "id" | "created_at">) {
  return supabase.from("message_attachments").insert(record);
}

export async function sendMessageWithAttachment(
  channelId: string,
  content: string,
  senderId: string,
  senderEmail: string,
  file: { name: string; size: number; type: string; storagePath: string },
) {
  const { data: msg } = await supabase
    .from("messages")
    .insert({ channel_id: channelId, content, sender_id: senderId, sender_email: senderEmail })
    .select()
    .single();

  if (msg) {
    await supabase.from("message_attachments").insert({
      message_id: (msg as Message).id,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_path: file.storagePath,
    });
  }

  return msg as Message | null;
}

// ---- Reactions ----

export async function getReactions(messageIds: string[]): Promise<Reaction[]> {
  if (messageIds.length === 0) return [];
  const { data } = await supabase
    .from("reactions")
    .select("*")
    .in("message_id", messageIds);
  return (data as Reaction[]) ?? [];
}

export async function toggleReaction(messageId: string, userId: string, emoji: string) {
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("message_id", messageId)
    .eq("user_id", userId)
    .eq("emoji", emoji)
    .single();

  if (existing) {
    return supabase.from("reactions").delete().eq("id", existing.id);
  }
  return supabase.from("reactions").insert({ message_id: messageId, user_id: userId, emoji });
}

export function subscribeToReactions(messageId: string, onReaction: () => void) {
  return supabase
    .channel(`reactions:${messageId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reactions", filter: `message_id=eq.${messageId}` },
      () => onReaction(),
    )
    .subscribe();
}

// ---- Search ----

export async function searchMessages(channelId: string, query: string): Promise<Message[]> {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("channel_id", channelId)
    .is("deleted_at", null)
    .ilike("content", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data as Message[]) ?? [];
}

export async function createChannel(name: string, type: Channel["type"], topic: string, userId: string) {
  const { data, error } = await supabase
    .from("channels")
    .insert({ name, type, topic, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Channel;
}

export function subscribeToMessages(channelId: string, onMessage: (msg: Message) => void) {
  return supabase
    .channel(`messages:${channelId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
      (payload) => onMessage(payload.new as Message),
    )
    .subscribe();
}
