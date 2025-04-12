// sections/dashboard/home/welcome-message.tsx
"use client";

import { motion } from "framer-motion";

interface WelcomeMessageProps {
  name?: string;
}

export function WelcomeMessage({ name }: WelcomeMessageProps) {
  // Get current time to customize greeting
  const hours = new Date().getHours();
  let greeting = "Good evening";
  
  if (hours < 12) {
    greeting = "Good morning";
  } else if (hours < 18) {
    greeting = "Good afternoon";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-2"
    >
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting}, {name || 'there'}!
      </h1>
      <p className="text-muted-foreground mt-2">
        Here&apos;s what&apos;s happening with your quizzes today.
      </p>
    </motion.div>
  );
}