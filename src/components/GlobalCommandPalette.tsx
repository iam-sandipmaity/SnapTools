import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { toolCategories } from "@/data/tools";
import {
    Search,
    Monitor,
    Zap,
    BookOpen,
    MessageCircle,
    Heart,
    Coffee,
    Star,
    History,
    Sparkles,
    ChevronRight,
    ExternalLink,
    Command as CommandIcon,
    Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecentlyUsedTools } from "@/hooks/use-recently-used-tools";

const Highlight = ({ text, query }: { text: string; query: string }) => {
    if (!query.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="text-primary font-black group-data-[selected=true]:text-white transition-colors">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

export function GlobalCommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const { recentTools } = useRecentlyUsedTools();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        setSearch("");
        command();
    };

    const searchResults = useMemo(() => {
        if (!search) return null;
        const query = search.toLowerCase();

        return toolCategories.flatMap(category =>
            (category.subTools || [])
                .filter(tool =>
                    tool.title.toLowerCase().includes(query) ||
                    category.title.toLowerCase().includes(query) ||
                    tool.description?.toLowerCase().includes(query)
                )
                .map(tool => ({
                    ...tool,
                    categoryId: category.id,
                    categoryTitle: category.title
                }))
        );
    }, [search]);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Initialize module or navigate registry..."
                value={search}
                onValueChange={setSearch}
            />
            <CommandList className="max-h-[500px] p-4 scrollbar-hide">
                <CommandEmpty className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary/20">
                            <Terminal size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-lg tracking-tight">Node Not Found</p>
                            <p className="text-xs text-muted-foreground max-w-[180px] leading-relaxed">
                                No module matches your telemetry string. Try refining your parameters.
                            </p>
                        </div>
                    </div>
                </CommandEmpty>

                {!search && (
                    <>
                        {recentTools.length > 0 && (
                            <CommandGroup heading="Recent Modules">
                                {recentTools.map((tool) => (
                                    <CommandItem
                                        key={`recent-${tool.id}`}
                                        onSelect={() => runCommand(() => navigate(`/tools/${tool.categoryId}/${tool.id}`))}
                                        className="group"
                                    >
                                        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary group-data-[selected=true]:bg-white/20 group-data-[selected=true]:text-white transition-colors">
                                            <History size={18} />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-bold tracking-tight">{tool.title}</span>
                                            <span className="text-[10px] text-muted-foreground group-data-[selected=true]:text-white/60">
                                                Previously Active Instance
                                            </span>
                                        </div>
                                        <ChevronRight size={14} className="opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        <CommandGroup heading="Quick Navigation">
                            <CommandItem onSelect={() => runCommand(() => navigate("/tools"))} className="group">
                                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 group-data-[selected=true]:bg-white/20 group-data-[selected=true]:text-white transition-colors">
                                    <Monitor size={18} />
                                </div>
                                <span className="font-bold tracking-tight">Repository Directory</span>
                                <CommandIcon size={12} className="ml-auto opacity-20" />
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/documentation"))} className="group">
                                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 group-data-[selected=true]:bg-white/20 group-data-[selected=true]:text-white transition-colors">
                                    <BookOpen size={18} />
                                </div>
                                <span className="font-bold tracking-tight">Module Documentation</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/donate"))} className="group">
                                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 group-data-[selected=true]:bg-white/20 group-data-[selected=true]:text-white transition-colors">
                                    <Heart size={18} />
                                </div>
                                <span className="font-bold tracking-tight">Support Evolution</span>
                            </CommandItem>
                        </CommandGroup>
                    </>
                )}

                {search && (
                    <CommandGroup heading="Search Results">
                        {searchResults?.map((tool) => (
                            <CommandItem
                                key={tool.id}
                                onSelect={() => runCommand(() => navigate(`/tools/${tool.categoryId}/${tool.id}`))}
                                className="group"
                            >
                                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary group-data-[selected=true]:bg-white/20 group-data-[selected=true]:text-white transition-colors">
                                    <Zap size={18} />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="font-bold tracking-tight">
                                        <Highlight text={tool.title} query={search} />
                                    </span>
                                    <span className="text-[10px] text-muted-foreground group-data-[selected=true]:text-white/60 line-clamp-1">
                                        Found in <Highlight text={tool.categoryTitle} query={search} /> Suite • {tool.description}
                                    </span>
                                </div>
                                <ExternalLink size={14} className="opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>

            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 bg-muted/20 px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <kbd className="h-5 px-1.5 rounded border border-black/5 dark:border-white/10 bg-background flex items-center justify-center font-mono text-[10px]">↑↓</kbd>
                        Navigate
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="h-5 px-1.5 rounded border border-black/5 dark:border-white/10 bg-background flex items-center justify-center font-mono text-[10px]">↵</kbd>
                        Select
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="h-5 px-1.5 rounded border border-black/5 dark:border-white/10 bg-background flex items-center justify-center font-mono text-[10px]">ESC</kbd>
                        Close
                    </div>
                </div>
                <div className="flex items-center gap-2 text-primary/40">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Processing Node v2.0.4</span>
                </div>
            </div>
        </CommandDialog>
    );
}
