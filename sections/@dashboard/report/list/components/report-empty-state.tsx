"use client";

import { Search, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ReportEmptyStateProps {
  type: "no-reports" | "no-results";
  searchQuery?: string;
  hasFilters?: boolean;
  onResetFilters?: () => void;
}

export default function ReportEmptyState({
  type,
  searchQuery = "",
  hasFilters = false,
  onResetFilters,
}: ReportEmptyStateProps) {
  if (type === "no-reports") {
    return (
      <Card className="border-dashed py-12">
        <CardContent className="flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Reports Available</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            You don't have any quizzes with reports yet. Create a quiz and share it
            with participants to generate reports and analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No results from search/filters
  return (
    <Card className="border-dashed py-10">
      <CardContent className="flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Matching Reports</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {searchQuery
            ? `We couldn't find any reports matching "${searchQuery}".`
            : "No reports match your current filter settings."}
          {hasFilters && " Try adjusting your filters to see more results."}
        </p>
        {hasFilters && onResetFilters && (
          <Button variant="outline" onClick={onResetFilters}>
            Reset All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}