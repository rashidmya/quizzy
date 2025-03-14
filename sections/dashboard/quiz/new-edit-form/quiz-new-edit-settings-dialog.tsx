"use client";

import { useEffect, useState } from "react";
// react-hook-form
import { useFormContext } from "react-hook-form";
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

export default function QuizNewEditSettingsDialog() {
  const { watch, setValue } = useFormContext();

  const currentTitle = watch("title");
  const currentTimerMode = watch("timerMode");
  const currentTimer = watch("timer");
  const questions = watch("questions");

  const [open, setOpen] = useState(false);

  const [tempTitle, setTempTitle] = useState(currentTitle);

  const [localTimerMode, setLocalTimerMode] = useState<"quiz" | "question">(
    currentTimerMode || "quiz"
  );

  const [tempTimer, setTempTimer] = useState(currentTimer || 0);

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
      setTempTitle(currentTitle);
      setTempTimer(currentTimer || 0);
      setLocalTimerMode(currentTimerMode || "quiz");
    }
  }, [open, currentTitle, currentTimer, currentTimerMode]);

  const handleSave = () => {
    // Only save if there are no errors.
    if (titleError || timerError) return;

    setValue("title", tempTitle);
    setValue("timerMode", localTimerMode);

    // If mode is "quiz", use the provided timer; if "question", clear the global timer.
    if (localTimerMode === "quiz") {
      setValue("timer", tempTimer);
    } else if (localTimerMode === "question") {
      questions.forEach((_: any, index: number) => {
        setValue(`questions.${index}.timer`, 60);
      });
    }

    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
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
              onValueChange={(value) =>
                setLocalTimerMode(value as "quiz" | "question")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timer mode" />
              </SelectTrigger>
              <SelectContent>
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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
