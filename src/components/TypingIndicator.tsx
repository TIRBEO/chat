interface TypingIndicatorProps {
  names: string[];
}

export function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing...`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing...`
        : `${names[0]} and ${names.length - 1} others are typing...`;

  return (
    <div className="flex items-center gap-2 px-6 py-1.5 text-xs text-muted">
      <span className="flex gap-0.5">
        <span className="w-1 h-1 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1 h-1 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1 h-1 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
      </span>
      {label}
    </div>
  );
}
