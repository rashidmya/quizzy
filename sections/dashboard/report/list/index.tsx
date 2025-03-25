"use client";

import { useState, useEffect } from "react";
// next/router
import { useRouter } from "next/navigation";
// components
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
// types
import { QuizReport } from "@/types/quiz";
// sections
import ReportCard from "./report-list-card";
import ReportsHeader from "./report-list-header";
import ReportsEmptyState from "./report-list-empty-state";
import ReportsLoadingSkeleton from "./report-list-loading-skeleton";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";

interface ReportListProps {
  reports: QuizReport[];
}

export default function ReportList({ reports }: ReportListProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReports, setFilteredReports] = useState<QuizReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"recent" | "popular" | "all">("all");

  // Filter and sort reports based on search query and view filter
  useEffect(() => {
    let filtered = reports.filter((report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply additional sorting based on view
    if (view === "recent") {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (view === "popular") {
      filtered = [...filtered].sort(
        (a, b) => b.participantCount - a.participantCount
      );
    }

    setFilteredReports(filtered);
    setIsLoading(false);
  }, [searchQuery, reports, view]);

  const handleViewReport = (reportId: string) => {
    router.push(PATH_DASHBOARD.reports.root + "/" + reportId);
  };

  return (
    <div className="space-y-6">
      <ReportsHeader
        totalReports={reports.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* View filter tabs */}
      <div className="flex justify-between items-center">
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "recent" | "popular" | "all")}
        >
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <ReportsLoadingSkeleton />
      ) : filteredReports.length === 0 ? (
        <ReportsEmptyState searchQuery={searchQuery} />
      ) : (
        <div className="space-y-6">
          {/* Group reports by participantCount ranges */}
          <ReportSection
            title="High Engagement"
            description="Reports with substantial participation"
            reports={filteredReports.filter((r) => r.participantCount >= 30)}
            onViewReport={handleViewReport}
          />

          <ReportSection
            title="Medium Engagement"
            description="Reports with moderate participation"
            reports={filteredReports.filter(
              (r) => r.participantCount >= 10 && r.participantCount < 30
            )}
            onViewReport={handleViewReport}
          />

          <ReportSection
            title="Low Engagement"
            description="Reports with limited participation"
            reports={filteredReports.filter((r) => r.participantCount < 10)}
            onViewReport={handleViewReport}
          />
        </div>
      )}
    </div>
  );
}

interface ReportSectionProps {
  title: string;
  description: string;
  reports: QuizReport[];
  onViewReport: (id: string) => void;
}

function ReportSection({
  title,
  description,
  reports,
  onViewReport,
}: ReportSectionProps) {
  // Don't render the section if there are no reports
  if (reports.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <ScrollArea className="w-full pb-4">
        <div className="flex space-x-4 pb-2">
          {reports.map((report) => (
            <div key={report.id} className="min-w-[350px] max-w-[350px]">
              <ReportCard
                report={report}
                onView={() => onViewReport(report.id)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
