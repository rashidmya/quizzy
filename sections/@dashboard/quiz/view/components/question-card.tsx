// sections/dashboard/quiz/view/components/question-card.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Award, Clock } from "lucide-react";
import { QuestionUnion } from "@/types/question";
import MultipleChoiceQuestion from "./question-types/multiple-choice-question";
import TrueFalseQuestion from "./question-types/true-false-question";
import FillInBlankQuestion from "./question-types/fill-in-blank-question";
import OpenEndedQuestion from "./question-types/open-ended-question";
import {
  getQuestionTypeLabel,
  getQuestionTypeIcon,
} from "@/utils/get-question-type";

/**
 * Props for the QuestionCard component
 */
interface QuestionCardProps {
  question: QuestionUnion;
  index: number;
}

/**
 * A card component that displays a question with its metadata and content
 */
export default function QuestionCard({ question, index }: QuestionCardProps) {
  const label = getQuestionTypeLabel(question.type);
  const icon = getQuestionTypeIcon(question.type);

  console.log(question);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="bg-muted/30 pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-6 w-6 rounded-full flex items-center justify-center p-0 font-medium"
            >
              {index + 1}
            </Badge>
            <CardTitle className="text-base font-medium">
              {question.text}
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {/* {icon && <QuestionTypeIcon className="h-3 w-3" />} */}
              {label}
            </Badge>

            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {question.points} {question.points === 1 ? "point" : "points"}
            </Badge>

            {question.timer && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              >
                <Clock className="h-3 w-3" />
                {Math.floor(question.timer / 60)}m
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Render appropriate question type component */}
        {question.type === "multiple_choice" && (
          <MultipleChoiceQuestion choices={question.choices} />
        )}

        {question.type === "true_false" && (
          <TrueFalseQuestion
            correctAnswer={question.correctAnswer}
            explanation={question.explanation}
          />
        )}

        {question.type === "fill_in_blank" && (
          <FillInBlankQuestion
            correctAnswer={question.correctAnswer}
            acceptedAnswers={question.acceptedAnswers}
          />
        )}

        {question.type === "open_ended" && (
          <OpenEndedQuestion guidelines={question.guidelines} />
        )}
      </CardContent>
    </Card>
  );
}
