
import { ArrowDown } from "lucide-react";
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

  // Lazy load tool categories only when search is used
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

    // Load tool categories only when search is actually used
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
    <section className="relative pt-20 pb-24 overflow-hidden bg-gradient-to-b from-background to-accent/30" aria-label="Hero section">
      <div className="container relative z-10 text-center">
        <AnimatedElement animation="fadeIn">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-tooltopia-purple-vivid to-primary">
            Free Online Tools for PDF, Images & More
          </h1>
        </AnimatedElement>

        <AnimatedElement delay={0.1} animation="fadeIn">
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            100+ Free Tools: <strong className="text-foreground font-medium">PDF Merger</strong>, <strong className="text-foreground font-medium">PDF Compressor</strong>, <strong className="text-foreground font-medium">Image Compressor</strong>, <strong className="text-foreground font-medium">QR Code Generator</strong>, Converters, Calculators & More
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10 max-w-3xl mx-auto text-sm sm:text-base">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground font-medium">No Registration</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-foreground font-medium">Fast & Secure</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-foreground font-medium">Privacy-Focused</span>
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement delay={0.2} animation="fadeIn">
          <div className="flex flex-col items-center space-y-8">
            <SearchBar className="w-full max-w-lg" onSearch={handleSearch} />

            <div className="flex items-center gap-4 mt-4">
              <Button
                size="lg"
                onClick={() => navigate('/tools')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Button>
              <motion.div
                whileHover={{ y: [0, -5, 0], transition: { repeat: Infinity, duration: 1.5 } }}
              >
                <Button
                  variant="ghost"
                  onClick={scrollToTools}
                  className="flex items-center gap-2"
                >
                  Explore Tools <ArrowDown size={16} />
                </Button>
              </motion.div>
            </div>
          </div>
        </AnimatedElement>
      </div>

      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-tooltopia-purple-vivid/20 rounded-full blur-3xl opacity-50"></div>
    </section>
  );
};

export default HeroSection;
