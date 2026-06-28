import { supabase } from "@/lib/supabase";

let currentChannel: ReturnType<typeof supabase.channel> | null = null;

export function subscribeTyping(
  channelId: string,
  userId: string,
  onTyping: (ev: { userId: string; userName: string; typing: boolean }) => void,
) {
  if (currentChannel) currentChannel.unsubscribe();

  currentChannel = supabase.channel(`typing:${channelId}`);

  currentChannel.on("broadcast", { event: "typing" }, (payload) => {
    const { user_id, user_name, typing } = (payload as Record<string, unknown>).payload as {
      user_id: string;
      user_name: string;
      typing: boolean;
    };
    if (user_id !== userId) {
      onTyping({ userId: user_id, userName: user_name, typing });
    }
  });

  currentChannel.subscribe();

  return () => {
    currentChannel?.unsubscribe();
    currentChannel = null;
  };
}

export function sendTyping(channelId: string, userId: string, userName: string, typing: boolean) {
  supabase.channel(`typing:${channelId}`).send({
    type: "broadcast",
    event: "typing",
    payload: { user_id: userId, user_name: userName, typing },
  });
}
