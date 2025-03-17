"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuizWithQuestions } from "@/types/quiz"; // adjust as needed
import { toast } from "sonner"; // for notifications
import { useTheme } from "next-themes";
import { useEffect } from "react";

// Define the shape of the form values.
type QuizTakingFormValues = {
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
};

type QuizTakingFormProps = {
  quiz: QuizWithQuestions;
};

export default function QuizTakingForm({ quiz }: QuizTakingFormProps) {
  const { setTheme } = useTheme();

  // Create default values: one answer per question.
  const defaultValues: QuizTakingFormValues = {
    answers: quiz.questions.map((q) => ({
      questionId: q.id,
      answer: "", // default answer is empty
    })),
  };

  const { control, handleSubmit } = useForm<QuizTakingFormValues>({
    defaultValues,
  });

  const onSubmit = async (data: QuizTakingFormValues) => {
    // Process the submitted answers.
    console.log("Submitted answers:", data);
    toast.success("Quiz submitted successfully!");
    // TODO: Send the data to your API for grading.
  };

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="max-w-3xl w-3xl m-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
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
                      <label
                        key={choice.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={choice.text}
                          id={`${question.id}-${choice.id}`}
                        />
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
                  <Input
                    {...field}
                    placeholder="Your answer"
                    className="w-full"
                  />
                )}
              />
            )}
          </div>
        ))}
        <Button type="submit">Submit Quiz</Button>
      </form>
    </div>
  );
}
