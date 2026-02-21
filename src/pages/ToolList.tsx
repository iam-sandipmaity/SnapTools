import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ToolsSearchBar from "@/components/tools-search-bar";
import { toolCategories } from "@/data/tools";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ArrowRight,
  LayoutGrid,
  Command,
  Zap,
  ArrowLeft,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRecentlyUsedTools } from "@/hooks/use-recently-used-tools";
import { History } from "lucide-react";

const ToolList = () => {
  const navigate = useNavigate();
  const { recentTools } = useRecentlyUsedTools();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredCategories, setFilteredCategories] = useState(toolCategories);

  const handleSearch = (query: string) => {
    if (query.startsWith("/tools/")) {
      window.location.href = query;
    } else {
      setSearchQuery(query);
    }
  };

  useEffect(() => {
    const filtered = toolCategories.map(category => ({
      ...category,
      subTools: category.subTools?.filter(tool =>
        (tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!selectedCategory || category.id === selectedCategory)
      )
    })).filter(category => category.subTools && category.subTools.length > 0);

    setFilteredCategories(filtered);
  }, [searchQuery, selectedCategory]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Header />

      <main className="flex-grow pt-32 pb-40 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-1/4 h-[600px] bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none -z-10" />

        <div className="container max-w-7xl mx-auto px-6 relative z-10">

          {/* HERO SECTION */}
          <header className="max-w-4xl mx-auto text-center mb-24 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-8">
              <LayoutGrid className="w-3 h-3" />
              Unified Ecosystem
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
              Specialist <br />
              <em className="italic font-light text-primary">Workstation</em>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
              A comprehensive directory of high-performance utilities engineered for technical precision. Search or filter to find your tool.
            </p>

            {/* SEARCH & FILTER COMMAND BAR */}
            <div className="max-w-4xl mx-auto bg-white/50 dark:bg-white/[0.02] backdrop-blur-2xl border border-black/5 dark:border-white/5 p-2 rounded-[2rem] flex items-center gap-2 shadow-2xl focus-within:ring-2 ring-primary/20 transition-all">
              <div className="flex-1">
                <ToolsSearchBar
                  onSearch={handleSearch}
                  className="px-4"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-14 px-4 md:px-6 rounded-[1.5rem] bg-black dark:bg-white text-white dark:text-black font-black text-[9px] md:text-[10px] uppercase tracking-widest group shrink-0">
                    <span className="hidden sm:inline">
                      {selectedCategory ? toolCategories.find(c => c.id === selectedCategory)?.title : "Filter Ecosystem"}
                    </span>
                    <span className="sm:hidden">
                      {selectedCategory ? toolCategories.find(c => c.id === selectedCategory)?.title : "Filter"}
                    </span>
                    <ChevronDown className="ml-2 w-3 h-3 md:w-4 md:h-4 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 rounded-2xl bg-white/95 dark:bg-black/95 backdrop-blur-xl border-black/5 dark:border-white/10 shadow-2xl">
                  <div className="space-y-1">
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all",
                        !selectedCategory ? "bg-primary text-white" : "hover:bg-muted/50"
                      )}
                    >
                      All Tools
                    </button>
                    {toolCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all",
                          selectedCategory === category.id ? "bg-primary text-white" : "hover:bg-muted/50"
                        )}
                      >
                        {category.title}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </header>

          {/* RECENTLY USED */}
          {recentTools.length > 0 && !searchQuery && !selectedCategory && (
            <div className="mb-32">
              <div className="flex items-center gap-3 text-muted-foreground/60 font-black text-[10px] uppercase tracking-[0.3em] mb-8">
                <History className="w-3 h-3" />
                Recently Initialized Modules
              </div>
              <div className="flex flex-wrap gap-4">
                {recentTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={`/tools/${tool.categoryId}/${tool.id}`}
                    className="group px-6 py-4 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all flex items-center gap-4 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Zap size={14} />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{tool.title}</span>
                    <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* TOOLS GRID */}
          <div className="space-y-32">
            <AnimatePresence mode="wait">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <motion.section
                    key={category.id}
                    layout
                    initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(10px)", scale: 0.98, transition: { duration: 0.2 } }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      opacity: { duration: 0.3 }
                    }}
                    className="relative"
                  >
                    <div className="flex items-center gap-4 mb-12">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-primary bg-primary/10 shadow-inner", category.color)}>
                        {category.icon && <category.icon size={28} />}
                      </div>
                      <div>
                        <h2 className="text-3xl font-serif font-black tracking-tight">{category.title}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          {category.subTools?.length} Modules Available
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.subTools?.map((tool) => (
                        <motion.div
                          key={tool.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            to={`/tools/${category.id}/${tool.id}`}
                            className="group relative h-full p-8 rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/70 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-2 block overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent" />
                            <Zap className="absolute -right-4 -top-4 w-24 h-24 text-primary opacity-0 group-hover:opacity-[0.03] -rotate-12 transition-all duration-700 group-hover:rotate-0 group-hover:-translate-x-4" />

                            <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
                              {tool.title}
                              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </h3>

                            {tool.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {tool.description}
                              </p>
                            )}

                            <div className="mt-8 flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 group-hover:text-primary transition-colors">
                                Launch Module
                              </span>
                              <div className="w-8 h-8 rounded-full bg-muted/50 dark:bg-white/[0.03] flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <Command size={14} />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                ))
              ) : (
                <div className="text-center py-40 animate-fade-in-up">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Search size={40} className="text-muted-foreground" />
                  </div>
                  <h2 className="text-3xl font-serif font-black mb-4 tracking-tight">No processing modules found</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    We couldn't find any tools matching your search criteria. Try a different keyword or browse by category.
                  </p>
                  <Button
                    variant="link"
                    className="mt-8 text-primary font-bold"
                    onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                  >
                    Reset Discovery Engine
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ToolList;