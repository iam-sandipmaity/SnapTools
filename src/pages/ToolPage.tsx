
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEO from "@/components/seo";
import ToolSEO from "@/components/seo/ToolSEO";
import ToolContentSection from "@/components/seo/ToolContentSection";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { toolCategories, ToolCategory } from "@/data/tools";
import { ArrowLeft, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Tool loading component
const ToolLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-primary/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      <motion.p
        className="text-sm font-medium text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Loading tool...
      </motion.p>
    </div>
  </div>
);

// Dynamic tool loader mapping - imports tools on-demand for better code splitting
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
};


const ToolPage = () => {
  const { categoryId, toolId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<ToolCategory | null>(null);
  const [subTool, setSubTool] = useState<{ id: string; title: string; description?: string } | null>(null);
  const [ToolComponent, setToolComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Direct tool ID route handling
    if (toolId && !categoryId) {
      // Search through all categories for the tool
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

    // Category-based route handling
    const foundCategory = toolCategories.find((cat) => cat.id === categoryId);
    setCategory(foundCategory || null);

    if (foundCategory && toolId) {
      const foundTool = foundCategory.subTools?.find((tool) => tool.id === toolId);
      setSubTool(foundTool || null);
    } else if (foundCategory) {
      // If only category is provided, don't set a subtool
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
          console.warn(`No loader found for category: ${categoryId}`);
          // Fallback: Check if tool ID matches a known pattern or try to find it elsewhere
          // For now, just error
          setError(true);
          return;
        }

        const toolModule = await loader();
        const tools = toolModule.default;

        if (isMounted) {
          if (tools && tools[toolId]) {
            setToolComponent(() => tools[toolId]);
          } else {
            console.warn(`Tool ${toolId} not found in category ${categoryId}`);
            setError(true);
          }
        }
      } catch (err) {
        console.error('Error loading tool:', err);
        if (isMounted) {
          setError(true);
        }
      }
    };

    loadTool();

    return () => {
      isMounted = false;
    };
  }, [categoryId, toolId]);


  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category not found</h1>
            <Link to="/#tools">
              <Button>Back to Tools</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If we have a category but no specific tool selected, show the category view
  if (!toolId || !subTool) {
    const Icon = category.icon;

    // If we are listing categories, we should show the list.
    // However if toolId is present but subTool is null, it means tool not found in category logic above handled it.
    // But wait, the first useEffect handles setting subTool.

    // If toolId exists but subTool is null (invalid tool id for this category)
    if (toolId && !subTool) {
      return (
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Tool not found</h1>
              <Link to={`/tools/${category.id}`}>
                <Button>Back to Category</Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    // List view
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container py-8 pt-20">
          <div className="mb-8">
            <button
              onClick={() => navigate('/tools')}
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4 bg-transparent border-none cursor-pointer"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", category.color)}>
                <Icon size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{category.title}</h1>
                <p className="text-muted-foreground">Available Tools</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.subTools?.map((tool) => (
              <Link
                key={tool.id}
                to={`/tools/${category.id}/${tool.id}`}
                className="group block p-6 rounded-xl border bg-card hover:shadow-lg transition-all hover:border-primary/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-medium group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  {tool.comingSoon && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Coming Soon</span>
                  )}
                </div>
                {tool.description && (
                  <p className="text-muted-foreground">
                    {tool.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = category.icon;

  // Create a Tool object for SEO
  const toolForSEO = {
    id: subTool.id,
    name: subTool.title,
    description: subTool.description || `Free online ${subTool.title.toLowerCase()} tool. Fast, secure, and easy to use.`,
    category: category.title,
    icon: category.icon,
    features: [],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ToolSEO tool={toolForSEO} />
      <Header />
      <main className="flex-grow container py-8 pt-[80px]">
        <div className="mb-8">
          <motion.button
            onClick={() => {
              if (categoryId && toolId) {
                navigate(`/tools/${categoryId}`);
              } else if (categoryId) {
                navigate('/tools');
              } else {
                navigate('/#tools');
              }
            }}
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4 bg-transparent border-none cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </motion.button>

          <div className="flex items-center gap-4 mb-6">
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", category.color)}>
              <Icon size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{subTool.title}</h1>
              <p className="text-muted-foreground">{category.title} Tool</p>
            </div>
          </div>

          {subTool.description && (
            <p className="text-muted-foreground max-w-2xl mb-6">{subTool.description}</p>
          )}
        </div>

        {error ? (
          <div className="bg-muted/40 border rounded-xl p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Tool Under Construction</h3>
            <p className="text-center text-muted-foreground max-w-md">
              The tool <span className="font-medium text-foreground">"{subTool.title}"</span> is currently being built and will be available soon.
            </p>
            <Button className="mt-6" variant="outline" onClick={() => navigate(`/tools/${categoryId}`)}>
              Try Other {category.title}
            </Button>
          </div>
        ) : !ToolComponent ? (
          <ToolLoader />
        ) : (
          <>
            <ToolComponent />

            {/* SEO Content Section - Adds 300+ words of rich content */}
            <ToolContentSection tool={toolForSEO} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ToolPage;