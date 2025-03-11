"use client";

import { StatCard } from "./stat-card"; // components
import { Star, Users, List, CheckCircle, Clipboard } from "lucide-react"; // lucide

export default function QuizStats() {
  // Dummy data for stats
  const averageRating = "4.5";
  const participants = "120";
  const numQuestions = "15";
  const accuracy = "85%";
  const completion = "75%";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      <StatCard 
        icon={<Star className="h-6 w-6" />} 
        label="Average Rating" 
        value={averageRating}
        tooltip="This is the collective rating given by participants after each session. It's based on a 5-star scale and provides an overview of how your sessions are perceived by your audience." 
      />
      <StatCard 
        icon={<Users className="h-6 w-6" />} 
        label="Participants" 
        value={participants}
      />
      <StatCard 
        icon={<List className="h-6 w-6" />} 
        label="Questions" 
        value={numQuestions}
      />
      <StatCard 
        icon={<CheckCircle className="h-6 w-6" />} 
        label="Accuracy" 
        value={accuracy}
        tooltip="Accuracy = Total points gained for correct & partial correct answers / (Total points for the quiz x number of participants)."
      />
      <StatCard 
        icon={<Clipboard className="h-6 w-6" />} 
        label="Completion" 
        value={completion}
        tooltip="Completion rate = Total questions attempted by class / (Total questions x number of participants)."
      />
    </div>
  );
}
