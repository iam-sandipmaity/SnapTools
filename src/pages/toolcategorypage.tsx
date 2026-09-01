import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEO from "@/components/seo";
import CategoryContentSection from "@/components/seo/CategoryContentSection";
import { toolCategories, ToolCategory } from "@/data/tools";
import { ArrowLeft, Search, Command, ArrowRight, Zap, ListFilter, Share2, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedElement from "@/components/animated-element";
import { toast } from "sonner";
import Breadcrumbs from "@/components/ui/breadcrumbs";


const ToolCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | null>(null);
  const [filteredTools, setFilteredTools] = useState<NonNullable<ToolCategory["subTools"]>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const foundCategory = toolCategories.find((cat) => cat.id === categoryId);
    if (!foundCategory && categoryId) {
      for (const cat of toolCategories) {
        const foundTool = cat.subTools?.find((tool) => tool.id === categoryId);
        if (foundTool) {
          navigate(`/tools/${cat.id}/${foundTool.id}`, { replace: true });
          return;
        }
      }
    }
    setCategory(foundCategory || null);
    setFilteredTools(foundCategory?.subTools || []);
    setTimeout(() => setIsLoading(false), 800);
  }, [categoryId, navigate]);

  useEffect(() => {
    if (category && category.subTools) {
      const filtered = category.subTools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTools(filtered);
    }
  }, [searchQuery, category]);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-black mb-8">Ecosystem node not found</h1>
            <Link to="/tools">
              <Button className="h-14 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest">Return to Base</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10 transition-colors duration-500">
      <SEO type="category" categoryId={categoryId} />
      <Header />

      <main className="flex-grow relative overflow-hidden">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/[0.02] blur-[120px] -z-10" />

        <div className="container max-w-7xl mx-auto px-6 pt-32 pb-40">

          {/* BREADCRUMBS */}
          <Breadcrumbs
            items={[
              { label: "Tools", href: "/tools" },
              { label: category.title }
            ]}
          />

          {/* HEADER SECTION */}
          <div className="mb-20">
            <AnimatedElement animation="fadeIn">
              <motion.button
                onClick={() => navigate('/tools')}
                className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all mb-12 bg-transparent border-none cursor-pointer font-black text-[10px] uppercase tracking-widest"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft size={14} />
                Back to Repository
              </motion.button>
            </AnimatedElement>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="max-w-2xl">
                <AnimatedElement animation="fadeIn">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner relative isolate overflow-hidden", category.color)}>
                      <div className="absolute inset-0 bg-white/20 dark:bg-black/20 blur-sm -z-10" />
                      <Icon size={32} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Module Suite</p>
                      <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter leading-[0.9]">{category.title}</h1>
                    </div>
                  </div>
                  <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                    {category.description || `Specialized ${category.title.toLowerCase()} infrastructure for professional manipulation and analysis.`}
                  </p>
                </AnimatedElement>
              </div>

              <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
                <AnimatedElement animation="fadeIn" delay={0.2}>
                  <div className="relative group/search">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5 group-focus-within/search:text-primary transition-colors" />
                    <Input
                      type="text"
                      placeholder="Filter modules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-16 w-full md:w-[320px] pl-16 rounded-2xl bg-white dark:bg-white/[0.02] border-black/5 dark:border-white/5 focus-visible:ring-primary/20 text-lg font-medium shadow-sm transition-all"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                      <Command size={14} />
                    </div>
                  </div>
                </AnimatedElement>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    className="h-14 w-14 rounded-2xl border-black/5 dark:border-white/5 p-0 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-primary/5 hover:text-primary transition-all shadow-sm active:scale-95"
                    onClick={async () => {
                      const shareData = {
                        title: category.title + " Suite",
                        text: category.description,
                        url: window.location.href,
                      };

                      try {
                        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                          await navigator.share(shareData);
                        } else {
                          throw new Error("Cannot use share API");
                        }
                      } catch (err) {
                        try {
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(window.location.href);
                            toast.success("Link copied to clipboard");
                          } else {
                            const textArea = document.createElement("textarea");
                            textArea.value = window.location.href;
                            textArea.style.position = "fixed";
                            textArea.style.left = "-9999px";
                            textArea.style.top = "0";
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            const successful = document.execCommand("copy");
                            document.body.removeChild(textArea);
                            if (successful) {
                              toast.success("Link copied to clipboard");
                            } else {
                              throw new Error("Copy failed");
                            }
                          }
                        } catch (clipErr) {
                          toast.error("Sharing not supported in this environment");
                        }
                      }
                    }}
                  >
                    <Share2 size={18} className="opacity-60" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 w-14 rounded-2xl border-black/5 dark:border-white/5 p-0 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-primary/5 hover:text-primary transition-all shadow-sm active:scale-95"
                    onClick={() => {
                      const infoSection = document.getElementById('info-section');
                      if (infoSection) {
                        infoSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <Info size={18} className="opacity-60" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* TOOLS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-10 rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl space-y-4">
                    <Skeleton className="h-8 w-3/4 rounded-xl" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                    <div className="pt-8 flex justify-between">
                      <Skeleton className="h-4 w-12 rounded-full" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                ))
              ) : (
                filteredTools.map((tool, idx) => (
                  <motion.div
                    key={tool.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <Link
                      to={tool.comingSoon ? "#" : `/tools/${category.id}/${tool.id}`}
                      aria-disabled={tool.comingSoon}
                      onClick={(event) => {
                        if (tool.comingSoon) {
                          event.preventDefault();
                        }
                      }}
                      className={`group relative block p-10 rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl transition-all duration-500 shadow-sm h-full overflow-hidden ${
                        tool.comingSoon
                          ? "cursor-not-allowed opacity-75"
                          : "hover:bg-white dark:hover:bg-white/[0.03] hover:shadow-2xl hover:shadow-primary/5"
                      }`}
                    >
                      {/* Decorative Element */}
                      <div
                        className="absolute -right-8 -top-8 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                        style={{ background: category.gradient?.from || '#6366f1' }}
                      />

                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <h3 className="text-2xl font-serif font-black tracking-tight group-hover:text-primary transition-colors leading-tight">
                          {tool.title}
                        </h3>
                        {tool.comingSoon ? (
                          <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">
                            Development
                          </span>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-[360deg] duration-700">
                            <Zap size={14} />
                          </div>
                        )}
                      </div>

                      {tool.description && (
                        <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium line-clamp-3 mb-12">
                          {tool.description}
                        </p>
                      )}

                      <div className="mt-auto pt-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                          {tool.comingSoon ? "Unavailable" : "Initialize Module"}
                        </span>
                        {tool.comingSoon ? (
                          <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                            Coming Soon
                          </span>
                        ) : (
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {!isLoading && filteredTools.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-muted/30 flex items-center justify-center mx-auto mb-8">
                <ListFilter size={32} className="text-muted-foreground/40" />
              </div>
              <h2 className="text-3xl font-serif font-black tracking-tight mb-4">No matching modules</h2>
              <p className="text-muted-foreground font-medium">Try adjusting your filter parameters to find the specialized utility.</p>
              <Button
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="mt-8 font-black text-[10px] uppercase tracking-widest text-primary"
              >
                Clear Filters
              </Button>
            </motion.div>
          )}

          {/* SEO Content Section - Only show when not searching */}
          {!searchQuery && !isLoading && (
            <div id="info-section" className="mt-40 pt-40 border-t border-black/5 dark:border-white/5">
              <CategoryContentSection
                category={{
                  id: category.id,
                  title: category.title,
                  description: category.description
                }}
                toolCount={category.subTools?.length || 0}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ToolCategoryPage;
