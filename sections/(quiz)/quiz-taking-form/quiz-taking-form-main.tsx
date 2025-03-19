"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuizWithQuestions } from "@/types/quiz";

export type QuizTakingFormValues = {
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
};

interface QuizTakingFormMainProps {
  quiz: QuizWithQuestions;
  onSubmit: (data: QuizTakingFormValues) => Promise<void>;
}

export default function QuizTakingFormMain({ quiz, onSubmit }: QuizTakingFormMainProps) {
  const { control, handleSubmit } = useForm<QuizTakingFormValues>({
    defaultValues: {
      answers: quiz.questions.map((q) => ({
        questionId: q.id,
        answer: "",
      })),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {quiz.questions.map((question, index) => (
        <div key={question.id} className="p-4 border rounded shadow-sm">
          <p className="mb-2 font-semibold">{question.text}</p>
          {question.type === "multiple_choice" ? (
            <Controller
              control={control}
              name={`answers.${index}.answer`}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col space-y-2"
                >
                  {question.choices.map((choice) => (
                    <label key={choice.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={choice.text} id={`${question.id}-${choice.id}`} />
                      <span>{choice.text}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
          ) : (
            <Controller
              control={control}
              name={`answers.${index}.answer`}
              render={({ field }) => (
                <Input {...field} placeholder="Your answer" className="w-full" />
              )}
            />
          )}
        </div>
      ))}
      <Button type="submit">Submit Quiz</Button>
    </form>
  );
}
