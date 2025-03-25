"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// icons
import {
  CheckCircle,
  Users,
  Clock,
  User,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
// types
import { QuizReport, getAccuracyBadgeColor } from "./report-types";
// utils
import { fToNow } from "@/utils/format-time";

interface ReportCardProps {
  report: QuizReport;
  onView: () => void;
}

export default function ReportCard({ report, onView }: ReportCardProps) {
  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={onView}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{report.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
              >
                View Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                Download Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2 mt-1">
          <Badge variant="outline" className="text-xs font-normal">
            {report.questionCount} questions
          </Badge>
          <Badge className={`text-xs font-normal ${getAccuracyBadgeColor(report.accuracy)}`}>
            {report.accuracy.toFixed(1)}% accuracy
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Completion Rate Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                <span className="text-muted-foreground text-xs">Completion Rate</span>
              </div>
              <span className="font-medium text-xs">{report.completionRate}%</span>
            </div>
            <Progress value={report.completionRate} className="h-1.5" />
          </div>

          {/* Quiz Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 border rounded-md p-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">Participants</p>
                <p className="font-medium">{report.participantCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border rounded-md p-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Last Attempt</p>
                <p className="text-xs font-medium">
                  {report.lastAttempt ? fToNow(report.lastAttempt) : "Never"}
                </p>
              </div>
            </div>
          </div>

          {/* Author & View Details Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {report.author.name}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1 hover:text-primary">
              View Details
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}