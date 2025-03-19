"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

interface QuizTakingFormLoginProps {
  quizId: string;
}

export default function QuizTakingFormLogin({
  quizId,
}: QuizTakingFormLoginProps) {
  const [email, setEmail] = useState("");

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn("quiz-login", {
      email,
      callbackUrl: `/q/${quizId}`,
      redirect: false,
    });
    console.log("Sign in result:", result);
  };

  const handleGoogleLogin = async () => {
    await signIn("google-quiz-login", {
      callbackUrl: `/q/${quizId}`,
      redirect: false,
    });
  };

  return (
    <div className="max-w-md w-full m-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz Login</h1>
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!email || !quizId}
        >
          Login with Email
        </button>
      </form>
      <button
        onClick={handleGoogleLogin}
        className="btn btn-outline mt-4"
        disabled={!quizId}
      >
        Login with Google
      </button>
    </div>
  );
}
