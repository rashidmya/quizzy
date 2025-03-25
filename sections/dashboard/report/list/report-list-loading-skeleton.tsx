"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function ReportsLoadingSkeleton() {
  // Create an array of length 6 for the skeleton cards
  const skeletonCards = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletonCards.map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-6 w-3/4 bg-muted rounded"></div>
            <div className="flex gap-2 mt-2">
              <div className="h-5 w-24 bg-muted rounded-full"></div>
              <div className="h-5 w-28 bg-muted rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-muted rounded"></div>
                  <div className="h-4 w-16 bg-muted rounded"></div>
                </div>
                <div className="h-2 w-full bg-muted rounded"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="h-14 w-full bg-muted rounded"></div>
                <div className="h-14 w-full bg-muted rounded"></div>
              </div>
              
              <div className="flex justify-between pt-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-6 w-28 bg-muted rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}