// sections/(quiz)/quiz-taking/components/current-question.tsx
"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Circle, HelpCircle, Text, Check, X } from "lucide-react";
import {
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillInBlankQuestion,
  OpenEndedQuestion,
  QuestionUnion,
  QuestionType,
} from "@/types/question";
import { getQuestionTypeLabel } from "@/utils/get-question-type";
import { useEffect, useState } from "react";

interface CurrentQuestionProps {
  question: QuestionUnion;
  isAnswered: boolean;
  questionIndex: number;
}

/**
 * Renders the current active question with its answer options
 * Works with the existing question type definitions
 */
export default function CurrentQuestion({
  question,
  isAnswered,
  questionIndex,
}: CurrentQuestionProps) {
  const { control, getValues, watch } = useFormContext();
  
  // Add a local state to force re-renders when question changes
  const [currentQuestionId, setCurrentQuestionId] = useState(question.id);
  
  // Watch the specific answer field for this question
  const answerValue = watch(`answers.${question.id}`);
  
  // Update local state when question changes
  useEffect(() => {
    if (question.id !== currentQuestionId) {
      setCurrentQuestionId(question.id);
    }
  }, [question.id, currentQuestionId]);

  /**
   * Get question icon based on question type
   */
  const getIconForQuestionType = (type: QuestionType) => {
    switch (type) {
      case "multiple_choice":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "true_false":
        return <Check className="h-4 w-4 text-green-500" />;
      case "fill_in_blank":
        return <Text className="h-4 w-4 text-purple-500" />;
      case "open_ended":
        return <HelpCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  /**
   * Renders question content based on question type
   */
  const renderQuestionContent = () => {
    switch (question.type) {
      case "multiple_choice":
        return renderMultipleChoice(question as MultipleChoiceQuestion);
      case "true_false":
        return renderTrueFalse(question as TrueFalseQuestion);
      case "fill_in_blank":
        return renderFillInBlank(question as FillInBlankQuestion);
      case "open_ended":
        return renderOpenEnded(question as OpenEndedQuestion);
      default:
        return (
          <div className="mt-4 text-muted-foreground">
            Unknown question type
          </div>
        );
    }
  };

  /**
   * Renders multiple choice question
   */
  const renderMultipleChoice = (q: MultipleChoiceQuestion) => {
    if (!q.choices || q.choices.length === 0) {
      return (
        <div className="mt-4 text-muted-foreground">
          No choices available for this question
        </div>
      );
    }

    return (
      <Controller
        control={control}
        name={`answers.${question.id}`}
        render={({ field }) => (
          <RadioGroup
            value={field.value || ""}
            onValueChange={(val) => {
              field.onChange(val);
            }}
            className="flex flex-col space-y-3 mt-4"
          >
            {q.choices.map((choice, index) => {
              const choiceId = choice.id || index.toString();
              return (
                <div
                  key={choiceId}
                  className={`flex items-center space-x-2 p-3 rounded-md border 
                    ${
                      field.value === choiceId
                        ? "bg-primary/5 border-primary"
                        : "border-gray-200 hover:bg-muted/50"
                    }`}
                >
                  <RadioGroupItem
                    value={choiceId}
                    id={`${question.id}-${choiceId}`}
                    className="text-primary"
                  />
                  <Label
                    htmlFor={`${question.id}-${choiceId}`}
                    className="flex-grow cursor-pointer font-normal"
                  >
                    {choice.text}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}
      />
    );
  };

  /**
   * Renders true/false question
   */
  const renderTrueFalse = (q: TrueFalseQuestion) => {
    return (
      <Controller
        control={control}
        name={`answers.${question.id}`}
        render={({ field }) => (
          <div className="space-y-4 mt-4">
            <RadioGroup
              value={field.value || ""}
              onValueChange={(val) => {
                field.onChange(val);
              }}
              className="flex flex-col md:flex-row gap-4"
            >
              <div
                className={`flex items-center justify-center space-x-2 p-6 rounded-md border flex-1 cursor-pointer
                  ${
                    field.value === "true"
                      ? "bg-green-50 border-green-500 dark:bg-green-900/20"
                      : "border-gray-200 hover:bg-muted/50"
                  }`}
                onClick={() => field.onChange("true")}
              >
                <RadioGroupItem
                  value="true"
                  id={`${question.id}-true`}
                  className="text-green-500"
                />
                <Label
                  htmlFor={`${question.id}-true`}
                  className="cursor-pointer font-medium text-lg flex items-center gap-2"
                >
                  <Check className="h-5 w-5 text-green-500" />
                  True
                </Label>
              </div>

              <div
                className={`flex items-center justify-center space-x-2 p-6 rounded-md border flex-1 cursor-pointer
                  ${
                    field.value === "false"
                      ? "bg-red-50 border-red-500 dark:bg-red-900/20"
                      : "border-gray-200 hover:bg-muted/50"
                  }`}
                onClick={() => field.onChange("false")}
              >
                <RadioGroupItem
                  value="false"
                  id={`${question.id}-false`}
                  className="text-red-500"
                />
                <Label
                  htmlFor={`${question.id}-false`}
                  className="cursor-pointer font-medium text-lg flex items-center gap-2"
                >
                  <X className="h-5 w-5 text-red-500" />
                  False
                </Label>
              </div>
            </RadioGroup>

            {q.explanation && (
              <div className="text-sm p-3 bg-muted/50 rounded-md border border-dashed mt-2">
                <span className="font-medium">Explanation:</span>{" "}
                {q.explanation}
              </div>
            )}
          </div>
        )}
      />
    );
  };

  /**
   * Renders fill in the blank question
   */
  const renderFillInBlank = (q: FillInBlankQuestion) => {
    return (
      <div className="mt-4">
        <Controller
          control={control}
          name={`answers.${question.id}`}
          render={({ field }) => (
            <div className="space-y-2">
              <Input
                id={`fill-blank-${question.id}`}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full"
              />
              {q.acceptedAnswers && q.acceptedAnswers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Hint:</span> Multiple answers may be correct
                </p>
              )}
            </div>
          )}
        />
      </div>
    );
  };

  /**
   * Renders open-ended question
   */
  const renderOpenEnded = (q: OpenEndedQuestion) => {
    return (
      <div className="mt-4 space-y-2">
        <Controller
          control={control}
          name={`answers.${question.id}`}
          render={({ field }) => (
            <div className="space-y-2">
              <Textarea
                id={`open-ended-${question.id}`}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full min-h-32 resize-y"
              />
              {q.guidelines && (
                <div className="text-xs p-2 bg-muted rounded-md">
                  <span className="font-medium">Guidelines:</span>{" "}
                  {q.guidelines}
                </div>
              )}
            </div>
          )}
        />
      </div>
    );
  };

  return (
    <Card
      className={`transition-all duration-200 border ${
        isAnswered
          ? "border-green-200 bg-green-50/30 dark:bg-green-900/10 dark:border-green-700/40"
          : "border-gray-200"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-sm font-medium">
            {questionIndex + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getIconForQuestionType(question.type)}
              <span className="text-xs font-medium text-muted-foreground capitalize">
                {getQuestionTypeLabel(question.type)}
              </span>
            </div>
            <CardTitle className="text-base font-medium">
              {question.text}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {renderQuestionContent()}

        {/* Answer status indicator */}
        <div className="flex items-center justify-end mt-4 text-sm text-muted-foreground">
          {isAnswered ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span>Answered</span>
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 text-amber-500 mr-1" />
              <span>Needs answer</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}