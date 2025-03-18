"use client";

import Link from "next/link"; // next/link
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"; // shadcn/ui card components
import { Button } from "@/components/ui/button"; // shadcn/ui button component
import { ArrowLeftIcon } from "lucide-react";

export default function QuizOffline() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full shadow-none bg-none p-12">
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This quiz is currently offline and not accepting responses.
          </p>
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
