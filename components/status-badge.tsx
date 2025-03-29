// types
import { QuizStatus } from "@/types/quiz";
// icons
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle,
  FileText,
  XCircle,
} from "lucide-react";
// components
import { Badge } from "./ui/badge";

type StatusBadgeProps = {
  status: QuizStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<
    QuizStatus,
    {
      icon: typeof CheckCircle;
      label: string;
      className: string;
    }
  > = {
    draft: {
      icon: FileText,
      label: "Draft",
      className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800",
    },
    scheduled: {
      icon: CalendarClock,
      label: "Scheduled",
      className:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    },
    active: {
      icon: CheckCircle,
      label: "Active",
      className:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    },
    paused: {
      icon: AlertTriangle,
      label: "Paused",
      className:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    },
    ended: {
      icon: XCircle,
      label: "Ended",
      className:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const StatusIcon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`text-xs font-normal flex items-center gap-1 ${config.className}`}
    >
      <StatusIcon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
