// sections/dashboard/home/quick-stats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color?: string;
}

function StatCard({ title, value, description, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-md bg-${color || "primary"}/10`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function QuickStats() {
  const [loading, setLoading] = useState(true);
  
  // In a real app, you'd fetch these stats from an API
  const stats = {
    totalQuizzes: 12,
    totalParticipants: 158,
    avgAccuracy: 76.4,
    completionRate: 92.1,
  };

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <StatCard 
        title="Total Quizzes" 
        value={stats.totalQuizzes}
        description="Quizzes created by you"
        icon={<Clock className="h-4 w-4 text-amber-600" />}
        color="amber"
      />
      
      <StatCard 
        title="Total Participants" 
        value={stats.totalParticipants}
        description="People who took your quizzes"
        icon={<Users className="h-4 w-4 text-blue-600" />}
        color="blue"
      />
      
      <StatCard 
        title="Average Accuracy" 
        value={`${stats.avgAccuracy}%`}
        description="Across all your quizzes"
        icon={<CheckCircle className="h-4 w-4 text-green-600" />}
        color="green"
      />
      
      <StatCard 
        title="Completion Rate" 
        value={`${stats.completionRate}%`}
        description="Questions answered vs total"
        icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
        color="purple"
      />
    </div>
  );
}