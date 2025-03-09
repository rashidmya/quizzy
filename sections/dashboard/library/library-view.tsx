"use client";

import { Input } from "@/components/ui/input";
// queries
import { Quiz } from "@/lib/db/queries/quizzes";
// sections
import QuizLibrary from "@/sections/dashboard/library/library-list";
import { useMemo, useState } from "react";
// shadcn select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const dynamic = "force-static";

export default function LibraryView({ quizzes }: { quizzes: Quiz[] }) {
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
        <Select onValueChange={(value) => setSortOrder(value)} defaultValue="recent">
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
        <QuizLibrary quizzes={filteredQuizzes} />
      )}
    </div>
  );
}

  // Function to apply filtering and sorting to quizzes.
  function applySortFilter({
    quizzes,
    comparator,
    filterName,
  }: {
    quizzes: Quiz[];
    comparator: (a: Quiz, b: Quiz) => number;
    filterName: string;
  }): Quiz[] {
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
  ): (a: Quiz, b: Quiz) => number {
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