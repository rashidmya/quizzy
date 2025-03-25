"use client";

import { Search } from "lucide-react";

interface ReportsEmptyStateProps {
  searchQuery: string;
}

export default function ReportsEmptyState({ searchQuery }: ReportsEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No reports found</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-4">
        {searchQuery
          ? `We couldn't find any reports matching "${searchQuery}". Try a different search term.`
          : "No reports are available yet. Create a quiz and get some participants to see reports here."}
      </p>
    </div>
  );
}