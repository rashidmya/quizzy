"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen as BookOpenIcon, MoreVertical } from "lucide-react";
import { PATH_DASHBOARD } from "@/routes/paths";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Type for each quiz. Adjust as necessary.
export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  questionCount?: number;
};

export default function QuizLibrary({ quizzes }: { quizzes: Quiz[] }) {
  return (
    <div className="space-y-8">
      {/* List of Horizontal Cards */}
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="flex-row items-center p-4">
            {/* Quiz Icon on the left */}
            <div className="flex-shrink-0 bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded mr-4">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            {/* Quiz Details in the center */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{quiz.title}</h2>
              <p className="text-sm text-muted-foreground">
                By {quiz.createdBy || "Unknown"} &bull;{" "}
                {quiz.questionCount !== undefined
                  ? `${quiz.questionCount} Questions`
                  : "No questions"}
              </p>
            </div>
            {/* Action Buttons on the right */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={PATH_DASHBOARD.quiz.edit(quiz.id)}>Edit</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      console.log("Deleting quiz", quiz.id);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
