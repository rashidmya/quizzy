// sections/(quiz)/quiz-taking/components/loading-state.tsx
"use client";

import { Loader2 } from "lucide-react";

/**
 * Simple loading state component
 */
export default function LoadingState() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 text-center">
      <div className="bg-background p-8 rounded-lg shadow-lg">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">Loading quiz...</p>
      </div>
    </div>
  );
}
