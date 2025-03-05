import { getQuizzes } from "@/lib/queries/quizzes";
import QuizList from "@/sections/quiz/quiz-list";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

export default async function Page() {
  const quizzes = await getQuizzes();

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-[350px] mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">
          Quiz Page
        </h1>
        <QuizList quizzes={quizzes} />
      </main>
    </div>
  );
}
