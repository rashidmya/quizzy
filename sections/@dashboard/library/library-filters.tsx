// icons
import { Search } from "lucide-react";
// components
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LibraryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortOrder: string;
  onSortChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
}

export default function LibraryFilters({
  search,
  onSearchChange,
  sortOrder,
  onSortChange,
  filter,
  onFilterChange,
}: LibraryFiltersProps) {
  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="all"
        value={filter}
        onValueChange={onFilterChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 sm:w-fit">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="created">Created</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search quizzes by title..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10"
          />
        </div>

        <Select value={sortOrder} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="least">Least Recent</SelectItem>
            <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
            <SelectItem value="reverse-alpha">Alphabetical (Z-A)</SelectItem>
            <SelectItem value="questions">Most Questions</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
