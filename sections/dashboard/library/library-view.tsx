"use client";

import { useMemo, useState } from "react";
// sections
import QuizList from "@/sections/dashboard/library/library-list";
// components
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// types
import { LibraryQuiz } from "@/types/quiz";

type Props = {
  quizzes: LibraryQuiz[];
};

export const dynamic = "force-static";

export default function LibraryView({ quizzes }: Props) {
  // Local state for search input.
  const [search, setSearch] = useState("");
  // Local state for sort order.
  const [sortOrder, setSortOrder] = useState("recent");

  // Memoized filtered and sorted quizzes.
  const filteredQuizzes = useMemo(() => {
    return applySortFilter({
      quizzes,
      comparator: getComparator(sortOrder),
      filterName: search,
    });
  }, [quizzes, search, sortOrder]);

  return (
    <div className="relative w-full mx-auto px-5 md:px-0 overflow-hidden p-12 max-w-[890px]">
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-bold mb-4">Library</h1>
        {/* Search Bar and Sort Dropdown */}
        <div className="mb-4 flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
          <Select
            onValueChange={(value) => setSortOrder(value)}
            defaultValue="recent"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="least">Least Recent</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filteredQuizzes.length === 0 ? (
          // Fallback content with a fixed min height to prevent collapsing.
          <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
            No quizzes found.
          </div>
        ) : (
          <QuizList quizzes={filteredQuizzes} />
        )}
      </div>
    </div>
  );
}

// Function to apply filtering and sorting to quizzes.
// Function to apply filtering and sorting to quizzes.
function applySortFilter({
  quizzes,
  comparator,
  filterName,
}: {
  quizzes: LibraryQuiz[];
  comparator: (a: LibraryQuiz, b: LibraryQuiz) => number;
  filterName: string;
}): LibraryQuiz[] {
  // Filter quizzes based on the search term.
  let filtered = quizzes;
  if (filterName) {
    filtered = filtered.filter((quiz) =>
      quiz.title.toLowerCase().includes(filterName.toLowerCase())
    );
  }

  // Stabilize the array so that equal items remain in the same order.
  const stabilized = filtered.map((quiz, index) => [quiz, index] as const);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

// Create comparator functions based on the sort order.
function getComparator(
  order: string
): (a: LibraryQuiz, b: LibraryQuiz) => number {
  if (order === "recent") {
    return (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }
  if (order === "least") {
    return (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }
  if (order === "alphabetical") {
    return (a, b) => a.title.localeCompare(b.title);
  }
  return () => 0;
}
