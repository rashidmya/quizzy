import { notFound } from "next/navigation";

import { getQuizReportDetails } from "@/lib/db/queries/quizzes";
import ReportDetailView from "@/sections/@dashboard/report/detail";

export const dynamic = "force-dynamic";

export default async function QuizReportPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  if (!id) {
    return notFound();
  }

  // Fetch quiz report data
  const reportDetails = await getQuizReportDetails(id);

  if (!reportDetails) {
    return notFound();
  }

  return <ReportDetailView reportData={reportDetails} />;
}
