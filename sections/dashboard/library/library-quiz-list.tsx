"use client";

// sections
import LibraryQuizItem from "./library-quiz-item";
// types
import { LibraryQuiz } from "@/types/quiz";

type LibraryQuizListProps = {
  quizzes: LibraryQuiz[];
  onDelete: (quizId: string) => void;
  onEdit: (quizId: string) => void;
};

export default function LibraryQuizList({
  quizzes,
  onDelete,
  onEdit,
}: LibraryQuizListProps) {
  // Group quizzes by date category
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isYesterday = (date: Date) => {
    return date.toDateString() === yesterday.toDateString();
  };

  const isThisWeek = (date: Date) => {
    const daysDiff = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff < 7;
  };

  const todayQuizzes = quizzes.filter((quiz) =>
    isToday(new Date(quiz.createdAt))
  );
  const yesterdayQuizzes = quizzes.filter((quiz) =>
    isYesterday(new Date(quiz.createdAt))
  );
  const thisWeekQuizzes = quizzes.filter((quiz) => {
    const date = new Date(quiz.createdAt);
    return !isToday(date) && !isYesterday(date) && isThisWeek(date);
  });
  const olderQuizzes = quizzes.filter((quiz) => {
    const date = new Date(quiz.createdAt);
    return !isToday(date) && !isYesterday(date) && !isThisWeek(date);
  });

  return (
    <div className="space-y-8">
      {todayQuizzes.length > 0 && (
        <QuizGroup
          title="Today"
          quizzes={todayQuizzes}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}

      {yesterdayQuizzes.length > 0 && (
        <QuizGroup
          title="Yesterday"
          quizzes={yesterdayQuizzes}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}

      {thisWeekQuizzes.length > 0 && (
        <QuizGroup
          title="This Week"
          quizzes={thisWeekQuizzes}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}

      {olderQuizzes.length > 0 && (
        <QuizGroup
          title="Older"
          quizzes={olderQuizzes}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
    </div>
  );
}

type QuizGroupProps = {
  title: string;
  quizzes: LibraryQuiz[];
  onDelete: (quizId: string) => void;
  onEdit: (quizId: string) => void;
};

function QuizGroup({ title, quizzes, onDelete, onEdit }: QuizGroupProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <LibraryQuizItem
            key={quiz.id}
            quiz={quiz}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
