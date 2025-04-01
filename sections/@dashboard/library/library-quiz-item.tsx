"use client";

import { useState } from "react";
// next/nav
import { useRouter } from "next/navigation";
// icons
import {
  BookOpen,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Share2,
  Star,
  Clock,
  CalendarClock,
  PlusCircle,
} from "lucide-react";
// components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StatusBadge from "@/components/status-badge";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// types
import { LibraryQuiz } from "@/types/quiz";
// utils
import { fDate, fToNow } from "@/utils/format-time";

interface QuizItemProps {
  quiz: LibraryQuiz;
  onDelete: (quizId: string) => void;
  onEdit: (quizId: string) => void;
}

// Helper function to render the appropriate status badge

export default function LibraryQuizItem({
  quiz,
  onDelete,
  onEdit,
}: QuizItemProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleNavigation = () => {
    router.push(PATH_DASHBOARD.quiz.view(quiz.id));
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Card className="group transition-all duration-200 hover:shadow-md py-4">
        <CardHeader className="px-4 pb-0">
          <div className="flex items-start justify-between">
            <div
              className="flex-1 cursor-pointer"
              onClick={handleNavigation}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold line-clamp-1">{quiz.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                    <PlusCircle className="h-3 w-3" />
                    <span>Created {fToNow(quiz.createdAt)}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Clock className="h-3 w-3 ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Created on {fDate(quiz.createdAt, "MMMM dd, yyyy")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEdit(quiz.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Quiz
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Quiz
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="mr-2 h-4 w-4" />
                    Add to Favorites
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    Delete Quiz
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 cursor-pointer" onClick={handleNavigation}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs font-normal">
              {quiz.questionCount || 0}{" "}
              {quiz.questionCount === 1 ? "question" : "questions"}
            </Badge>

            {/* Display the status badge */}
            {<StatusBadge status={quiz.status || "draft"} />}

            {quiz.scheduledAt && quiz.status === "scheduled" && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    variant="outline"
                    className="text-xs font-normal bg-blue-50 dark:bg-blue-900/20"
                  >
                    <CalendarClock className="mr-1 h-3 w-3" />
                    {fDate(quiz.scheduledAt, "MMM dd, HH:mm")}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Scheduled for{" "}
                    {fDate(quiz.scheduledAt, "MMMM dd, yyyy 'at' HH:mm")}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-4 pt-3 flex items-center justify-between border-t bg-muted/10">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border border-border/50">
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {quiz.createdBy?.name ? getInitials(quiz.createdBy.name) : "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium truncate max-w-[120px]">
                {quiz.createdBy?.name || "Unknown"}
              </span>
              <span className="text-[10px] text-muted-foreground">Creator</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                    <span>Updated {fToNow(quiz.updatedAt)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">
                    Last updated on{" "}
                    {fDate(quiz.updatedAt, "MMMM dd, yyyy 'at' HH:mm")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{quiz.title}" and all associated
              questions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete(quiz.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
