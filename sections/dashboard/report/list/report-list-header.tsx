"use client";

import { BarChart3, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ReportsHeaderProps {
  totalReports: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ReportsHeader({ 
  totalReports, 
  searchQuery, 
  onSearchChange 
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Quiz Reports</h1>
          <p className="text-sm text-muted-foreground">
            {totalReports} {totalReports === 1 ? "report" : "reports"} available
          </p>
        </div>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}