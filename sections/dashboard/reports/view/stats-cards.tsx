import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CheckCircle, Users, BookOpen } from "lucide-react";

interface StatsCardsProps {
  stats: {
    accuracy: string;
    completionRate: string;
    totalParticipants: number;
    totalQuestions: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.accuracy}%</div>
          <p className="text-xs text-muted-foreground">
            Avg. points / total possible points
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Questions attempted / total questions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Participants
          </CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          <p className="text-xs text-muted-foreground">
            People who attempted the quiz
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Questions</CardTitle>
          <BookOpen className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalQuestions}</div>
          <p className="text-xs text-muted-foreground">
            Total questions in the quiz
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
