// sections/dashboard/home/quick-stats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color?: string;
}

interface StatsData {
  totalQuizzes: number;
  totalParticipants: number;
  avgAccuracy: number;
  completionRate: number;
}

interface QuickStatsProps {
  initialStats: StatsData;
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

export function QuickStats({ initialStats }: QuickStatsProps) {
  const [stats] = useState<StatsData>(initialStats);
  
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
        value={`${stats.avgAccuracy.toFixed(1)}%`}
        description="Across all your quizzes"
        icon={<CheckCircle className="h-4 w-4 text-green-600" />}
        color="green"
      />
      
      <StatCard 
        title="Completion Rate" 
        value={`${stats.completionRate.toFixed(1)}%`}
        description="Questions answered vs total"
        icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
        color="purple"
      />
    </div>
  );
}