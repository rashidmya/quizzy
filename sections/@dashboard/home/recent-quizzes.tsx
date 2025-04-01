// sections/dashboard/home/recent-quizzes.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, Users, FilePlus, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { PATH_DASHBOARD } from "@/routes/paths";
import StatusBadge from "@/components/status-badge";
import { QuizStatus } from "@/types/quiz";

interface QuizItem {
  id: string;
  title: string;
  status: QuizStatus;
  participants: number;
  createdAt: string;
}

export function RecentQuizzes() {
  const [loading, setLoading] = useState(true);
  
  // In a real app, you'd fetch these from an API
  const recentQuizzes: QuizItem[] = [
    {
      id: "1",
      title: "JavaScript Fundamentals",
      status: 'active',
      participants: 45,
      createdAt: "2 days ago",
    },
    {
      id: "2",
      title: "React Hooks Advanced",
      status: 'draft',
      participants: 12,
      createdAt: "1 week ago",
    },
    {
      id: "3",
      title: "CSS Grid & Flexbox",
      status: "scheduled",
      participants: 23,
      createdAt: "3 days ago",
    },
  ];

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
                      <span>{quiz.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{quiz.createdAt}</span>
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