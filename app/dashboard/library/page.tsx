// queries
import { getQuizzes } from "@/lib/db/queries/quizzes";
// sections
import LibraryView from "@/sections/dashboard/library/library-view";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

export default async function QuizListPage() {
  // Local state for search input.

  const quizzes = await getQuizzes();

  return <LibraryView quizzes={quizzes} />;
}
