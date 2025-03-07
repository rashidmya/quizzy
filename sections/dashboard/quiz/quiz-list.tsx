"use client";

import { Button } from "@/components/ui/button";
import { Quiz } from "@/lib/db/queries/quizzes";
import { PATH_DASHBOARD } from "@/routes/paths";
import Link from "next/link";

export default function QuizList({ quizzes }: { quizzes: Quiz[] }) {
  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {quizzes.map((quiz) => (
          <li
            key={quiz.id}
            className="flex items-center justify-between py-2 px-4 rounded-lg"
          >
            <span className="text-gray-200 text-sm">{quiz.title}</span>
            <Button variant='outline' asChild>
              <Link href={PATH_DASHBOARD.quiz.view(quiz.id)}>View</Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
