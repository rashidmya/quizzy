// sections/(quiz)/quiz-taking/components/question-navigation.tsx
"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Question } from "@/types/question";

interface QuestionNavigationProps {
  questions: Question[];
  answers: Record<string, string>;
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
}

/**
 * Displays question navigation indicators for quick jumping between questions
 */
export default function QuestionNavigation({
  questions,
  answers,
  currentIndex,
  onSelectQuestion,
}: QuestionNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center">
      {questions.map((question, index) => {
        const isAnswered = answers[question.id]?.trim() !== "";
        const isCurrent = index === currentIndex;

        return (
          <Button
            key={index}
            variant={
              isCurrent ? "default" : isAnswered ? "outline" : "secondary"
            }
            size="sm"
            className={`w-10 h-10 p-0 rounded-full ${
              isAnswered ? "border-green-500" : ""
            } ${isCurrent ? "ring-2 ring-offset-2 ring-primary" : ""}`}
            onClick={() => onSelectQuestion(index)}
          >
            <span className="sr-only">Question {index + 1}</span>
            {isAnswered ? (
              <CheckCircle2
                className={`h-4 w-4 ${
                  isCurrent ? "text-white" : "text-green-500"
                }`}
              />
            ) : (
              index + 1
            )}
          </Button>
        );
      })}
    </div>
  );
}
