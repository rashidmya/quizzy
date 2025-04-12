import { DashboardOverview } from "@/sections/@dashboard/home";
import { getServerSession } from "next-auth";
import { authMainOptions } from "@/lib/auth/main/auth.config";
import { getQuizzes, getQuizzesWithReport } from "@/lib/db/queries/quizzes";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Verify user is authenticated
  const session = await getServerSession(authMainOptions);
  
  if (!session?.user) {
    redirect("/auth/login");
    // This return is technically unreachable, but it helps TypeScript understand
    // that session and session.user are definitely not null after this point
    return null;
  }

  // Since we've checked above, we know we have a valid session with a user
  const userId = session.user.id;

  /**
   * Fetches dashboard stats for the current user
   */
  async function getDashboardStats() {
    try {
      const quizzes = await getQuizzesWithReport(userId);
      
      // Calculate stats from the quizzes data
      const totalQuizzes = quizzes.length;
      
      // Sum up all participant counts
      const totalParticipants = quizzes.reduce(
        (sum, quiz) => sum + (quiz.participantCount || 0),
        0
      );
      
      // Calculate average accuracy and completion rate
      // These should now come with proper values from the database
      const avgAccuracy = quizzes.reduce(
        (sum, quiz) => sum + quiz.accuracy,
        0
      ) / Math.max(quizzes.length, 1);
      
      const completionRate = quizzes.reduce(
        (sum, quiz) => sum + quiz.completionRate,
        0
      ) / Math.max(quizzes.length, 1);
      
      return {
        totalQuizzes,
        totalParticipants,
        avgAccuracy,
        completionRate,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalQuizzes: 0,
        totalParticipants: 0,
        avgAccuracy: 0,
        completionRate: 0,
      };
    }
  }

  /**
   * Fetches recent quizzes for the current user
   */
  async function getRecentQuizzes() {
    try {
      // Get all quizzes
      const fetchedQuizzes = await getQuizzes(userId);
      
      // Get quizzes with report data to get participant counts
      const quizzesWithReports = await getQuizzesWithReport(userId);
      
      // Create a map of quiz IDs to participant counts
      const participantCountMap: Record<string, number> = {};
      quizzesWithReports.forEach(quiz => {
        participantCountMap[quiz.id] = quiz.participantCount || 0;
      });

      // Sort by creation date and take only the most recent 3
      const recentQuizzes = fetchedQuizzes
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3)
        .map(quiz => ({
          ...quiz,
          // Add participant count from the map
          participantCount: participantCountMap[quiz.id] || 0
        }));
        
      return recentQuizzes;
    } catch (error) {
      console.error("Error fetching recent quizzes:", error);
      return [];
    }
  }

  // Fetch data on the server
  const stats = await getDashboardStats();
  const recentQuizzes = await getRecentQuizzes();

  // Pass data as props to the client component
  return <DashboardOverview stats={stats} recentQuizzes={recentQuizzes} />;
}
