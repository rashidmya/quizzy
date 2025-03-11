"use client";

// types
import { LibraryQuiz } from "@/types/quiz";
// sections
import LibraryItem from "./library-item";

type Props = {
  quizzes: LibraryQuiz[];
};

export default function QuizList({ quizzes }: Props) {
  return (
    <div className="space-y-8">
      {/* List of Horizontal Cards */}
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <LibraryItem key={quiz.id} quiz={quiz} />
        ))}
      </div>
    </div>
  );
}
