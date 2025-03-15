"use client";

// components
import { CardHeader } from "@/components/ui/card";
// lucide-react
import { Users } from "lucide-react";

type QuizHeaderProps = {
  title: string;
  participantCount: number;
};

export function QuizHeader({ participantCount }: QuizHeaderProps) {
  return (
    <CardHeader>
      <div className="flex justify-end items-start">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {participantCount}{" "}
            {participantCount === 1 ? "participant" : "participants"}
          </span>
        </div>
      </div>
    </CardHeader>
  );
}
