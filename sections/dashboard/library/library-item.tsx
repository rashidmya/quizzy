"use client";

import { useRouter } from "next/navigation";
// lucide
import { BookOpen as BookOpenIcon, MoreVertical } from "lucide-react";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
// types
import { LibraryQuiz } from "@/types/quiz";

type Props = {
  quiz: LibraryQuiz;
};

export default function LibraryItem({ quiz }: Props) {
  const router = useRouter();

  // Navigate to the quiz view page when the card is clicked.
  const handleNavigation = () => {
    router.push(PATH_DASHBOARD.quiz.view(quiz.id));
  };

  return (
    <div
      onClick={handleNavigation}
      role="link"
      tabIndex={0}
      className="block cursor-pointer"
    >
      <Card key={quiz.id} className="flex flex-row items-center p-4">
        {/* Quiz Icon on the left */}
        <div className="flex-shrink-0 bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded mr-4">
          <BookOpenIcon className="h-6 w-6" />
        </div>
        {/* Quiz Details in the center */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground">
            By {quiz.createdBy.name || "Unknown"} &bull;{" "}
            {quiz.questionCount !== undefined
              ? `${quiz.questionCount} ${
                  quiz.questionCount === 1 ? "question" : "questions"
                }`
              : "0 questions"}
          </p>
        </div>
        {/* Action Buttons on the right */}
        <div
          className="flex-shrink-0 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Deleting quiz", quiz.id);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </div>
  );
}
