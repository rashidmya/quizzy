"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Question {
  id: string;
  text: string;
  type: string;
  points: number;
  answersCount: number;
  accuracy: number;
  answerDistribution: {
    text: string;
    isCorrect: boolean;
    count: number;
  }[];
}

interface QuestionsTabProps {
  questions: Question[];
  totalParticipants: number;
}

export default function QuestionsTab({
  questions,
  totalParticipants,
}: QuestionsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Filter questions based on search query
  const filteredQuestions = questions.filter((question) =>
    question.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle question expansion
  const toggleQuestionExpand = (questionId: string) => {
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(questionId);
    }
  };

  // Format question type for display
  const formatQuestionType = (type: string): string => {
    switch (type) {
      case "multiple_choice":
        return "Multiple Choice";
      case "true_false":
        return "True/False";
      case "fill_in_blank":
        return "Fill in the Blank";
      case "open_ended":
        return "Open Ended";
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Questions</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No questions found
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <Collapsible
                key={question.id}
                open={expandedQuestionId === question.id}
                className="border rounded-md"
              >
                <CollapsibleTrigger
                  onClick={() => toggleQuestionExpand(question.id)}
                  className="flex items-center justify-between w-full p-4 text-left"
                >
                  <div className="space-y-1">
                    <h3 className="font-medium text-base truncate pr-4 max-w-2xl">
                      {question.text}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {formatQuestionType(question.type)}
                      </Badge>
                      <span>{question.points} pts</span>
                      <span>•</span>
                      <span>{question.answersCount} answers</span>
                      <span>•</span>
                      <span>{question.accuracy}% accuracy</span>
                    </div>
                  </div>
                  {expandedQuestionId === question.id ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 border-t">
                  {question.type === "multiple_choice" && question.answerDistribution.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Answer Distribution</h4>
                      {question.answerDistribution.map((answer, index) => {
                        const percentage =
                          totalParticipants > 0
                            ? (answer.count / totalParticipants) * 100
                            : 0;
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="truncate max-w-md">
                                  {answer.text}
                                </span>
                                {answer.isCorrect && (
                                  <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                                )}
                              </div>
                              <span>
                                {answer.count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress
                              value={percentage}
                              className={`h-2 ${answer.isCorrect ? "[&>div]:bg-green-500" : ""}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : question.type === "true_false" && question.answerDistribution.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Answer Distribution</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {question.answerDistribution.map((answer, index) => {
                          const percentage =
                            totalParticipants > 0
                              ? (answer.count / totalParticipants) * 100
                              : 0;
                          
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    {answer.text}
                                  </span>
                                  {answer.isCorrect && (
                                    <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                                  )}
                                </div>
                                <span>
                                  {answer.count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <Progress
                                value={percentage}
                                className={`h-2 ${answer.isCorrect ? "[&>div]:bg-green-500" : ""}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : question.type === "fill_in_blank" && question.answerDistribution.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Most Common Answers</h4>
                      {question.answerDistribution.map((answer, index) => {
                        const percentage =
                          totalParticipants > 0
                            ? (answer.count / totalParticipants) * 100
                            : 0;
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="truncate max-w-md font-mono bg-muted px-2 py-0.5 rounded">
                                  &quot;{answer.text}&quot;
                                </span>
                                {answer.isCorrect && (
                                  <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                                )}
                              </div>
                              <span>
                                {answer.count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress
                              value={percentage}
                              className={`h-2 ${answer.isCorrect ? "[&>div]:bg-green-500" : ""}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      {question.type === "multiple_choice" || question.type === "true_false" || question.type === "fill_in_blank"
                        ? "No answer data available"
                        : `Answer statistics not available for ${formatQuestionType(
                            question.type
                          )} questions`}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 