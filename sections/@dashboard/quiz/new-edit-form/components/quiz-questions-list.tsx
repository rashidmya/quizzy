"use client";

import { useState } from "react";
// components
import { Button } from "@/components/ui/button";
// question cards
import MultipleChoiceCard from "./question-cards/multiple-choice-card";
import TrueFalseCard from "./question-cards/true-false-card";
import FillInBlankCard from "./question-cards/fill-in-blank-card";
import OpenEndedCard from "./question-cards/open-ended-card";
// icons
import { ChevronUp, ChevronDown } from "lucide-react";

interface QuestionFieldProps {
  questionFields: any[];
  timerMode: string;
  onUpdate: (index: number, value: any) => void;
  onDelete: (index: number) => void;
  onDuplicate: (questionData: any) => void;
  onMove: (from: number, to: number) => void;
  onChange: () => void;
}

export default function QuizQuestionsList({
  questionFields,
  timerMode,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  onChange,
}: QuestionFieldProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Render the appropriate question card based on type
  const renderQuestionCard = (field: any, index: number) => {
    switch (field.type) {
      case "multiple_choice":
        return (
          <MultipleChoiceCard
            key={field.id}
            questionIndex={index}
            question={field}
            timerMode={timerMode}
            onUpdate={(updatedQuestion) => {
              onUpdate(index, updatedQuestion);
              onChange();
            }}
            onDelete={() => {
              onDelete(index);
              onChange();
            }}
            onDuplicate={onDuplicate}
          />
        );
      case "true_false":
        return (
          <TrueFalseCard
            key={field.id}
            questionIndex={index}
            question={field}
            timerMode={timerMode}
            onUpdate={(updatedQuestion) => {
              onUpdate(index, updatedQuestion);
              onChange();
            }}
            onDelete={() => {
              onDelete(index);
              onChange();
            }}
            onDuplicate={onDuplicate}
          />
        );
      case "fill_in_blank":
        return (
          <FillInBlankCard
            key={field.id}
            questionIndex={index}
            question={field}
            timerMode={timerMode}
            onUpdate={(updatedQuestion) => {
              onUpdate(index, updatedQuestion);
              onChange();
            }}
            onDelete={() => {
              onDelete(index);
              onChange();
            }}
            onDuplicate={onDuplicate}
          />
        );
      case "open_ended":
        return (
          <OpenEndedCard
            key={field.id}
            questionIndex={index}
            question={field}
            timerMode={timerMode}
            onUpdate={(updatedQuestion) => {
              onUpdate(index, updatedQuestion);
              onChange();
            }}
            onDelete={() => {
              onDelete(index);
              onChange();
            }}
            onDuplicate={onDuplicate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {questionFields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-row gap-2 group"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="flex-1">{renderQuestionCard(field, index)}</div>

          {/* Reorder Controls */}
          <div
            className={`flex flex-col justify-center transition-opacity duration-200 ${
              hoveredIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              type="button"
              onClick={() => {
                onMove(index, index - 1);
                onChange();
              }}
              disabled={index === 0}
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              onClick={() => {
                onMove(index, index + 1);
                onChange();
              }}
              disabled={index === questionFields.length - 1}
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
