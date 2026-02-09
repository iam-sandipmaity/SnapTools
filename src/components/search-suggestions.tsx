import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (path: string) => void;
}

interface MatchingTool {
  title: string;
  id: string;
  categoryId: string;
  description?: string;
}

const SearchSuggestions = ({ query, onSelect }: SearchSuggestionsProps) => {
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

      setMatches(matchingTools.slice(0, 5)); // Limit to top 5 matches
    };

    searchTools();
  }, [query, loadToolCategories]);

  if (!matches.length) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-1 bg-background border rounded-lg shadow-lg overflow-hidden z-50">
      {matches.map((tool, index) => (
        <Button
          key={`${tool.categoryId}-${tool.id}`}
          variant="ghost"
          className="w-full justify-start px-4 py-2 text-left hover:bg-accent/50"
          onClick={() => onSelect(`/tools/${tool.categoryId}/${tool.id}`)}
        >
          <div>
            <div className="font-medium">{tool.title}</div>
            {tool.description && (
              <div className="text-sm text-muted-foreground truncate">
                {tool.description}
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default SearchSuggestions;