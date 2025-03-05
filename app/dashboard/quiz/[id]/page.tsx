import Link from "next/link";
// components
import { Button } from "@/components/ui/button";
// queries
import { getQuizWithQuestions } from "@/lib/queries/quizzes";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// sections
import QuestionList from "@/sections/dashboard/question/question-list";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quiz = await getQuizWithQuestions(id);

  if (!quiz)
    return (
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">
        Quiz not found
      </h1>
    );

  return (
    <div className="min-h-screen p-8">
      <main>
        <div className="mb-4 justify-between">
          <Button variant='link' asChild>
            <Link href={PATH_DASHBOARD.quiz.root}>Back</Link>
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">
          {quiz.title}
        </h1>
        <h4 className="text-center">{quiz.description}</h4>
        <div className="mt-22">
          {quiz.questions && <QuestionList questions={quiz.questions} />}
        </div>
      </main>
    </div>
  );
}
