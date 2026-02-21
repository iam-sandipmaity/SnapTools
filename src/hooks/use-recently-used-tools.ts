import { useState, useEffect, useCallback } from "react";

export interface ToolReference {
    id: string;
    categoryId: string;
    title: string;
}

export const useRecentlyUsedTools = () => {
    const [recentTools, setRecentTools] = useState<ToolReference[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("snaptools_recent");
        if (stored) {
            try {
                setRecentTools(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse recent tools", e);
            }
        }
    }, []);

    const addTool = useCallback((tool: ToolReference) => {
        setRecentTools((prev) => {
            const filtered = prev.filter((t) => t.id !== tool.id);
            const updated = [tool, ...filtered].slice(0, 5); // Keep last 5
            localStorage.setItem("snaptools_recent", JSON.stringify(updated));
            return updated;
        });
    }, []);

    return { recentTools, addTool };
};
