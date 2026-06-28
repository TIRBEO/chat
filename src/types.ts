export interface AppSession {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  token: string;
  expiresAt: number;
}

export interface Channel {
  id: string;
  name: string;
  type: "text" | "announcement" | "thread" | "private";
  topic: string | null;
  is_private: boolean;
  created_by: string | null;
  archived_at: string | null;
  created_at: string;
}

export interface ChannelMember {
  channel_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  content: string;
  sender_id: string;
  sender_email: string;
  thread_parent_id: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}
