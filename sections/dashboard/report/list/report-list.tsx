"use client";

import { useRouter } from "next/navigation";
// components
import ReportCard from "./report-card";
// types
import { QuizReport } from "./report-types";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";

interface ReportsListProps {
  reports: QuizReport[];
}

export default function ReportsList({ reports }: ReportsListProps) {
  const router = useRouter();

  // Function to navigate to the detailed report page
  const handleViewReport = (reportId: string) => {
    router.push(PATH_DASHBOARD.reports.root + "/" + reportId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onView={() => handleViewReport(report.id)}
        />
      ))}
    </div>
  );
}