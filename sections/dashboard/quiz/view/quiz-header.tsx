"use client";

import { useState } from "react";
// components
import { CardHeader, CardTitle } from "@/components/ui/card";
// lucide-react
import { Pencil, Users } from "lucide-react";

type QuizHeaderProps = {
  title: string;
  participantCount: number;
};

export function QuizHeader({ title, participantCount }: QuizHeaderProps) {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        {/* Quiz Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          </div>
        </div>
        {/* Participant Count */}
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
