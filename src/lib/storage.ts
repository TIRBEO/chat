import { supabase } from "@/lib/supabase";

const BUCKET = "chat_attachments";

export async function uploadFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  return path;
}

export function getFileUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}
