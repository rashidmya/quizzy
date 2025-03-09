"use client";

import { Input } from "@/components/ui/input";
// queries
import { Quiz } from "@/lib/db/queries/quizzes";
// sections
import QuizLibrary from "@/sections/dashboard/library/library-list";
import { useMemo, useState } from "react";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

export default function LibraryView({ quizzes }: { quizzes: Quiz[] }) {
  // Local state for search input.
  const [search, setSearch] = useState("");

  // Filter quizzes by title based on the search term.
  const filteredQuizzes = useMemo(
    () =>
      quizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(search.toLowerCase())
      ),
    [quizzes, search]
  );

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-2xl font-bold mb-4">Library</h1>
      {/* Search Bar */}
      <div className="mb-4 ">
        <Input
          type="text"
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
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
