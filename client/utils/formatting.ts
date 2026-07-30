import { isYesterday, format, formatDistanceToNow } from "date-fns";

export function formatTimestamp(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatLastSeen(
  lastSeen: Date | string | null | undefined,
  showLastSeen: boolean | null | undefined,
  isOnline: boolean
): string | null {
  if (isOnline) return null;
  if (!lastSeen) return null;
  if (showLastSeen === false) return "Recently";

  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} hr ago`;
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d, yyyy");
}
