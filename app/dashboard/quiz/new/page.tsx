import Link from "next/link";
// components
import { Button } from "@/components/ui/button";
// db
import { getQuizWithQuestions } from "@/lib/db/queries/quizzes";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// sections
import QuizNewEdit from "@/sections/dashboard/quiz/quiz-new-edit";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

export default async function QuizNewPage() {
  return (
    <div className="min-h-screen p-8">
      <main>
        <div className="mb-4">
          <Button variant="link" asChild>
            <Link href={PATH_DASHBOARD.quiz.root}>Back</Link>
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">
          Modify Quiz
        </h1>
        <div className="mt-22">
          <QuizNewEdit />
        </div>
      </main>
    </div>
  );
}
