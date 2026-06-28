import { FileText } from "lucide-react";
import { getFileUrl, isImage } from "@/lib/storage";
import type { MessageAttachment } from "@/types";

interface FileAttachmentProps {
  attachment: MessageAttachment;
}

export function FileAttachment({ attachment }: FileAttachmentProps) {
  const url = getFileUrl(attachment.storage_path);

  if (isImage(attachment.mime_type)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-2">
        <img
          src={url}
          alt={attachment.file_name}
          className="max-w-sm rounded-xl border border-border object-cover"
          loading="lazy"
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 hover:bg-surface-hover transition-colors"
    >
      <FileText className="h-5 w-5 text-muted" />
      <div className="min-w-0">
        <p className="text-sm text-foreground truncate">{attachment.file_name}</p>
        <p className="text-xs text-muted">{(attachment.file_size / 1024).toFixed(1)} KB</p>
      </div>
    </a>
  );
}
