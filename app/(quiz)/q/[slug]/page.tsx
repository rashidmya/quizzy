// queries
import { getQuizWithQuestions } from "@/lib/db/queries/quizzes";
// sections
import QuizTakingForm from "@/sections/(quiz)/quiz-taking-form";
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
    return <p>Quiz not found.</p>;
  }

  if (!quiz.isLive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-center text-muted-foreground">
          This quiz is currently offline and not accepting responses.
        </p>
      </div>
    );
  }

  return <QuizTakingForm quiz={quiz} />;
}
