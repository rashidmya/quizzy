"use client";

import { useMemo, useState } from "react";
//
import { useRouter } from "next/navigation";
// sonner
import { toast } from "sonner";
// sections
import LibraryHeader from "./library-header";
import LibraryFilters from "./library-filters";
import LibraryQuizList from "./library-quiz-list";
import EmptyState from "./library-empty-state";
// types
import { LibraryQuiz } from "@/types/quiz";
// actions
import { deleteQuiz } from "@/actions/quiz/quiz-management";
// hooks
import { useActionState } from "@/hooks/use-action-state";
import { PATH_DASHBOARD } from "@/routes/paths";

interface LibraryProps {
  quizzes: LibraryQuiz[];
}

export default function Library({ quizzes }: LibraryProps) {
  const { push } = useRouter();

  // Local state for search input and filters
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [filter, setFilter] = useState("all"); // New filter for quiz types

  const [_, deleteAction] = useActionState(deleteQuiz, {
    message: "",
  });

  // Convert prop quizzes to state so we can update (remove) on deletion
  const [quizList, setLibraryQuizList] = useState<LibraryQuiz[]>(quizzes);

  // Memoized filtered and sorted quizzes
  const filteredQuizzes = useMemo(() => {
    return applySortFilter({
      quizzes: quizList,
      comparator: getComparator(sortOrder),
      filterName: search,
      filterType: filter,
    });
  }, [quizList, search, sortOrder, filter]);

  // Handler to remove a quiz from local state
  const handleDeleteQuiz = async (quizId: string) => {
    const result = await deleteAction(quizId);
    if (result.error) {
      return toast.error(result.message);
    }
    setLibraryQuizList((prev) => prev.filter((quiz) => quiz.id !== quizId));
    toast.success(result.message);
  };

  const handleEditQuiz = async (quizId: string) => {
    push(PATH_DASHBOARD.quiz.edit(quizId));
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      <LibraryHeader totalQuizzes={quizList.length} />

      <LibraryFilters
        search={search}
        onSearchChange={(value) => setSearch(value)}
        sortOrder={sortOrder}
        onSortChange={(value) => setSortOrder(value)}
        filter={filter}
        onFilterChange={(value) => setFilter(value)}
      />

      {filteredQuizzes.length === 0 ? (
        <EmptyState searchTerm={search} />
      ) : (
        <LibraryQuizList
          quizzes={filteredQuizzes}
          onDelete={handleDeleteQuiz}
          onEdit={handleEditQuiz}
        />
      )}
    </div>
  );
}

// Create comparator functions based on the sort order
export function getComparator(
  order: string
): (a: LibraryQuiz, b: LibraryQuiz) => number {
  switch (order) {
    case "recent":
      return (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    case "least":
      return (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    case "alphabetical":
      return (a, b) => a.title.localeCompare(b.title);
    case "reverse-alpha":
      return (a, b) => b.title.localeCompare(a.title);
    case "questions":
      return (a, b) => (b.questionCount || 0) - (a.questionCount || 0);
    default:
      return () => 0;
  }
}

// Function to apply filtering and sorting to quizzes
export function applySortFilter({
  quizzes,
  comparator,
  filterName,
  filterType = "all",
}: {
  quizzes: LibraryQuiz[];
  comparator: (a: LibraryQuiz, b: LibraryQuiz) => number;
  filterName: string;
  filterType?: string;
}): LibraryQuiz[] {
  // First apply type filtering
  let filtered = [...quizzes];

  // if (filterType !== "all") {
  //   switch (filterType) {
  //     case "created":
  //       filtered = filtered.filter((quiz) => quiz.isCreator);
  //       break;
  //     case "shared":
  //       filtered = filtered.filter((quiz) => quiz.isShared);
  //       break;
  //     case "favorites":
  //       filtered = filtered.filter((quiz) => quiz.isFavorite);
  //       break;
  //   }
  // }

  // Then apply name filtering
  if (filterName) {
    filtered = filtered.filter((quiz) =>
      quiz.title.toLowerCase().includes(filterName.toLowerCase())
    );
  }

  // Stabilize the array so that equal items remain in the same order
  const stabilized = filtered.map((quiz, index) => [quiz, index] as const);

  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilized.map((el) => el[0]);
}
