import { getQuizWithQuestions } from "@/lib/db/queries/quizzes"; // Your DB query function
import QuizTakingForm from "@/sections/(quiz)/quiz-taking-form"; // Client component for taking quiz

type PageProps = {
  params: { slug: string };
};

export const dynamic = "force-static";

export default async function QuizPage({ params }: PageProps) {
  const { slug } = params;

  const quiz = await getQuizWithQuestions(slug);

  if (!quiz) {
    return <p>Quiz not found.</p>;
  }

  return <QuizTakingForm quiz={quiz} />;
}
