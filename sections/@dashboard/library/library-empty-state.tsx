"use client";

// next/link
import Link from "next/link";
// icons
import { Search, FilePlus } from "lucide-react";
// components
import { Button } from "@/components/ui/button";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";

type EmptyStateProps = {
  searchTerm?: string;
};

export default function LibraryEmptyState({ searchTerm }: EmptyStateProps) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed">
      {searchTerm ? (
        <>
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No quizzes found</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            We couldn't find any quizzes matching "{searchTerm}". Try a
            different search term or create a new quiz.
          </p>
        </>
      ) : (
        <>
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-muted mb-4">
            <FilePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No quizzes yet</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Get started by creating your first quiz. You can add questions,
            customize settings, and share with others.
          </p>
        </>
      )}

      <Button asChild>
        <Link href={PATH_DASHBOARD.quiz.new}>Create New Quiz</Link>
      </Button>
    </div>
  );
}
