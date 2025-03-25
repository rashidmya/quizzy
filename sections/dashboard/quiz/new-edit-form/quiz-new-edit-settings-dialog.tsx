"use client";

import { useEffect, useState } from "react";
// react-hook-form
import { useFormContext } from "react-hook-form";
// components
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// icons
import {
  Settings,
  Timer,
  Globe,
  FileText,
  TimerOff,
  AlertTriangle,
} from "lucide-react";
// types
import { TimerMode } from "@/types/quiz";
// sections
import { QuizFormValues } from "./index";
import { Switch } from "@/components/ui/switch";

export default function QuizNewEditSettingsDialog() {
  const { getValues, setValue } = useFormContext<QuizFormValues>();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Local state for form values
  const [localTitle, setLocalTitle] = useState("");
  const [localTimerMode, setLocalTimerMode] = useState<TimerMode>("none");
  const [localTimer, setLocalTimer] = useState(0);
  const [titleCharCount, setTitleCharCount] = useState(0);
  const [shuffleQuestionsEnabled, setShuffleQuestionsEnabled] = useState(false);

  // Title validation
  const minChars = 4;
  const maxChars = 80;
  const [titleError, setTitleError] = useState("");

  // Timer validation
  const [timerError, setTimerError] = useState("");

  useEffect(() => {
    if (open) {
      const values = getValues();
      setLocalTitle(values.title);
      setLocalTimerMode(values.timerMode || "none");
      setLocalTimer(values.timer ? values.timer / 60 : 0); // Convert seconds to minutes for display
      setTitleCharCount(values.title.length);
      validateTitle(values.title);
      validateTimer(values.timer || 0, values.timerMode);
      setShuffleQuestionsEnabled(values.shuffleQuestions || false);
    }
  }, [open, getValues]);

  const validateTitle = (title: string) => {
    if (title.length < minChars) {
      setTitleError(`Title must be at least ${minChars} characters.`);
      return false;
    } else if (title.length > maxChars) {
      setTitleError(`Title must be at most ${maxChars} characters.`);
      return false;
    } else {
      setTitleError("");
      return true;
    }
  };

  const validateTimer = (timer: number, mode: TimerMode) => {
    if (mode === "global" && timer < 60) {
      setTimerError("Timer must be at least 60 seconds (1 minute).");
      return false;
    } else {
      setTimerError("");
      return true;
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalTitle(value);
    setTitleCharCount(value.length);
    validateTitle(value);
  };

  const handleTimerChange = (value: number[]) => {
    const timerValue = value[0];
    setLocalTimer(timerValue);
    validateTimer(timerValue * 60, localTimerMode); // Convert minutes to seconds for validation
  };

  const handleSave = () => {
    // Validate before saving
    const isTitleValid = validateTitle(localTitle);
    const isTimerValid = validateTimer(localTimer * 60, localTimerMode);

    if (!isTitleValid || !isTimerValid) {
      return;
    }

    // Update the form values
    setValue("title", localTitle, { shouldDirty: true });
    setValue("timerMode", localTimerMode, { shouldDirty: true });
    setValue("shuffleQuestions", shuffleQuestionsEnabled, {
      shouldDirty: true,
    });

    if (localTimerMode === "global") {
      setValue("timer", localTimer * 60, { shouldDirty: true }); // Convert minutes to seconds
    } else {
      setValue("timer", undefined, { shouldDirty: true });
    }

    // Update question timers based on timer mode
    updateQuestionTimers();

    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const updateQuestionTimers = () => {
    const currentValues = getValues();

    // Handle question timers based on timer mode
    if (localTimerMode === "none") {
      const updatedQuestions = currentValues.questions.map((q: any) => ({
        ...q,
        timer: undefined,
      }));
      setValue("questions", updatedQuestions, { shouldDirty: true });
    } else if (localTimerMode === "global") {
      const updatedQuestions = currentValues.questions.map((q: any) => ({
        ...q,
        timer: undefined,
      }));
      setValue("questions", updatedQuestions, { shouldDirty: true });
    } else if (localTimerMode === "question") {
      const updatedQuestions = currentValues.questions.map((q: any) => ({
        ...q,
        timer: q.timer || 300, // Default 5 minutes per question if not set
      }));
      setValue("questions", updatedQuestions, { shouldDirty: true });
    }
  };

  // Format timer display
  const formatTimerLabel = (minutes: number) => {
    if (minutes < 1) {
      return "30 seconds";
    }
    if (minutes === 1) {
      return "1 minute";
    }
    return `${minutes} minutes`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shadow-none gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[calc(90vh-2rem)]">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-bold">
              Quiz Settings
            </DialogTitle>
            <DialogDescription>
              Configure your quiz title, timing options, and other settings
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="timing" className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Timing
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="px-6 py-4">
              <TabsContent value="general" className="mt-0 space-y-4">
                {/* Quiz Title */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="quiz-title"
                      className="text-base font-medium"
                    >
                      Quiz Title
                    </Label>
                    <span
                      className={`text-xs ${
                        titleCharCount > maxChars
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {titleCharCount}/{maxChars}
                    </span>
                  </div>

                  <Input
                    id="quiz-title"
                    value={localTitle}
                    onChange={handleTitleChange}
                    placeholder="Enter a title for your quiz"
                    maxLength={maxChars}
                    className={titleError ? "border-destructive" : ""}
                  />

                  {titleError && (
                    <p className="text-destructive text-sm">{titleError}</p>
                  )}
                </div>

                {/* Additional Settings (could be expanded) */}
                <Card className="border-dashed">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Advanced Settings
                    </CardTitle>
                    <CardDescription>
                      Additional quiz configuration options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Shuffle Questions</Label>
                        <p className="text-xs text-muted-foreground">
                          Display questions in random order for each participant
                        </p>
                      </div>
                      <Switch
                        checked={shuffleQuestionsEnabled}
                        onCheckedChange={setShuffleQuestionsEnabled}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timing" className="mt-0 space-y-4">
                {/* Timer Mode Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Timer Mode</Label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card
                      className={`cursor-pointer hover:border-primary ${
                        localTimerMode === "none"
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      onClick={() => setLocalTimerMode("none")}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <TimerOff className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">No Timer</h3>
                          <p className="text-xs text-muted-foreground">
                            Participants can take their time
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer hover:border-primary ${
                        localTimerMode === "global"
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      onClick={() => setLocalTimerMode("global")}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <Timer className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Global Timer</h3>
                          <p className="text-xs text-muted-foreground">
                            Time limit for the entire quiz
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer hover:border-primary ${
                        localTimerMode === "question"
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      onClick={() => setLocalTimerMode("question")}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <Timer className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Per Question</h3>
                          <p className="text-xs text-muted-foreground">
                            Set time limit for each question
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Global Timer Configuration */}
                {localTimerMode === "global" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-medium">
                        Quiz Time Limit
                      </Label>
                      <Badge variant="outline">
                        {formatTimerLabel(localTimer)}
                      </Badge>
                    </div>

                    <Slider
                      value={[localTimer]}
                      min={0.5}
                      max={60}
                      step={0.5}
                      onValueChange={handleTimerChange}
                      className="py-4"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground px-2">
                      <span>30 sec</span>
                      <span>30 min</span>
                      <span>60 min</span>
                    </div>

                    {timerError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{timerError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Per Question Timer Info (if selected) */}
                {localTimerMode === "question" && (
                  <Alert className="mt-2">
                    <AlertDescription>
                      Time limits can be set individually for each question in
                      the question editor. The default is 5 minutes per
                      question.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Timer mode description based on selection */}
                <Card className="bg-muted/50 border-dashed mt-4">
                  <CardContent className="p-4 text-sm">
                    {localTimerMode === "none" && (
                      <p>
                        No time limits will be applied. Participants can
                        complete the quiz at their own pace.
                      </p>
                    )}
                    {localTimerMode === "global" && (
                      <p>
                        A single timer will count down for the entire quiz. When
                        time expires, the quiz will be automatically submitted.
                      </p>
                    )}
                    {localTimerMode === "question" && (
                      <p>
                        Each question will have its own timer. When time expires
                        for a question, the participant will be automatically
                        moved to the next question.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-muted-foreground">
              {(titleError || timerError) && (
                <span className="text-destructive">
                  Please fix errors before saving
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!!titleError || !!timerError}
              >
                Save Settings
              </Button>
            </div>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
