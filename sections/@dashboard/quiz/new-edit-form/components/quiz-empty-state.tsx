"use client";

import { Button } from "@/components/ui/button";
import { FileQuestion, Plus } from "lucide-react";

type QuizEmptyStateProps = {
  onAddQuestion: () => void;
};

export default function QuizEmptyState({ onAddQuestion }: QuizEmptyStateProps) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed">
      <div className="h-20 w-20 flex items-center justify-center rounded-full bg-muted mb-4">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>

      <h3 className="text-xl font-medium mb-2">No questions added yet</h3>

      <p className="text-muted-foreground max-w-md mb-6">
        Start by adding your first question. You can create multiple choice,
        true/false, fill-in-the-blank, or open-ended questions.
      </p>

      <Button onClick={onAddQuestion} size="lg" className="gap-2">
        <Plus className="h-4 w-4" />
        Add Your First Question
      </Button>

      <p className="text-xs text-muted-foreground mt-6">
        You can add as many questions as you want, and rearrange them later.
      </p>
    </div>
  );
}
