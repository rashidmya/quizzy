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

type QuizListProps = {
  quizzes: LibraryQuiz[];
  onDelete: (quizId: string) => void;
};

export default function QuizList({ quizzes, onDelete }: QuizListProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <LibraryItem key={quiz.id} quiz={quiz} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

type QuizItemProps = {
  quiz: LibraryQuiz;
  onDelete: (quizId: string) => void;
};

function LibraryItem({ quiz, onDelete }: QuizItemProps) {
  const router = useRouter();

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
      <Card className="flex flex-row items-center p-4">
        <div className="flex-shrink-0 bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded mr-4">
          <BookOpenIcon className="h-6 w-6" />
        </div>
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
                  // Call the onDelete callback with the quiz id.
                  onDelete(quiz.id);
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
