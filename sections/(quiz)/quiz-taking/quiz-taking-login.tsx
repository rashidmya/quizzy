"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
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

interface QuizTakingFormLoginProps {
  quizId: string;
}

export default function QuizTakingLogin({ quizId }: QuizTakingFormLoginProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await signIn("quiz-login", {
        email,
        callbackUrl: `/q/${quizId}`,
        redirect: false,
      });
      console.log("Sign in result:", result);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google-quiz-login", {
      callbackUrl: `/q/${quizId}`,
      redirect: false,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Quiz Login
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to take the quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!email || !quizId || isSubmitting}
              variant="default"
            >
              {isSubmitting ? "Signing in..." : "Login with Email"}
            </Button>
          </form>

          <div className="relative my-4">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-2 text-sm text-gray-500">OR</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full"
            disabled={!quizId}
          >
            <div className="mr-2 h-5 w-5" />
            Login with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-gray-500">
          Secure login powered by NextAuth.js
        </CardFooter>
      </Card>
    </div>
  );
}
