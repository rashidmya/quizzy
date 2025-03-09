// queries
import { getQuizzes } from "@/lib/db/queries/quizzes";
// sections
import QuizLibrary from "@/sections/dashboard/library/library-list";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

export default async function QuizListPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-[900px] mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Library
        </h1>
        <QuizLibrary quizzes={quizzes} />
      </main>
    </div>
  );
}
