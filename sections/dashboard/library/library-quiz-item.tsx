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
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// types
import { LibraryQuiz } from "@/types/quiz";
// utils
import { fToNow } from "@/utils/format-time";

type QuizItemProps = {
  quiz: LibraryQuiz;
  onDelete: (quizId: string) => void;
  onEdit: (quizId: string) => void;
};

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

  // Format relative date
  const formattedDate = fToNow(new Date(quiz.createdAt));

  return (
    <>
      <Card className="group transition-all duration-200 hover:shadow-md">
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
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {formattedDate}
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
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs font-normal">
              {quiz.questionCount || 0}{" "}
              {quiz.questionCount === 1 ? "question" : "questions"}
            </Badge>

            {/* {quiz.isPublic && (
              <Badge variant="secondary" className="text-xs font-normal">
                Public
              </Badge>
            )} */}
          </div>
        </CardContent>

        <CardFooter className="px-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {quiz.createdBy?.name ? getInitials(quiz.createdBy.name) : "??"}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[120px]">
              {quiz.createdBy?.name || "Unknown"}
            </span>
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
