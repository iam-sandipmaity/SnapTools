import { useState, useEffect } from "react";
import ToolCard from "@/components/tool-card";
import { toolCategories, ToolCategory } from "@/data/tools";
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

const ToolsSection = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<ToolCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /** Stop loader once route changes */
  useEffect(() => {
    setIsNavigating(false);
  }, [location.pathname]);

  const handleToolCardClick = (category: ToolCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleSubToolClick = (categoryId: string, toolId: string) => {
    // 🔥 HARD RESET POPUP STATE
    setDialogOpen(false);
    setSelectedCategory(null);

    // 🔥 LOCK UI INTO NAVIGATION MODE
    setIsNavigating(true);

    // Navigate next frame
    requestAnimationFrame(() => {
      navigate(`/tools/${categoryId}/${toolId}`);
    });
  };

  return (
    <section id="tools" className="container-padding">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Super Tools
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse our collection of powerful tools designed to boost your
          productivity
        </p>
      </div>

      {/* Tool Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {toolCategories.map((category, index) => (
          <AnimatedElement key={category.id} delay={index * 0.1}>
            <ToolCard
              icon={category.icon}
              title={category.title}
              color={category.color}
              gradient={category.gradient}
              onClick={() => handleToolCardClick(category)}
              comingSoon={category.comingSoon}
            />
          </AnimatedElement>
        ))}
      </div>

      {/* FULLSCREEN LOADER (TOPMOST) */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <p className="text-lg font-medium text-muted-foreground">
                Loading tool...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚫 DIALOG IS COMPLETELY DISABLED DURING NAVIGATION */}
      {!isNavigating && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedCategory && (
                  <>
                    <div
                      className={`w-8 h-8 rounded-lg ${selectedCategory.color} flex items-center justify-center`}
                    >
                      <selectedCategory.icon
                        size={18}
                        className="text-primary-foreground"
                      />
                    </div>
                    {selectedCategory.title} Tools
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 p-1">
                {selectedCategory?.subTools?.map((tool) => (
                  <div
                    key={tool.id}
                    className={`p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer relative ${
                      tool.comingSoon ? "opacity-60" : ""
                    }`}
                    onClick={() =>
                      !tool.comingSoon &&
                      handleSubToolClick(
                        selectedCategory.id,
                        tool.id
                      )
                    }
                  >
                    {tool.comingSoon && (
                      <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Coming Soon
                      </span>
                    )}
                    <h3 className="font-medium">{tool.title}</h3>
                    {tool.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {tool.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default ToolsSection;
