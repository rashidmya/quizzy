// sections/(quiz)/quiz-taking/quiz-taking-login.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuizTakingLoginProps {
  quizId: string;
}

/**
 * Login component for quiz-taking
 * Allows users to sign in with email or Google to take a quiz
 */
export default function QuizTakingLogin({ quizId }: QuizTakingLoginProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Handle email login
   */
  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await signIn("quiz-login", {
        email,
        callbackUrl: `/q/${quizId}`,
      });

      if (result?.error) {
        setErrorMessage("Failed to sign in. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Google login
   */
  const handleGoogleLogin = async () => {
    try {
      await signIn("google-quiz-login", {
        callbackUrl: `/q/${quizId}`,
      });
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
      <Card className="max-w-md w-full shadow-lg animate-in fade-in-50 duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to take the quiz
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to identify your quiz attempt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!email || isSubmitting}
              variant="default"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Continue with Email"
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full"
            disabled={isSubmitting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="mr-2 h-4 w-4"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.9 0 6.9 1.7 9 3.1l6.6-6.6C33.7 3.3 29.2 1 24 1 14.8 1 6.8 5.9 2.7 13.4l7.7 6c1.8-5 6.7-8.4 12.6-8.4z"
              />
              <path
                fill="#4285F4"
                d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.5c-.5 3.1-2 5.7-4.2 7.5l6.7 5.2C43.7 36 46.1 30.5 46.1 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.4 28.9a14.03 14.03 0 0 1 0-9.8l-7.7-6A23.97 23.97 0 0 0 1 24c0 3.8.9 7.4 2.4 10.4l7.7-6z"
              />
              <path
                fill="#34A853"
                d="M24 47c6.2 0 11.4-2.1 15.2-5.8l-7.2-6.1c-2 1.4-4.6 2.2-8 2.2-6.1 0-11.3-4.1-13.2-9.7H2.4l-7.7 6C6.8 42.1 14.8 47 24 47z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
          <p>Your email is only used to identify your quiz attempt</p>
          <p>No password is required</p>
        </CardFooter>
      </Card>
    </div>
  );
}
