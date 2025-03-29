import { QuizReport, QuizStatus } from "@/types/quiz";

/**
 * Filters reports based on search query, status, date range, and ownership
 */
export function filterReports({
  reports,
  searchQuery = "",
  statusFilter = "all",
  dateFilter = "all",
  ownershipFilter = "all"
}: {
  reports: QuizReport[];
  searchQuery?: string;
  statusFilter?: "all" | QuizStatus;
  dateFilter?: "all" | "today" | "week" | "month";
  ownershipFilter?: "all" | "my" | "shared";
}): QuizReport[] {
  let filtered = [...reports];
  
  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter(report => 
      report.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Apply status filter
  if (statusFilter !== "all") {
    filtered = filtered.filter(report => report.status === statusFilter);
  }
  
  // Apply date filter
  if (dateFilter !== "all") {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    filtered = filtered.filter(report => {
      const reportDate = new Date(report.createdAt);
      
      if (dateFilter === "today") {
        return reportDate >= today;
      } else if (dateFilter === "week") {
        return reportDate >= weekAgo;
      } else if (dateFilter === "month") {
        return reportDate >= monthAgo;
      }
      return true;
    });
  }
  
  // Apply ownership filter
  if (ownershipFilter === "shared") {
    // In a real app, filter for shared reports
    filtered = filtered.filter(report => false); // Placeholder
  }
  
  return filtered;
}

/**
 * Sorts reports based on a key and direction
 */
export function sortReports(
  reports: QuizReport[],
  sortConfig: {
    key: string;
    direction: "ascending" | "descending";
  }
): QuizReport[] {
  const { key, direction } = sortConfig;
  return [...reports].sort((a, b) => {
    if (key === "title") {
      return direction === "ascending" 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (key === "participantCount") {
      return direction === "ascending" 
        ? a.participantCount - b.participantCount
        : b.participantCount - a.participantCount;
    } else if (key === "accuracy") {
      return direction === "ascending" 
        ? a.accuracy - b.accuracy
        : b.accuracy - a.accuracy;
    } else if (key === "createdAt") {
      return direction === "ascending" 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (key === "lastAttempt") {
      const aTime = a.lastAttempt ? new Date(a.lastAttempt).getTime() : 0;
      const bTime = b.lastAttempt ? new Date(b.lastAttempt).getTime() : 0;
      return direction === "ascending" 
        ? aTime - bTime
        : bTime - aTime;
    }
    return 0;
  });
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(
  searchQuery: string,
  statusFilter: "all" | QuizStatus,
  dateFilter: "all" | "today" | "week" | "month",
  ownershipFilter: "all" | "my" | "shared"
): boolean {
  return (
    statusFilter !== "all" || 
    dateFilter !== "all" || 
    ownershipFilter !== "all" ||
    searchQuery.trim() !== ""
  );
}