// sections/dashboard/home/public-quiz-search.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Tag, User, Users, ExternalLink } from "lucide-react";

export function PublicQuizSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Mock popular tags - in a real app, these would come from API
  const popularTags = [
    "javascript", "react", "css", "html", "typescript", 
    "node", "programming", "web-development", "design"
  ];

  // Mock search results - in a real app, this would come from an API
  const results = [
    {
      id: "pub1",
      title: "Web Development Fundamentals",
      author: "John Doe",
      participants: 120,
      tags: ["web", "html", "css"],
      category: "programming"
    },
    {
      id: "pub2",
      title: "JavaScript ES6 Features",
      author: "Jane Smith",
      participants: 85,
      tags: ["javascript", "programming"],
      category: "programming"
    },
    {
      id: "pub3",
      title: "UX Design Principles",
      author: "Alex Chen",
      participants: 64,
      tags: ["design", "ux"],
      category: "design"
    },
  ];

  // Filter results based on active category
  const filteredResults = activeCategory === "all" 
    ? results 
    : results.filter(r => r.category === activeCategory);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // In a real app, this would make an API call
      
      // Simulate search delay
      setTimeout(() => {
        setIsSearching(false);
        setSearchCompleted(true);
      }, 1000);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      setSearchCompleted(true);
    }, 800);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Discover Public Quizzes</CardTitle>
        <CardDescription>
          Find quizzes created by the community to learn and explore
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for public quizzes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Popular Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline"
                className="text-xs cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {searchCompleted && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">
                {filteredResults.length} results for &quot;{searchQuery}&quot;
              </h4>
              
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="h-8">
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-3 h-7">All</TabsTrigger>
                  <TabsTrigger value="programming" className="text-xs px-3 h-7">Programming</TabsTrigger>
                  <TabsTrigger value="design" className="text-xs px-3 h-7">Design</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResults.map((quiz) => (
                <Card key={quiz.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium line-clamp-1">{quiz.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>by {quiz.author}</span>
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{quiz.participants} participants</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {quiz.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}