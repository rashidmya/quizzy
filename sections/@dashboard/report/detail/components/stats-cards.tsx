import { 
  Activity, 
  Users, 
  CheckCircle, 
  HelpCircle 
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    accuracy: number;
    completionRate: number;
    totalParticipants: number;
    totalQuestions: number;
    totalPoints: number;
  };
}

/**
 * Component that displays key quiz statistics in card format
 */
export default function StatsCards({ stats }: StatsCardsProps) {
  const { 
    accuracy, 
    completionRate, 
    totalParticipants, 
    totalQuestions 
  } = stats;
  
  // Format values to show 1 decimal place
  const formattedAccuracy = accuracy.toFixed(1);
  const formattedCompletionRate = completionRate.toFixed(1);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Accuracy Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedAccuracy}%</div>
          <p className="text-xs text-muted-foreground">
            Based on points scored / total possible points
          </p>
        </CardContent>
      </Card>
      
      {/* Completion Rate Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedCompletionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Questions attempted / total questions
          </p>
        </CardContent>
      </Card>
      
      {/* Total Participants Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalParticipants}</div>
          <p className="text-xs text-muted-foreground">
            People who attempted the quiz
          </p>
        </CardContent>
      </Card>
      
      {/* Total Questions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalQuestions}</div>
          <p className="text-xs text-muted-foreground">
            Questions in this quiz
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 