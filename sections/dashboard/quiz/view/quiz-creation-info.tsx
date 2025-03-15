"use client";

// utils
import { cn } from "@/lib/utils";
import { fToNow } from "@/utils/format-time";
// components
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  name: string;
  createdAt: Date;
};

export default function QuizCreationInfo({ name, createdAt }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("p-2.5 rounded-xl", "bg-zinc-100 dark:bg-zinc-800")}>
        <Avatar className="w-8 h-8">
          <AvatarImage src="/path/to/default-avatar.png" alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {name}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {fToNow(createdAt)}
        </p>
      </div>
    </div>
  );
}
