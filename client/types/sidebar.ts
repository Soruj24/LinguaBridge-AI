export type {
  Friend,
  PendingRequest,
  ChatItem,
} from "@linguabridge/shared";
export { formatTimestamp } from "@linguabridge/shared";

export interface SidebarProps {
  className?: string;
  onClose?: () => void;
}
