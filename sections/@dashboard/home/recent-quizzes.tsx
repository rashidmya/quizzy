// sections/dashboard/home/recent-quizzes.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, Users, FilePlus, PlusCircle } from "lucide-react";
import Link from "next/link";
import { PATH_DASHBOARD } from "@/routes/paths";
import StatusBadge from "@/components/status-badge";
import { QuizStatus } from "@/types/quiz";
import { formatDistanceToNow } from "date-fns";

interface QuizItem {
  id: string;
  title: string;
  status: QuizStatus;
  participantCount?: number;
  createdAt: Date;
}

interface RecentQuizzesProps {
  initialQuizzes: QuizItem[];
}

export function RecentQuizzes({ initialQuizzes }: RecentQuizzesProps) {
  const [recentQuizzes] = useState<QuizItem[]>(
    initialQuizzes.map(quiz => ({
      ...quiz,
      // Make sure createdAt is a Date object since it may come as a string from the server
      createdAt: new Date(quiz.createdAt)
    }))
  );
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Recent Quizzes</CardTitle>
          <CardDescription>Your most recently created quizzes</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href={PATH_DASHBOARD.library.root}>
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentQuizzes.length === 0 ? (
          <div className="text-center py-12 border rounded-md border-dashed">
            <FilePlus className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">No quizzes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You haven&apos;t created any quizzes yet.
            </p>
            <Button asChild size="sm">
              <Link href={PATH_DASHBOARD.quiz.new}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Quiz
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between py-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={PATH_DASHBOARD.quiz.view(quiz.id)} 
                      className="hover:underline font-medium"
                    >
                      {quiz.title}
                    </Link>
                    <StatusBadge status={quiz.status} />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{quiz.participantCount || 0} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(quiz.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Link href={PATH_DASHBOARD.quiz.view(quiz.id)}>
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}