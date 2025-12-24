
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEO from "@/components/seo";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { toolCategories, ToolCategory } from "@/data/tools";
import { ArrowLeft } from "lucide-react";
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

// Import tool components
import imageTools from "@/components/tools/image";
import pdfTools from "@/components/tools/pdf";
import calculatorTools from "@/components/tools/calculator";
import conversionTools from "@/components/tools/conversion";
import qrTools from "@/components/tools/qr";
import passwordTools from "@/components/tools/password";
import colorTools from "@/components/tools/color";
import unitTools from "@/components/tools/unit";
import currencyTools from "@/components/tools/currency";
import miscellaneousTools from "@/components/tools/miscellaneous";
import youtube from "@/components/tools/social-media";
import seoandweb from "@/components/tools/seoandweb";
import code from "@/components/tools/code";
import socialMedia from "@/components/tools/social-media";
import encryption from "@/components/tools/encryption";
import clock from "@/components/tools/clock";
import file from "@/components/tools/file-sharing";


const ToolPage = () => {
  const { categoryId, toolId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<ToolCategory | null>(null);
  const [subTool, setSubTool] = useState<{ id: string; title: string; description?: string } | null>(null);

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
  if (!toolId) {
    const Icon = category.icon;
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
                <h3 className="text-xl font-medium group-hover:text-primary transition-colors mb-2">
                  {tool.title}
                </h3>
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

  if (!subTool) {
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

  // Render the tool component dynamically based on category and tool ID
  const renderToolContent = () => {
    if (categoryId === "image" && toolId && imageTools[toolId]) {
      const ToolComponent = imageTools[toolId];
      return <ToolComponent />;
    }

    if (categoryId === "pdf" && toolId && pdfTools[toolId]) {
      const ToolComponent = pdfTools[toolId];
      return <ToolComponent />;
    }

    if (categoryId === "calculator" && toolId && calculatorTools[toolId]) {
      const ToolComponent = calculatorTools[toolId];
      return <ToolComponent />;
    }

    if (categoryId === "conversion" && toolId && conversionTools[toolId]) {
      const ToolComponent = conversionTools[toolId];
      return <ToolComponent />;
    }

    if (categoryId === "qr" && toolId && qrTools[toolId]) {
      const ToolComponent = qrTools[toolId];
      return <ToolComponent />;
    }

    if (categoryId === "password" && toolId && passwordTools[toolId]) {
      const ToolComponent = passwordTools[toolId];
      return <ToolComponent />;
    }

    if (categoryId === "color" && toolId && colorTools[toolId]) {
      const ToolComponent = colorTools[toolId];
      return <ToolComponent />;
    }

    if (categoryId === "unit" && toolId && unitTools[toolId]) {
      const ToolComponent = unitTools[toolId];
      return <ToolComponent />;
    }

    if (categoryId === "miscellaneous" && toolId && miscellaneousTools[toolId]) {
      const ToolComponent = miscellaneousTools[toolId];
      return <ToolComponent />;
    }
    if (categoryId === "social" && toolId && socialMedia[toolId]) {
      const ToolComponent = socialMedia[toolId];
      return <ToolComponent />;
    }
    if (categoryId === "seoandweb" && toolId && seoandweb[toolId]) {
      const ToolComponent = seoandweb[toolId];
      return <ToolComponent />;
    }
    if (categoryId === "code" && toolId && code[toolId]) {
      const ToolComponent = code[toolId];
      return <ToolComponent />;
    }

    if (categoryId === "currency" && toolId && currencyTools[toolId]) {
      const ToolComponent = currencyTools[toolId];
      return <ToolComponent />;
    }
    if (categoryId === "encryption" && toolId && encryption[toolId]) {
      const ToolComponent = encryption[toolId];
      return <ToolComponent />;
    }
    if (categoryId === "clock" && toolId && clock[toolId]) {
      const ToolComponent = clock[toolId];
      return <ToolComponent />;
    }
    if (categoryId === "file" && toolId && file[toolId]) {
      const ToolComponent = file[toolId];
      return <ToolComponent />;
    }

    // Fallback for tools that haven't been implemented yet
    return (
      <div className="bg-muted/40 border rounded-xl p-6">
        <p className="text-center text-muted-foreground">
          Tool content for {subTool.title} will be implemented here.
        </p>
      </div>
    );
  };

  const Icon = category.icon;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO type="tool" categoryId={categoryId} toolId={toolId} />
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

        <Suspense fallback={<ToolLoader />}>
          {renderToolContent()}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default ToolPage;