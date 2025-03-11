"use client";

// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// quizzes
import { Choice, Question } from "@/lib/db/queries/quizzes";

type QuestionWithChoices = Omit<Question, "choices"> & {
  choices: Choice[];
};
type Props = {
  questions: QuestionWithChoices[];
};

export default function QuizQuestionList({ questions }: Props) {
  return (
    <div className="space-y-4">
      {questions.map((question, i) => (
        <Card key={question.id} className="shadow-sm">
          <CardHeader>
            {/* Display the question type on top (default to "Multiple Choice" if not provided) */}
            <div className="text-xs capitalize font-bold">
              {i + 1}. {"Multiple choice"}
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="font-semibold my-2 ml-4">
              {question.text}
            </CardTitle>
            <ul className="space-y-2">
              {question.choices.map((choice) => (
                <li
                  key={choice.id}
                  className={`ml-4 text-sm ${
                    choice.isCorrect ? "font-bold text-green-600" : ""
                  }`}
                >
                  {choice.text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
