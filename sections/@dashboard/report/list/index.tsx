"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// types
import { QuizReport, QuizStatus } from "@/types/quiz";
// components
import ReportListHeader from "./components/report-list-header";
import ReportAdvancedFilters from "./components/report-list-advanced-filters";
import ReportTable from "./components/report-list-table";
import ReportEmptyState from "./components/report-empty-state";
import ReportTableSkeleton from "./components/report-list-table-skeleton";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// utils
import { filterReports, sortReports, hasActiveFilters } from "./utils/filters";

interface ReportListProps {
  reports: QuizReport[];
}

export default function ReportList({ reports }: ReportListProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [statusFilter, setStatusFilter] = useState<"all" | QuizStatus>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<
    "my" | "shared" | "all"
  >("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  }>({
    key: "createdAt",
    direction: "descending",
  });

  // Filtered reports
  const [filteredReports, setFilteredReports] = useState<QuizReport[]>([]);

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle view report action
  const handleViewReport = (reportId: string) => {
    router.push(PATH_DASHBOARD.reports.root + "/" + reportId);
  };

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setDateFilter("all");
    setStatusFilter("all");
    setOwnershipFilter("all");
    setSortConfig({
      key: "createdAt",
      direction: "descending",
    });
  };

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    // Apply filters
    let filtered = filterReports({
      reports,
      searchQuery,
      statusFilter,
      dateFilter,
      ownershipFilter,
    });

    // Apply sorting
    filtered = sortReports(filtered, sortConfig);

    setFilteredReports(filtered);
  }, [
    reports,
    searchQuery,
    dateFilter,
    statusFilter,
    ownershipFilter,
    sortConfig,
  ]);

  if (isLoading) {
    return <ReportTableSkeleton />;
  }

  // Check if any filters are active
  const areFiltersActive = hasActiveFilters(
    searchQuery,
    statusFilter,
    dateFilter,
    ownershipFilter
  );

  return (
    <div className="space-y-8">
      <ReportListHeader
        totalReports={reports.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ReportAdvancedFilters
        dateFilter={dateFilter}
        statusFilter={statusFilter}
        ownershipFilter={ownershipFilter}
        onDateFilterChange={setDateFilter}
        onStatusFilterChange={setStatusFilter}
        onOwnershipFilterChange={setOwnershipFilter}
        onResetFilters={resetFilters}
      />

      {reports.length === 0 ? (
        <ReportEmptyState type="no-reports" />
      ) : filteredReports.length === 0 ? (
        <ReportEmptyState
          type="no-results"
          searchQuery={searchQuery}
          hasFilters={areFiltersActive}
          onResetFilters={resetFilters}
        />
      ) : (
        <ReportTable
          reports={filteredReports}
          sortConfig={sortConfig}
          onSort={handleSort}
          onViewReport={handleViewReport}
          totalReports={reports.length}
        />
      )}
    </div>
  );
}
