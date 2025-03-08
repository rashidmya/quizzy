"use client";

import { Choice, Question } from "@/lib/db/queries/quizzes";

interface QuestionWithChoices extends Question {
  choices: Choice[];
}

export default function QuestionList({
  questions,
}: {
  questions: QuestionWithChoices[];
}) {
  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {questions.map((question) => (
          <li
            key={question.id}
            className="flex items-center py-2 px-4 rounded-lg"
          >
            <span className="text-md font-bold">{question.text}</span>
            <ul>
              {question.choices.map((choice) => (
                <li key={choice.id} className="mx-8 text-sm">{choice.text}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
