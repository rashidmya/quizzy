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
        <Card key={question.id} className="shadow-sm rounded-sm">
          <CardHeader className="flex-row justify-between items-center">
            {/* Display the question type on top (default to "Multiple choice" if not provided) */}
            <div className="text-xs capitalize font-bold">
              {i + 1}. {"Multiple choice"}
            </div>
            {/* Points display on the top right side with border */}
            <div className="text-xs border border-gray-300 rounded px-2 py-1">
              {/* {question.points ? `${question.points} ${question.points === 1 ? "point" : "points"}` : "0 points"} */}
              1 points
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="my-2 ml-4">
              {question.text}
            </CardTitle>
            <ul className="space-y-2">
              {question.choices.map((choice) => (
                <li
                  key={choice.id}
                  className={`ml-4 text-sm font-light ${
                    choice.isCorrect ? " text-green-600" : ""
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