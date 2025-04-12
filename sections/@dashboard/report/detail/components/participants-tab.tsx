"use client";

import { useState } from "react";
import { Search, Eye, CheckCircle2, XCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAttemptAnswers } from "@/actions/quiz/quiz-taking";
import { toast } from "sonner";
import { getQuestionTypeLabel } from "@/utils/get-question-type";
import { QuestionType } from "@/types/question";

interface Participant {
  id: string;
  email: string;
  score: number;
  accuracy: number;
  attemptedQuestions: number;
}

interface ParticipantsTabProps {
  participants: Participant[];
  totalPoints: number;
  quizId: string;
}

export default function ParticipantsTab({
  participants,
  totalPoints,
  quizId: _quizId,
}: ParticipantsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [participantAnswers, setParticipantAnswers] = useState<
    | {
        questionId: string;
        answer: string;
        updatedAt?: Date;
        questionText?: string;
        answerText?: string;
        questionType?: string;
        isCorrect?: boolean;
      }[]
    | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter participants based on search query
  const filteredParticipants = participants.filter((participant) =>
    participant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle viewing a participant's details
  const handleViewParticipant = async (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsLoading(true);
    setError(null);

    try {
      // Fetch the participant's answers
      const result = await getAttemptAnswers({ attemptId: participant.id });

      if (result.answers && result.answers.length > 0) {
        setParticipantAnswers(result.answers);
      } else {
        // If we get no answers but the participant has attempted questions
        if (participant.attemptedQuestions > 0) {
          setError(
            `Expected ${participant.attemptedQuestions} answers but received none from the server`
          );
          toast.error("Failed to load participant answers");
        }
        setParticipantAnswers([]);
      }
    } catch (error) {
      console.error("Failed to fetch participant answers:", error);
      setError(
        "Error fetching answers: " +
          (error instanceof Error ? error.message : String(error))
      );
      setParticipantAnswers([]);
      toast.error("Failed to load participant answers");
    }

    setIsLoading(false);
    setIsDialogOpen(true);
  };

  // Helper to get formatted answer display text
  const getAnswerDisplayText = (answer: {
    answer: string;
    questionType?: string;
    answerText?: string;
  }) => {
    // If we have answerText (e.g. for multiple choice), use that
    if (answer.answerText) {
      return answer.answerText;
    }

    // Format true/false answers with capitalization
    if (answer.questionType === "true_false") {
      // Always convert to string first in case it's a boolean
      const answerStr = String(answer.answer).toLowerCase().trim();

      // Explicitly check against string values
      if (answerStr === "true") {
        return "True";
      } else if (answerStr === "false") {
        return "False";
      }

      // If it's not a standard true/false value, return as is
      return answer.answer;
    }

    // Otherwise fall back to the raw answer
    return answer.answer;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Participants</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Attempted Questions</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No participants found
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      {participant.email}
                    </TableCell>
                    <TableCell>
                      {participant.score} / {totalPoints}
                    </TableCell>
                    <TableCell>{participant.accuracy.toFixed(1)}%</TableCell>
                    <TableCell>{participant.attemptedQuestions}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewParticipant(participant)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for participant details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Participant: {selectedParticipant?.email}</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Score
                  </p>
                  <p className="text-lg font-medium">
                    {selectedParticipant?.score} / {totalPoints}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Accuracy
                  </p>
                  <p className="text-lg font-medium">
                    {selectedParticipant?.accuracy.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Questions Attempted
                  </p>
                  <p className="text-lg font-medium">
                    {selectedParticipant?.attemptedQuestions}
                  </p>
                </div>
              </div>

              {/* Answers list */}
              <div className="rounded-md border mt-4">
                <div className="p-4 bg-muted/50">
                  <h3 className="font-medium">Answers</h3>
                </div>
                <div className="p-4 divide-y">
                  {error ? (
                    <p className="text-red-500 py-4 text-center">{error}</p>
                  ) : !participantAnswers || participantAnswers.length === 0 ? (
                    <p className="text-muted-foreground py-4 text-center">
                      No answers available
                    </p>
                  ) : (
                    participantAnswers.map((answer, index) => (
                      <div key={answer.questionId} className="py-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium mb-1">
                            {answer.questionText
                              ? answer.questionText
                              : `Question ${index + 1}`}
                          </p>
                          {answer.questionType && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-center text-xs"
                            >
                              {getQuestionTypeLabel(
                                answer.questionType as QuestionType
                              )}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="font-medium mr-2">Answer:</span>
                          <span className="text-md">
                            {answer.questionType === "true_false"
                              ? String(answer.answer).toLowerCase().trim() ===
                                "true"
                                ? "True"
                                : String(answer.answer).toLowerCase().trim() ===
                                  "false"
                                ? "False"
                                : answer.answer
                              : getAnswerDisplayText(answer)}
                          </span>
                          {answer.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 ml-2 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {answer.updatedAt && (
                            <span>
                              Answered:{" "}
                              {new Date(answer.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
