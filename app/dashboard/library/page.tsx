// queries
import { getQuizzes } from "@/lib/db/queries/quizzes";
// sections
import LibraryView from "@/sections/dashboard/library/library-view";
// next-auth
import { getServerSession } from "next-auth/next";
// lib
import { authOptions } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export default async function QuizListPage() {
  // Fetch the session on the server.
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Handle unauthenticated state (e.g., redirect to login).
    return <>something went wrong</>
  }
  
  // Use the user id from the session to fetch quizzes.
  const quizzes = await getQuizzes(session.user.id);
  
  return <LibraryView quizzes={quizzes} />;
}
