import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  query: string;
  onSelect: (path: string) => void;
  selectedIndex: number;
  onMatchesChange?: (matches: MatchingTool[]) => void;
}

interface MatchingTool {
  title: string;
  id: string;
  categoryId: string;
  description?: string;
}

const SearchSuggestions = ({ query, onSelect, selectedIndex, onMatchesChange }: SearchSuggestionsProps) => {
  const [matches, setMatches] = useState<MatchingTool[]>([]);
  const [toolCategories, setToolCategories] = useState<any[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Lazy load tool categories only when search is used
  const loadToolCategories = useCallback(async () => {
    if (categoriesLoaded) return toolCategories;

    const { toolCategories: categories } = await import('@/data/tools');
    setToolCategories(categories);
    setCategoriesLoaded(true);
    return categories;
  }, [categoriesLoaded, toolCategories]);

  useEffect(() => {
    const searchTools = async () => {
      if (!query.trim()) {
        setMatches([]);
        onMatchesChange?.([]);
        return;
      }

      // Load tool categories only when user starts searching
      const categories = await loadToolCategories();

      const searchQuery = query.toLowerCase();
      const matchingTools: MatchingTool[] = [];

      for (const category of categories) {
        const subTools = category.subTools || [];
        const categoryMatches = subTools
          .filter(tool =>
            tool.title.toLowerCase().includes(searchQuery) ||
            tool.description?.toLowerCase().includes(searchQuery)
          )
          .map(tool => ({
            title: tool.title,
            id: tool.id,
            categoryId: category.id,
            description: tool.description
          }));

        matchingTools.push(...categoryMatches);
      }

      const topMatches = matchingTools.slice(0, 8);
      setMatches(topMatches);
      onMatchesChange?.(topMatches);
    };

    searchTools();
  }, [query, loadToolCategories, onMatchesChange]);

  if (!matches.length) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-4 bg-white dark:bg-[#080808] border border-black/10 dark:border-white/10 rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.4)] overflow-hidden z-[1000] animate-in fade-in slide-in-from-top-4 duration-500 ring-1 ring-black/5 dark:ring-white/5 p-2">
      <div className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-black/5 dark:border-white/5 mb-2">
        Matching Modules
      </div>
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {matches.map((tool, index) => (
          <button
            key={`${tool.categoryId}-${tool.id}`}
            className={cn(
              "w-full group flex items-start gap-4 px-6 py-4 text-left transition-all duration-300 rounded-[1.5rem] mb-1",
              selectedIndex === index
                ? "bg-foreground/5 dark:bg-white/10 scale-[0.98] ring-1 ring-foreground/10 dark:ring-white/10"
                : "hover:bg-black/5 dark:hover:bg-white/5"
            )}
            onClick={() => onSelect(`/tools/${tool.categoryId}/${tool.id}`)}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500",
              selectedIndex === index ? "bg-foreground text-background scale-110 shadow-xl" : "bg-black/5 dark:bg-white/5 text-muted-foreground group-hover:text-primary"
            )}>
              <span className="text-[10px] font-black">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-bold text-lg leading-tight transition-colors duration-300",
                selectedIndex === index ? "text-foreground" : "text-foreground/80"
              )}>
                {tool.title}
              </div>
              {tool.description && (
                <div className="text-sm text-muted-foreground/60 truncate mt-1">
                  {tool.description}
                </div>
              )}
            </div>
            {selectedIndex === index && (
              <div className="shrink-0 animate-in fade-in zoom-in duration-500">
                <div className="px-3 py-1.5 rounded-full bg-foreground text-background text-[8px] font-black uppercase tracking-widest border border-foreground/10 shadow-sm">
                  Initialize
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchSuggestions;