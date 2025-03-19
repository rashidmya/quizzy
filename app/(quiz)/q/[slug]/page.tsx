import { notFound } from "next/navigation";
// queries
import { getQuizWithQuestions } from "@/lib/db/queries/quizzes";
// sections
import QuizTakingForm from "@/sections/(quiz)/quiz-taking";
import QuizOffline from "@/sections/(quiz)/quiz-offline";
// utils
import { decodeUUID } from "@/utils/encode-uuid";
import { SessionProvider } from "@/components/providers/session-provider";

type PageProps = {
  params: { slug: string };
};

export const dynamic = "force-static";

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params;

  const decodedId = decodeUUID(slug);

  const quiz = await getQuizWithQuestions(decodedId);

  if (!quiz) {
    return notFound();
  }

  if (!quiz.isLive) {
    return <QuizOffline />;
  }

  return (
    <SessionProvider basePath="/api/quiz-auth">
      <QuizTakingForm quiz={quiz} />
    </SessionProvider>
  );
}
