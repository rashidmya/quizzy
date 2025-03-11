"use client";

import { useState } from "react";
// components
import { CardHeader, CardTitle } from "@/components/ui/card";
// lucide-react
import { Pencil, Users } from "lucide-react";

type QuizHeaderProps = {
  title: string;
  description: string | null;
  participantCount: number;
  onEdit: (newTitle: string) => void;
};

export function QuizHeader({
  title,
  description,
  participantCount,
  onEdit,
}: QuizHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onEdit(editedTitle);
  };

  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        {/* Quiz Title with Pencil Icon and Description below */}
        <div className="flex flex-col">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleTitleClick}
          >
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleBlur}
                autoFocus
                className="text-2xl font-bold border-b border-gray-300 focus:outline-none"
              />
            ) : (
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            )}
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
