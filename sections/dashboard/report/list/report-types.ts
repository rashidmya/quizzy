// Define type for quiz reports
export interface QuizReport {
    id: string;
    title: string;
    accuracy: number;
    completionRate: number;
    participantCount: number;
    questionCount: number;
    createdAt: Date;
    lastAttempt?: Date;
    author: {
      id: string;
      name: string;
    };
  }
  
  // Helper function to get badge color based on accuracy value
  export function getAccuracyBadgeColor(accuracy: number): string {
    if (accuracy >= 80) return "bg-green-500 hover:bg-green-600";
    if (accuracy >= 70) return "bg-blue-500 hover:bg-blue-600";
    if (accuracy >= 60) return "bg-yellow-500 hover:bg-yellow-600 text-yellow-900";
    return "bg-red-500 hover:bg-red-600";
  }