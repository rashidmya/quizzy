"use client";

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
import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

export default function QuizNewEditSettingsDialog() {
  const { watch, setValue } = useFormContext();
  const currentTitle = watch("title");
  const [open, setOpen] = useState(false);
  const [tempTitle, setTempTitle] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define min and max characters
  const minChars = 4;
  const maxChars = 80;
  const charCount = tempTitle.length;
  let errorMessage = "";
  if (charCount < 1 || charCount <= minChars) {
    errorMessage = `Title must be at least ${minChars} characters.`;
  } else if (charCount > maxChars) {
    errorMessage = `Title must be at most ${maxChars} characters.`;
  }

  useEffect(() => {
    if (open) {
      setTempTitle(currentTitle);
      inputRef.current?.focus();
    }
  }, [open, currentTitle]);

  const handleSave = () => {
    // Only save if the title is valid
    if (!errorMessage) {
      setValue("title", tempTitle);
      setOpen(false);
    }
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
      <DialogContent className="max-w-md p-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz Settings</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="relative">
            <Input
              ref={inputRef}
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              autoFocus={false}
              placeholder="Enter quiz title"
              className={`w-full focus:outline-none w-full py-2 text-sm placeholder-sm remove-number-selector pl-3 border border-solid border-dark-6 rounded focus:ring-2 focus:ring-lilac focus:ring-offset-0 bg-light-3 text-dark-2 border-dark-4 placeholder-dark-5 pr-3 !pr-14 h-10 ${errorMessage ? "border-red-500" : ""}`}
              maxLength={80}
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              {charCount} / {maxChars}
            </span>
          </div>
          {errorMessage && (
            <p className="mt-1 text-red-500 text-sm">{errorMessage}</p>
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
