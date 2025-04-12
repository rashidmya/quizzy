"use client";

// next/link
import Link from "next/link";
// icons
import { BookOpen, PlusCircle } from "lucide-react";
// components
import { Button } from "@/components/ui/button";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";

interface LibraryHeaderProps {
  totalQuizzes: number;
}

export default function LibraryHeader({ totalQuizzes }: LibraryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Quiz Library</h1>
          <p className="text-sm text-muted-foreground">
            {totalQuizzes} {totalQuizzes === 1 ? "quiz" : "quizzes"} in your
            collection
          </p>
        </div>
      </div>

      <Button asChild>
        <Link href={PATH_DASHBOARD.quiz.new}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Quiz
        </Link>
      </Button>
    </div>
  );
}
