"use client";

import { useState, useEffect } from "react";
// components
import ReportsHeader from "./report-header";
import ReportsList from "./report-list";
import ReportsEmptyState from "./report-empty-state";
import ReportsLoadingSkeleton from "./report-loading-skeleton";
// types
import { QuizReport } from "./report-types";

export default function ReportList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<QuizReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<QuizReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching data from API
  useEffect(() => {
    const fetchReports = async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data for demonstration
      const mockReports: QuizReport[] = [
        {
          id: "1",
          title: "JavaScript Fundamentals Quiz",
          accuracy: 78.5,
          completionRate: 92.3,
          participantCount: 45,
          questionCount: 20,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          lastAttempt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          author: {
            id: "user1",
            name: "John Doe",
          },
        },
        {
          id: "2",
          title: "React Hooks Assessment",
          accuracy: 65.2,
          completionRate: 88.7,
          participantCount: 32,
          questionCount: 15,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          lastAttempt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          author: {
            id: "user1",
            name: "John Doe",
          },
        },
        {
          id: "3",
          title: "CSS Grid & Flexbox Challenge",
          accuracy: 82.1,
          completionRate: 95.5,
          participantCount: 67,
          questionCount: 12,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          lastAttempt: new Date(),
          author: {
            id: "user1",
            name: "John Doe",
          },
        },
        {
          id: "4",
          title: "TypeScript Proficiency Test",
          accuracy: 71.8,
          completionRate: 87.2,
          participantCount: 28,
          questionCount: 25,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          lastAttempt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          author: {
            id: "user1",
            name: "John Doe",
          },
        },
        {
          id: "5",
          title: "Node.js Backend Knowledge",
          accuracy: 68.4,
          completionRate: 79.1,
          participantCount: 19,
          questionCount: 18,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          lastAttempt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          author: {
            id: "user1",
            name: "John Doe",
          },
        },
      ];

      setReports(mockReports);
      setFilteredReports(mockReports);
      setIsLoading(false);
    };

    fetchReports();
  }, []);

  // Filter reports when search query changes
  useEffect(() => {
    const filtered = reports.filter((report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchQuery, reports]);

  return (
    <div className="container mx-auto space-y-6 py-8">
      <ReportsHeader 
        totalReports={reports.length} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {isLoading ? (
        <ReportsLoadingSkeleton />
      ) : filteredReports.length === 0 ? (
        <ReportsEmptyState searchQuery={searchQuery} />
      ) : (
        <ReportsList reports={filteredReports} />
      )}
    </div>
  );
}