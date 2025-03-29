"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Calendar } from "lucide-react";
import { QuizStatus } from "@/types/quiz";

type QuizOfflineProps = {
  status: QuizStatus;
  scheduledAt?: Date | string | null;
};

export default function QuizOffline({ status, scheduledAt }: QuizOfflineProps) {
  let message = "";
  let title = "";

  switch (status) {
    case "draft":
      title = "Quiz Not Available";
      message =
        "This quiz is currently in draft mode and not accepting responses.";
      break;
    case "paused":
      title = "Quiz Paused";
      message =
        "This quiz has been temporarily paused by the creator. Please check back later.";
      break;
    case "scheduled":
      title = "Quiz Not Yet Available";
      message = scheduledAt
        ? `This quiz will be available on ${format(
            new Date(scheduledAt),
            "MMM dd, yyyy 'at' h:mm a"
          )}.`
        : "This quiz is scheduled to begin in the future.";
      break;
    case "ended":
      title = "Quiz Ended";
      message = "This quiz has ended and is no longer accepting responses.";
      break;
    default:
      title = "Quiz Offline";
      message = "This quiz is currently offline and not accepting responses.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full shadow-none bg-none p-12">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {message}
          </p>

          {status === "scheduled" && scheduledAt && (
            <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md mt-4 mb-4">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                Opens{" "}
                {format(new Date(scheduledAt), "MMM dd, yyyy 'at' h:mm a")}
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
