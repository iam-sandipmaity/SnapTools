import { useState, useEffect } from "react";
import ToolCard from "@/components/tool-card";
import type { ToolCategory } from "@/data/tools";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import AnimatedElement from "@/components/animated-element";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, ArrowRight, Command, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ToolsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const [toolCategories, setToolCategories] = useState<ToolCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsNavigating(false);
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("@/data/tools");
        if (!mounted) return;
        setToolCategories(mod.toolCategories || []);
      } catch (e) {
        console.error("Failed to load tool categories:", e);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToolCardClick = (category: ToolCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleSubToolClick = (categoryId: string, toolId: string) => {
    setDialogOpen(false);
    setSelectedCategory(null);
    setIsNavigating(true);
    requestAnimationFrame(() => {
      navigate(`/tools/${categoryId}/${toolId}`);
    });
  };

  return (
    <section id="tools" className="py-32 px-6 relative overflow-hidden bg-background">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-y-1/2" />

      <div className="container max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <AnimatedElement animation="fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-8">
              <Hammer className="w-3 h-3" />
              Comprehensive Directory
            </div>
            <h2 className="text-5xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
              The Core <br />
              <em className="italic font-light text-primary">Intelligence</em>
            </h2>
            <p className="text-xl text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-medium">
              Explore our architecture of 100+ specialized processing modules. From professional PDF workflows to high-fidelity conversions.
            </p>
          </AnimatedElement>
        </div>

        {/* Tool Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {loadingCategories ? (
            <div className="col-span-full text-center py-12">Loading tools...</div>
          ) : (
            toolCategories.map((category, index) => (
              <AnimatedElement key={category.id} delay={index * 0.05}>
                <ToolCard
                  icon={category.icon}
                  title={category.title}
                  description={category.description || `Specialized ${category.title.toLowerCase()} utility suite.`}
                  color={category.color}
                  gradient={category.gradient}
                  onClick={() => handleToolCardClick(category)}
                  comingSoon={category.comingSoon}
                />
              </AnimatedElement>
            ))
          )}
        </div>
      </div>

      {/* Modern Fullscreen Navigation Loader */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative flex flex-col items-center gap-6">
              <div className="relative w-24 h-24">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-primary/10"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-t-4 border-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Initializing Module</p>
                <p className="text-2xl font-serif font-black tracking-tight text-foreground">Synchronizing Logic</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refined Tool Selection Dialog */}
      {!isNavigating && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl bg-white/95 dark:bg-black/95 backdrop-blur-3xl border-black/5 dark:border-white/10 rounded-[3rem] p-0 overflow-hidden shadow-2xl transition-all duration-500">
            <div className="p-10 flex flex-col h-full max-h-[85vh]">
              <DialogHeader className="mb-10 flex flex-row items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedCategory && (
                      <>
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-primary bg-primary/10 shadow-inner", selectedCategory.color)}>
                          <selectedCategory.icon size={28} />
                        </div>
                        <div>
                          <DialogTitle className="text-3xl font-serif font-black tracking-tighter">
                            {selectedCategory.title} <span className="text-primary italic font-light font-serif">Suite</span>
                          </DialogTitle>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            {selectedCategory.subTools?.length} Specialist Modules Available
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="w-12 h-12 rounded-full bg-muted/50 dark:bg-white/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                >
                  <X size={20} />
                </button>
              </DialogHeader>

              <ScrollArea className="flex-grow -mx-4 px-4 pr-6 pb-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {selectedCategory?.subTools?.map((tool) => (
                    <motion.div
                      key={tool.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "group relative p-6 rounded-[2rem] border border-black/5 dark:border-white/5 bg-muted/30 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] transition-all duration-300 cursor-pointer overflow-hidden",
                        tool.comingSoon && "opacity-60 grayscale cursor-not-allowed"
                      )}
                      onClick={() => !tool.comingSoon && handleSubToolClick(selectedCategory.id, tool.id)}
                    >
                      {tool.comingSoon && (
                        <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-md">
                          In Queue
                        </div>
                      )}

                      <div className="space-y-2 relative z-10">
                        <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors flex items-center justify-between">
                          {tool.title}
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </h3>
                        {tool.description && (
                          <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium line-clamp-2">
                            {tool.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <Command size={10} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">Connect</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-center">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                  SnapTools • Professional Infrastructure Protocol
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default ToolsSection;
