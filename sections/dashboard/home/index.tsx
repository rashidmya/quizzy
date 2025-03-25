// sections/dashboard/home/dashboard-overview.tsx
"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { QuickStats } from './quick-stats';
import { RecentQuizzes } from './recent-quizzes';
import { QuickActions } from './quick-actions';
import { PublicQuizSearch } from './public-quiz-search';
import { WelcomeMessage } from './welcome-message';

export function DashboardOverview() {
  const user = useCurrentUser();
  
  return (
    <div className="space-y-8">
      <WelcomeMessage name={user.name} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <QuickStats />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
      
      <RecentQuizzes />
      
      <PublicQuizSearch />
    </div>
  );
}