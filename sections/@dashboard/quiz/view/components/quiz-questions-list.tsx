// sections/dashboard/quiz/view/components/quiz-questions-list.tsx
import { FileQuestion } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Question, QuestionUnion } from "@/types/question";
import QuestionCard from "./question-card";

/**
 * Component properties for QuizQuestionsList
 */
interface QuizQuestionsListProps {
  questions: QuestionUnion[];
}

/**
 * Displays a list of questions for a quiz with support for different question types
 */
export default function QuizQuestionsList({
  questions,
}: QuizQuestionsListProps) {
  // Empty state when there are no questions
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <FileQuestion className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">No questions yet</h3>
          <p>
            No questions have been added to this quiz yet. Edit the quiz to add
            questions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {questions.map((question, index) => (
        <QuestionCard key={question.id} question={question} index={index} />
      ))}
    </div>
  );
}
