import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEO from "@/components/seo";
import ToolSEO from "@/components/seo/ToolSEO";
import ToolContentSection from "@/components/seo/ToolContentSection";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toolCategories, ToolCategory } from "@/data/tools";
import { ArrowLeft, Wrench, Zap, Command, ShieldCheck, Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import AnimatedElement from "@/components/animated-element";
import { toast } from "sonner";


// Premium Tool Loader
const ToolLoader = () => (
  <div className="flex flex-col items-center justify-center py-40 bg-white/50 dark:bg-black/20 backdrop-blur-3xl rounded-[4rem] border border-black/5 dark:border-white/5 shadow-2xl">
    <div className="relative w-24 h-24 mb-12">
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-primary/10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-t-4 border-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Zap className="w-8 h-8 text-primary animate-pulse" />
      </div>
    </div>
    <div className="text-center space-y-3">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Initializing Module</p>
      <h4 className="text-3xl font-serif font-black tracking-tighter">Synchronizing Logic...</h4>
    </div>
  </div>
);

// Dynamic tool loader mapping
const toolLoaders: Record<string, () => Promise<any>> = {
  image: () => import("@/components/tools/image"),
  pdf: () => import("@/components/tools/pdf"),
  calculator: () => import("@/components/tools/calculator"),
  conversion: () => import("@/components/tools/conversion"),
  qr: () => import("@/components/tools/qr"),
  password: () => import("@/components/tools/password"),
  color: () => import("@/components/tools/color"),
  unit: () => import("@/components/tools/unit"),
  currency: () => import("@/components/tools/currency"),
  miscellaneous: () => import("@/components/tools/miscellaneous"),
  social: () => import("@/components/tools/social-media"),
  seoandweb: () => import("@/components/tools/seoandweb"),
  code: () => import("@/components/tools/code"),
  encryption: () => import("@/components/tools/encryption"),
  clock: () => import("@/components/tools/clock"),
  file: () => import("@/components/tools/file-sharing"),
  internet: () => import("@/components/tools/internet"),
  markdown: () => import("@/components/tools/markdown"),
  text: () => import("@/components/tools/text"),
  network: () => import("@/components/tools/networktools"),
  finance: () => import("@/components/tools/finance"),
  datetime: () => import("@/components/tools/date-and-time"),
  media: () => import("@/components/tools/media"),
  random: () => import("@/components/tools/random"),
  data: () => import("@/components/tools/data"),
  link: () => import("@/components/tools/link"),
  health: () => import("@/components/tools/health"),
  business: () => import("@/components/tools/business"),
  ai: () => import("@/components/tools/ai"),
};

const ToolPage = () => {
  const { categoryId, toolId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<ToolCategory | null>(null);
  const [subTool, setSubTool] = useState<{ id: string; title: string; description?: string } | null>(null);
  const [ToolComponent, setToolComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (toolId && !categoryId) {
      for (const cat of toolCategories) {
        const foundTool = cat.subTools?.find((tool) => tool.id === toolId);
        if (foundTool) {
          setCategory(cat);
          setSubTool(foundTool);
          return;
        }
      }
      setCategory(null);
      setSubTool(null);
      return;
    }

    const foundCategory = toolCategories.find((cat) => cat.id === categoryId);
    setCategory(foundCategory || null);

    if (foundCategory && toolId) {
      const foundTool = foundCategory.subTools?.find((tool) => tool.id === toolId);
      setSubTool(foundTool || null);
    } else if (foundCategory) {
      setSubTool(null);
    }
  }, [categoryId, toolId]);

  useEffect(() => {
    let isMounted = true;
    const loadTool = async () => {
      if (!categoryId || !toolId) return;
      try {
        setError(false);
        setToolComponent(null);
        const loader = toolLoaders[categoryId];
        if (!loader) {
          setError(true);
          return;
        }
        const toolModule = await loader();
        const tools = toolModule.default;
        if (isMounted) {
          if (tools && tools[toolId]) {
            setToolComponent(() => tools[toolId]);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        if (isMounted) setError(true);
      }
    };
    loadTool();
    return () => { isMounted = false; };
  }, [categoryId, toolId]);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32 px-6">
          <div className="text-center p-20 rounded-[4rem] bg-white dark:bg-white/[0.01] border border-black/5 dark:border-white/5 shadow-2xl">
            <h1 className="text-5xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">Ecosystem node <br />not found</h1>
            <Link to="/tools">
              <Button className="h-16 px-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary text-white">Return to Repository</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = category.icon;
  const toolForSEO = {
    id: subTool?.id || "",
    name: subTool?.title || "",
    description: subTool?.description || `Free online ${subTool?.title.toLowerCase()} tool. Fast, secure, and easy to use.`,
    category: category.title,
    icon: category.icon,
    features: [],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <ToolSEO tool={toolForSEO} />
      <Header />

      <main className="flex-grow relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-primary/[0.02] blur-[150px] -z-10" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 -z-10" />

        <div className="container max-w-7xl mx-auto px-6 pt-32 pb-40">

          {/* TOOL HEADER ARCHITECTURE */}
          <div className="mb-20">
            <AnimatedElement animation="fadeIn">
              <motion.button
                onClick={() => {
                  if (categoryId) navigate(`/tools/${categoryId}`);
                  else navigate('/tools');
                }}
                className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all mb-12 bg-transparent border-none cursor-pointer font-black text-[10px] uppercase tracking-widest"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft size={14} />
                Back to Suite
              </motion.button>
            </AnimatedElement>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="max-w-3xl">
                <AnimatedElement animation="fadeIn">
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                    <Command className="w-3 h-3" />
                    Professional Module Instance
                  </div>
                  <h1 className="text-5xl md:text-8xl font-serif font-black tracking-tighter leading-[0.9] mb-8">
                    {subTool?.title || category.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/50 dark:bg-white/[0.05] border border-black/5 dark:border-white/5 backdrop-blur-3xl shadow-sm">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", category.color)}>
                        <Icon size={18} className="text-primary" />
                      </div>
                      <span className="text-xs font-bold tracking-tight">{category.title} Suite</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <ShieldCheck size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Client-Side Logic</span>
                    </div>
                  </div>
                </AnimatedElement>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="h-14 w-14 rounded-2xl border-black/5 dark:border-white/5 p-0 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-primary/5 hover:text-primary transition-all shadow-sm active:scale-95"
                  onClick={async () => {
                    const shareData = {
                      title: subTool?.title || category.title,
                      text: subTool?.description || category.description,
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

          {/* TOOL VIEWPORT */}
          <div className="relative group/viewport">
            {/* Ambient Shadow for Viewport */}
            <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-transparent blur-3xl opacity-0 group-hover/viewport:opacity-40 transition-opacity duration-1000 -z-10" />

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/50 dark:bg-black/20 backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-[4rem] p-24 md:p-40 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden relative isolate"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-primary/5 animate-pulse -z-10" />
                  <div className="w-24 h-24 rounded-[2.5rem] bg-muted/50 border border-black/5 dark:border-white/5 flex items-center justify-center mb-10 shadow-inner group/icon hover:rotate-12 transition-transform">
                    <Wrench className="w-10 h-10 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-serif font-black tracking-tighter mb-6 leading-tight">Infrastructure <br /><em className="italic font-light text-primary">Not Yet Initialized</em></h3>
                  <p className="text-lg text-muted-foreground/80 font-medium max-w-md mb-12">
                    The specialized module <span className="text-foreground font-bold">"{subTool?.title}"</span> is currently undergoing technical validation.
                  </p>
                  <Button
                    className="h-16 px-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all"
                    onClick={() => navigate(`/tools/${categoryId}`)}
                  >
                    Explore Alternative Modules
                  </Button>
                </motion.div>
              ) : !ToolComponent ? (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ToolLoader />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative z-10"
                >
                  <div className="bg-white/80 dark:bg-black/40 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[4rem] p-8 md:p-16 shadow-2xl ring-1 ring-black/5">
                    <ToolComponent />
                  </div>

                  {/* SEO & DOCUMENTATION SECTION */}
                  <div id="info-section" className="mt-40 pt-40 border-t border-black/5 dark:border-white/5">
                    <ToolContentSection tool={toolForSEO} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ToolPage;