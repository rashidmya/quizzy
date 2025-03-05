"use client";

import { useActionState } from "react";
import { addTodo, deleteTodo } from "../../actions/todo";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Quiz } from "@/lib/quizzes";

export default function QuizList({ quizzes }: { quizzes: Quiz[] }) {
  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {quizzes.map((quiz) => (
          <li
            key={quiz.id}
            className="flex items-center justify-between py-2 px-4 rounded-lg bg-gray-800 shadow-sm"
          >
            <span className="text-gray-200 text-sm">{quiz.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
