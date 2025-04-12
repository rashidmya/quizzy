// sections/dashboard/home/quick-actions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BarChart3, Settings, BookOpen } from "lucide-react";
import Link from "next/link";
import { PATH_DASHBOARD } from "@/routes/paths";

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full justify-start" size="lg">
          <Link href={PATH_DASHBOARD.quiz.new}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Quiz
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full justify-start" size="lg">
          <Link href={PATH_DASHBOARD.library.root}>
            <BookOpen className="mr-2 h-4 w-4" />
            My Library
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full justify-start" size="lg">
          <Link href={PATH_DASHBOARD.reports.root}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Reports
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full justify-start" size="lg">
          <Link href={PATH_DASHBOARD.settings.root}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}