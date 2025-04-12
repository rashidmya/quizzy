"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  BarChart3, 
  Users, 
  Clock, 
  ChevronRight, 
  ArrowUpDown, 
  FileText, 
  Download, 
  MoreHorizontal 
} from "lucide-react";
import { fDate, fToNow } from "@/utils/format-time";
import { getAccuracyBadgeColor } from "@/utils/get-accuracy-badge-color";
import { QuizReport } from "@/types/quiz";
import StatusBadge from "@/components/status-badge";

interface ReportTableProps {
  reports: QuizReport[];
  totalReports: number;
  sortConfig: {
    key: string;
    direction: "ascending" | "descending";
  };
  onSort: (key: string) => void;
  onViewReport: (reportId: string) => void;
}

export default function ReportTable({
  reports,
  totalReports,
  sortConfig,
  onSort,
  onViewReport,
}: ReportTableProps) {
  // Helper function for sort indicator
  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? "↑" : "↓";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Report List
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>
              Showing {reports.length} of {totalReports} reports
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="p-0">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="w-[300px] cursor-pointer p-4"
                onClick={() => onSort("title")}
              >
                <div className="flex items-center">
                  Quiz Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {getSortIndicator("title")}
                </div>
              </TableHead>
              <TableHead className="p-4">Status</TableHead>
              <TableHead
                className="cursor-pointer p-4"
                onClick={() => onSort("participantCount")}
              >
                <div className="flex items-center">
                  Participants
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {getSortIndicator("participantCount")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer p-4"
                onClick={() => onSort("accuracy")}
              >
                <div className="flex items-center">
                  Accuracy
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {getSortIndicator("accuracy")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer p-4"
                onClick={() => onSort("lastAttempt")}
              >
                <div className="flex items-center">
                  Last Activity
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {getSortIndicator("lastAttempt")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer p-4"
                onClick={() => onSort("createdAt")}
              >
                <div className="flex items-center">
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {getSortIndicator("createdAt")}
                </div>
              </TableHead>
              <TableHead className="text-right p-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow
                key={report.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewReport(report.id)}
              >
                <TableCell className="font-medium p-4">
                  {report.title}
                </TableCell>
                <TableCell className="p-4">
                  <StatusBadge status={report.status} />
                </TableCell>
                <TableCell className="p-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{report.participantCount}</span>
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <Badge className={getAccuracyBadgeColor(Number(report.accuracy) || 0)}>
                    {isNaN(Number(report.accuracy)) ? '0.0' : Number(report.accuracy).toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="p-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {report.lastAttempt
                        ? fToNow(report.lastAttempt)
                        : "Never"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  {fDate(report.createdAt, "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-right p-4">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                // Export as CSV logic would go here
                                console.log("Export as CSV", report.id);
                              }}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export as CSV
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                // Export as PDF logic would go here
                                console.log("Export as PDF", report.id);
                              }}>
                                <Download className="mr-2 h-4 w-4" />
                                Export as PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          Export options
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewReport(report.id);
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          View details
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}