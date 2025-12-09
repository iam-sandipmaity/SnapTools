# SnapTools API Documentation

> Comprehensive guide to integrating and working with SnapTools components and APIs.

## 📑 Table of Contents

- [Tool Integration](#tool-integration)
- [Component Integration](#component-integration)
- [URL Patterns](#url-patterns)
- [Search Implementation](#search-implementation)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)

## Tool Integration

### Tool Category Structure
```typescript
type ToolCategory = {
  id: string;          // Unique identifier for the category
  title: string;       // Display name
  icon: any;           // Lucide icon component
  description?: string;// Optional category description
  color?: string;      // Tailwind color class
  gradient?: {         // Optional gradient colors
    from: string;
    to: string;
  };
  subTools?: {         // Array of tools in this category
    id: string;        // Unique tool identifier
    title: string;     // Tool display name
    description?: string; // Optional tool description
  }[];
};
```

## Component Integration

### SearchBar Component
```typescript
interface ToolsSearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}
```

The SearchBar component provides real-time search functionality:
- Accepts custom styling via className
- Configurable placeholder text
- onSearch callback for search query handling

### Search Suggestions
```typescript
interface SearchSuggestionsProps {
  query: string;
  onSelect: (path: string) => void;
}
```

Provides auto-complete suggestions:
- Displays up to 5 matching tools
- Shows tool title and description
- Handles tool selection via path

## URL Patterns

### Tool Access URLs
- Tool List: `/tools`
- Category View: `/tools/{category-id}`
- Specific Tool: `/tools/{category-id}/{tool-id}`

## Search Implementation

### Global Search
```typescript
const filtered = toolCategories.map(category => ({
  ...category,
  subTools: category.subTools?.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )
})).filter(category => category.subTools && category.subTools.length > 0);
```

### Category-Specific Search
```typescript
const filtered = category.subTools.filter(
  tool =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
);
```

## Component Hierarchy

```
App
├── Header
├── ToolList
│   ├── ToolsSearchBar
│   │   └── SearchSuggestions
│   └── ToolCard
├── ToolCategoryPage
│   └── ToolCard
└── Footer
```

## State Management

The application uses React's built-in state management:
- Local component state for UI interactions

## Resources

- **Live Application**: [https://snaptools.sandipmaity.me](https://snaptools.sandipmaity.me)
- **GitHub Repository**: [https://github.com/iam-sandipmaity/SnapTools](https://github.com/iam-sandipmaity/SnapTools)
- **Documentation**: [https://snaptools.sandipmaity.me/documentation](https://snaptools.sandipmaity.me/documentation)
- URL parameters for navigation state
- Shared tool data via imports

## Best Practices

### Tool Integration
1. Always provide unique IDs for categories and tools
2. Include descriptive titles and descriptions
3. Use consistent icon components
4. Follow the established color scheme

### Search Implementation
1. Implement case-insensitive search
2. Search both titles and descriptions
3. Update results in real-time
4. Provide clear feedback for no results

### Navigation
1. Use React Router for routing
2. Maintain consistent URL patterns
3. Implement proper error handling
4. Provide clear navigation paths