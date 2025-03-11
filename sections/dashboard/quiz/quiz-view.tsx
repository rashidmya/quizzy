import Link from "next/link";
// components
import { Button } from "@/components/ui/button";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// sections
import QuestionList from "@/sections/dashboard/question/question-list";
import { QuizWithQuestions } from "@/types/quiz";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

type Props = {
  quiz: QuizWithQuestions;
};
export default async function QuizView({ quiz }: Props) {
  if (!quiz)
    return (
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">
        Quiz not found
      </h1>
    );

  return (
    <div className="min-h-screen p-8">
      <main>
        <div className="mb-4">
          <Button variant="link" asChild>
            <Link href={PATH_DASHBOARD.quiz.root}>Back</Link>
          </Button>

          <Button variant="link" asChild>
            <Link href={PATH_DASHBOARD.quiz.edit(quiz.id)}>Modify</Link>
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center">{quiz.title}</h1>
        <h4 className="text-center">{quiz.description}</h4>
        <div className="mt-22">
          {quiz.questions && <QuestionList questions={quiz.questions} />}
        </div>
      </main>
    </div>
  );
}
