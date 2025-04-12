"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuizStatus } from "@/types/quiz";
import { hasActiveFilters } from "../utils/filters";

interface ReportAdvancedFiltersProps {
  dateFilter: "all" | "today" | "week" | "month";
  statusFilter: "all" | QuizStatus;
  ownershipFilter: "my" | "shared" | "all";
  onDateFilterChange: (value: "all" | "today" | "week" | "month") => void;
  onStatusFilterChange: (value: "all" | QuizStatus) => void;
  onOwnershipFilterChange: (value: "my" | "shared" | "all") => void;
  onResetFilters: () => void;
}

export default function ReportAdvancedFilters({
  dateFilter,
  statusFilter,
  ownershipFilter,
  onDateFilterChange,
  onStatusFilterChange,
  onOwnershipFilterChange,
  onResetFilters,
}: ReportAdvancedFiltersProps) {
  // Determine if any filters are active
  const areFiltersActive = hasActiveFilters(
    "",
    statusFilter,
    dateFilter,
    ownershipFilter
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            Advanced Filters
          </CardTitle>
          <Button
            variant={areFiltersActive ? "default" : "ghost"}
            size="sm"
            onClick={onResetFilters}
            disabled={!areFiltersActive}
          >
            Reset Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Date</p>
            <Select value={dateFilter} onValueChange={onDateFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Status</p>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ownership Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Ownership</p>
            <Select
              value={ownershipFilter}
              onValueChange={onOwnershipFilterChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="my">My Reports</SelectItem>
                <SelectItem value="shared">Shared With Me</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
