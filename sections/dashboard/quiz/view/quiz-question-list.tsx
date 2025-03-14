"use client";

// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// queries
import { Choice, Question } from "@/lib/db/queries/quizzes";
// types
import { getQuestionTypeLabel } from "@/types/question";
// lucide icons
import { CheckCircle, XCircle } from "lucide-react";

type QuestionWithChoices = Omit<Question, "choices"> & {
  choices: Choice[];
};
type Props = {
  questions: QuestionWithChoices[];
};

export default function QuizQuestionList({ questions }: Props) {
  console.log(questions);
  return (
    <div className="space-y-4">
      {questions.map((question, i) => (
        <Card key={question.id} className="shadow-sm rounded-sm">
          <CardHeader className="flex-row justify-between items-center">
            {/* Display the question type on top (default to "Multiple choice" if not provided) */}
            <div className="text-xs capitalize font-bold">
              {i + 1}. {getQuestionTypeLabel(question.type)}
            </div>
            {/* Points display on the top right side with border */}
            <div className="flex gap-2">
              <div className="text-xs border border-gray-300 rounded px-2 py-1">
                {question.points} {question.points === 1 ? "point" : "points"}
              </div>
              <div className="text-xs border border-gray-300 rounded px-2 py-1">
                {question.timer
                  ? `${question.timer} ${question.timer === 1 ? "min" : "mins"}`
                  : ""}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="font-medium">{question.text}</CardTitle>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <p className="text-muted-foreground text-xs">answer choices</p>
                <div className="flex-grow border-t border-gray-300 ml-2" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {question.choices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {choice.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-xs">{choice.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
