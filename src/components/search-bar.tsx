
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import SearchSuggestions from "./search-suggestions";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({ className, placeholder = "Search for any tool...", onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [matches, setMatches] = useState<any[]>([]);

  const handleSearch = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();

    const finalQuery = typeof e === 'string' ? e : query;

    if (onSearch) {
      if (selectedIndex >= 0 && matches[selectedIndex]) {
        onSearch(`/tools/${matches[selectedIndex].categoryId}/${matches[selectedIndex].id}`);
      } else {
        onSearch(finalQuery);
      }
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = (path: string) => {
    if (onSearch) {
      onSearch(path);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || matches.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(`/tools/${matches[selectedIndex].categoryId}/${matches[selectedIndex].id}`);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "relative flex w-full max-w-2xl items-center space-x-2 mx-auto",
        className
      )}
    >
      <div className="relative w-full">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 h-6 w-6" />
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-16 h-20 rounded-[2rem] pr-20 sm:pr-40 bg-white dark:bg-[#0A0A0A] border-none shadow-none text-xl font-medium focus-visible:ring-0 focus-visible:ring-offset-0 transition-all placeholder:text-muted-foreground/30 focus:outline-none"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => {
            setShowSuggestions(false);
            setSelectedIndex(-1);
          }, 200)}
        />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-16 rounded-[1.5rem] text-base font-bold px-8 bg-black dark:bg-white text-white dark:text-black hover:bg-primary transition-colors"
        >
          Initialize
        </Button>
        {showSuggestions && (
          <SearchSuggestions
            query={query}
            onSelect={handleSelect}
            selectedIndex={selectedIndex}
            onMatchesChange={setMatches}
          />
        )}
      </div>
    </form>
  );
};

export default SearchBar;
