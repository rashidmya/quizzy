// sections/dashboard/quiz/view/components/quiz-meta-info.tsx
import {
  Clock,
  Calendar,
  Shuffle,
  Award,
  Timer,
  TimerOff,
  Users,
} from "lucide-react";
import { QuizStatus, QuizWithQuestions } from "@/types/quiz";
import { fDateTime } from "@/utils/format-time";
import { Badge } from "@/components/ui/badge";

interface QuizMetaInfoProps {
  quiz: QuizWithQuestions;
  status: QuizStatus;
}

export default function QuizMetaInfo({ quiz, status }: QuizMetaInfoProps) {
  // Function to format timer display
  const formatTimer = (seconds?: number | null) => {
    if (!seconds) return "None";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds} seconds`;
    } else if (minutes === 1 && remainingSeconds === 0) {
      return "1 minute";
    } else if (remainingSeconds === 0) {
      return `${minutes} minutes`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  return (
    <>
      {/* Timer Information */}
      <div className="bg-muted/10 p-4 rounded-lg flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          {quiz.timerMode === "none" ? (
            <TimerOff className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Timer className="h-5 w-5 text-muted-foreground" />
          )}
          <h3 className="font-medium">Timer Mode</h3>
        </div>
        <div className="flex items-center gap-2 ml-7">
          <Badge variant="outline">
            {quiz.timerMode === "global"
              ? "Global Timer"
              : quiz.timerMode === "question"
              ? "Per Question"
              : "No Timer"}
          </Badge>
          {quiz.timerMode === "global" && quiz.timer && (
            <Badge variant="secondary">{formatTimer(quiz.timer)}</Badge>
          )}
        </div>
      </div>

      {/* Questions Count */}
      <div className="bg-muted/10 p-4 rounded-lg flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <Award className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Questions</h3>
        </div>
        <p className="text-sm text-muted-foreground ml-7">
          {quiz.questions.length}{" "}
          {quiz.questions.length === 1 ? "question" : "questions"} • Total{" "}
          {quiz.questions.reduce((sum, q) => sum + q.points, 0)} points
        </p>
      </div>

      {/* Shuffle Setting */}
      <div className="bg-muted/10 p-4 rounded-lg flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <Shuffle className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Question Order</h3>
        </div>
        <p className="text-sm text-muted-foreground ml-7">
          {quiz.shuffleQuestions ? "Randomized" : "Fixed order"}
        </p>
      </div>

      {/* Schedule Information */}
      <div className="bg-muted/10 p-4 rounded-lg flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Schedule</h3>
        </div>
        <div className="ml-7">
          {status === "scheduled" && quiz.scheduledAt ? (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              Starts {fDateTime(quiz.scheduledAt)}
            </Badge>
          ) : status === "ended" && quiz.endedAt ? (
            <Badge variant="destructive">Ended {fDateTime(quiz.endedAt)}</Badge>
          ) : (
            <span className="text-sm text-muted-foreground">
              {status === "active" ? "Currently active" : "Not scheduled"}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
