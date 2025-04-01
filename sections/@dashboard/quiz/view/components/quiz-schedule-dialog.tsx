// sections/dashboard/quiz/view/components/quiz-schedule-dialog.tsx
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useActionState } from "@/hooks/use-action-state";
import { scheduleQuiz } from "@/actions/quiz/quiz-management";
import { QuizStatus } from "@/types/quiz";
import { toast } from "sonner";

interface QuizScheduleDialogProps {
  children: React.ReactNode;
  quizId: string;
  onSuccess?: (status: QuizStatus) => void;
}

export default function QuizScheduleDialog({
  children,
  quizId,
  onSuccess,
}: QuizScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState("12:00");
  const [withEndDate, setWithEndDate] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [endTime, setEndTime] = useState("23:59");

  const [_, scheduleAction, isScheduling] = useActionState(scheduleQuiz, {
    message: "",
    error: false,
  });

  const resetForm = () => {
    setStartDate(undefined);
    setStartTime("12:00");
    setWithEndDate(false);
    setEndDate(undefined);
    setEndTime("23:59");
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleSchedule = async () => {
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    // Convert selected date and time to a Date object
    const [hours, minutes] = startTime.split(":").map(Number);
    const scheduleDateTime = new Date(startDate);
    scheduleDateTime.setHours(hours, minutes, 0, 0);

    // If there's an end date/time, convert that too
    let endDateTime: Date | undefined;
    if (withEndDate && endDate) {
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      endDateTime = new Date(endDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Validate that end time is after start time
      if (endDateTime <= scheduleDateTime) {
        toast.error("End time must be after start time");
        return;
      }
    }

    // Call the schedule action
    const result = await scheduleAction({
      quizId,
      scheduledAt: scheduleDateTime,
      endedAt: endDateTime,
    });

    if (result.error) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setOpen(false);
    resetForm();

    // Inform parent component of successful scheduling
    if (onSuccess) {
      onSuccess("scheduled");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Quiz</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date & Time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="with-end-date"
              checked={withEndDate}
              onCheckedChange={(checked) => setWithEndDate(checked === true)}
            />
            <Label htmlFor="with-end-date">Set an end date and time</Label>
          </div>

          {withEndDate && (
            <div className="grid gap-2 pl-6">
              <Label htmlFor="end-date">End Date & Time</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) =>
                        !date || date < (startDate || new Date())
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Scheduling a quiz will make it available to participants at the
            specified date and time. The quiz status will automatically change
            to &quot;Active&quot; at the scheduled time.
            {withEndDate &&
              " It will automatically end at the specified end time."}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSchedule}
            disabled={isScheduling || !startDate}
          >
            {isScheduling ? "Scheduling..." : "Schedule Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
