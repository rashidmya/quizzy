"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"; // components
import { Button } from "@/components/ui/button"; // components
import { ArrowLeftIcon } from "lucide-react"; // icons

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-lg w-full p-6 shadow-none p-14">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100">
            404
          </CardTitle>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Oops! Page not found.
          </p>
        </CardHeader>
        <CardContent className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We couldn’t find the page you were looking for. It may have been
            removed or you may have mistyped the address.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4 mt-6">
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
