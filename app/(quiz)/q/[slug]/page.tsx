import { notFound } from "next/navigation";
// queries
import { getQuizWithQuestions } from "@/lib/db/queries/quizzes";
// sections
import QuizTakingForm from "@/sections/(quiz)/quiz-taking-form";
import QuizOffline from "@/sections/(quiz)/quiz-offline";
// utils
import { decodeUUID } from "@/utils/encode-uuid";

type PageProps = {
  params: { slug: string };
};

export const dynamic = "force-static";

export default async function QuizPage({ params }: PageProps) {
  const { slug } = params;

  const decodedId = decodeUUID(slug);

  const quiz = await getQuizWithQuestions(decodedId);

  if (!quiz) {
    return notFound();
  }

  if (!quiz.isLive) {
    return <QuizOffline />;
  }

  return <QuizTakingForm quiz={quiz} />;
}
