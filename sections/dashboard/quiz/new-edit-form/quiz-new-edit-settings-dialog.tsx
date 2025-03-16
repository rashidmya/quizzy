"use client";

import { useEffect, useState } from "react";
// react-hook-form
import { Controller, useFormContext } from "react-hook-form";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
// icons
import { Settings } from "lucide-react";
// types
import { TimerMode } from "@/types/quiz";

export default function QuizNewEditSettingsDialog() {
  const { getValues, reset } = useFormContext();

  const { title, timerMode, timer, questions } = getValues();

  const [open, setOpen] = useState(false);

  const [tempTitle, setTempTitle] = useState(title);

  const [localTimerMode, setLocalTimerMode] = useState<TimerMode>(
    timerMode || "none"
  );

  const [tempTimer, setTempTimer] = useState(timer || 0);

  // Title validation: valid if at least 4 and at most 80 characters.
  const minChars = 4;
  const maxChars = 80;
  const titleCharCount = tempTitle.length;
  const titleError =
    titleCharCount < minChars
      ? `Title must be at least ${minChars} characters.`
      : titleCharCount > maxChars
      ? `Title must be at most ${maxChars} characters.`
      : "";

  // Timer validation: simple validation if in global mode.
  const timerError =
    localTimerMode === "quiz" && tempTimer < 0
      ? "Please enter a valid timer."
      : "";

  useEffect(() => {
    if (open) {
      const { title, timerMode, timer } = getValues();
      setTempTitle(title);
      setLocalTimerMode(timerMode || "none");
      setTempTimer(timer || 0);
    }
  }, [open, getValues]);

  const handleSave = () => {
    // Only save if there are no errors.
    if (titleError || timerError) return;

    updateQuestionTimers();

    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const updateQuestionTimers = () => {
    const currentValues = getValues();

    const updatedValues = {
      ...currentValues,
      title: tempTitle,
      timerMode: localTimerMode,
      timer: localTimerMode === "quiz" ? tempTimer : undefined,
      questions:
        localTimerMode === "none"
          ? currentValues.questions.map((q: any) => ({
              ...q,
              timer: undefined,
            }))
          : localTimerMode === "quiz"
          ? currentValues.questions.map((q: any) => ({
              ...q,
              timer: undefined,
            }))
          : localTimerMode === "question"
          ? currentValues.questions.map((q: any) => ({ ...q, timer: 5 }))
          : currentValues.questions,
    };

    // Update the entire form state at once.
    reset(updatedValues);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shadow-none">
          <Settings className="h-5 w-5" /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="max-w-md p-6 overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Quiz Settings</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {/* Quiz Title Input */}
          <div className="relative">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder="Enter quiz title"
              className={`w-full py-2 text-sm pl-3 pr-14 h-10 rounded ${
                titleError ? "border-red-500" : ""
              }`}
              maxLength={maxChars}
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              {titleCharCount} / {maxChars}
            </span>
            {titleError && (
              <p className="mt-1 text-red-500 text-sm">{titleError}</p>
            )}
          </div>

          {/* Timer Mode Selection */}
          <div className="flex flex-col">
            <Label className="mb-2 text-sm">Timer Mode</Label>
            <Select
              value={localTimerMode}
              onValueChange={(value) => setLocalTimerMode(value as TimerMode)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timer mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="quiz">Global Timer</SelectItem>
                <SelectItem value="question">Per Question Timer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Global Timer Input (only if mode is "quiz") */}
          {localTimerMode === "quiz" && (
            <div className="flex flex-col">
              <Label className="mb-2 text-sm">Quiz Timer (minutes)</Label>
              <Input
                type="number"
                value={tempTimer}
                onChange={(e) => setTempTimer(Number(e.target.value))}
                placeholder="Enter timer in minutes"
                className={`w-full py-2 text-sm pl-3 pr-3 h-10 rounded ${
                  timerError ? "border-red-500" : ""
                }`}
              />
              {timerError && (
                <p className="mt-1 text-red-500 text-sm">{timerError}</p>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
