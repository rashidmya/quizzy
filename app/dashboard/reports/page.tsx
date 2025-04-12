import { getServerSession } from "next-auth";
// authconfig
import { authMainOptions } from "@/lib/auth/main/auth.config";
// sections
import ReportList from "@/sections/@dashboard/report/list";
// query
import { getQuizzesWithReport } from "@/lib/db/queries/quizzes";

export const dynamic = "force-dynamic";

export default async function QuizListPage() {
  const session = await getServerSession(authMainOptions);

  if (!session?.user) {
    // Handle unauthenticated state
    return <div>You must be logged in to view reports</div>;
  }

  const reports = await getQuizzesWithReport(session.user.id);

  return <ReportList reports={reports} />;
}
