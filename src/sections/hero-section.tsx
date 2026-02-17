import { ArrowDown, Zap, ShieldCheck, Rocket, ChevronRight } from "lucide-react";
import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import AnimatedElement from "@/components/animated-element";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";

const HeroSection = () => {
  const navigate = useNavigate();
  const [toolCategoriesLoaded, setToolCategoriesLoaded] = useState(false);
  const [toolCategories, setToolCategories] = useState<any[]>([]);

  const loadToolCategories = useCallback(async () => {
    if (toolCategoriesLoaded) return toolCategories;
    const { toolCategories: categories } = await import("@/data/tools");
    setToolCategories(categories);
    setToolCategoriesLoaded(true);
    return categories;
  }, [toolCategoriesLoaded, toolCategories]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    if (query.startsWith('/tools/')) {
      navigate(query);
      return;
    }
    const categories = await loadToolCategories();
    const searchQuery = query.toLowerCase();
    for (const category of categories) {
      const subTools = category.subTools || [];
      const matchingTool = subTools.find(tool =>
        tool.title.toLowerCase().includes(searchQuery) ||
        tool.description?.toLowerCase().includes(searchQuery)
      );
      if (matchingTool) {
        navigate(`/tools/${category.id}/${matchingTool.id}`);
        return;
      }
    }
  };

  const scrollToTools = () => {
    const toolsSection = document.getElementById("tools");
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-32 lg:pt-48 pb-32 overflow-hidden bg-background" aria-label="Hero section">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="container relative z-10 px-6">
        <div className="max-w-5xl mx-auto text-center">

          {/* Elite Badge */}
          <AnimatedElement animation="fadeIn">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/10 shadow-xl backdrop-blur-xl mb-12">
              <div className="flex -space-x-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">
                Architected for Precision • 100% Client-Side Secure
              </span>
            </div>
          </AnimatedElement>

          {/* Luxury Typography Header */}
          <AnimatedElement delay={0.1} animation="fadeIn">
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-serif font-black tracking-tighter mb-10 leading-[0.85] text-foreground">
              Master your <br />
              <em className="italic font-light text-primary">Technical</em> Workflow
            </h1>
          </AnimatedElement>

          {/* Subheading with refined measure */}
          <AnimatedElement delay={0.2} animation="fadeIn">
            <p className="text-xl sm:text-2xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed mb-16 font-medium">
              A high-performance workstation for digital creators. Professional PDF, image, and data utilities running at the speed of thought.
            </p>
          </AnimatedElement>

          {/* Premium Search Integration */}
          <AnimatedElement delay={0.3} animation="fadeIn">
            <div className="max-w-2xl mx-auto mb-16 p-2 bg-white dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[2.5rem] shadow-2xl focus-within:ring-4 ring-primary/10 transition-all duration-500 z-20 relative">
              <SearchBar onSearch={handleSearch} />
            </div>
          </AnimatedElement>

          {/* Action Hub */}
          <AnimatedElement delay={0.4} animation="fadeIn">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button
                size="lg"
                onClick={() => navigate('/tools')}
                className="h-16 px-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
              >
                Explore Modules
                <Rocket className="w-4 h-4 ml-3" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={scrollToTools}
                className="h-16 px-10 rounded-2xl border-black/10 dark:border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all"
              >
                Infrastructure Overview
                <ArrowDown size={14} className="ml-3 animate-bounce" />
              </Button>
            </div>
          </AnimatedElement>

          {/* Trust Indicators */}
          <AnimatedElement delay={0.5} animation="fadeIn">
            <div className="mt-24 flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-primary" /> Private
              </div>
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                <Zap className="w-4 h-4 text-primary" /> Edge Network
              </div>
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                <ChevronRight className="w-4 h-4 text-primary" /> Open Source
              </div>
            </div>
          </AnimatedElement>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
