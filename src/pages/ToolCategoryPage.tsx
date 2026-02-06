import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEO from "@/components/seo";
import { toolCategories, ToolCategory } from "@/data/tools";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const ToolCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | null>(null);
  const [filteredTools, setFilteredTools] = useState<typeof category.subTools>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const foundCategory = toolCategories.find((cat) => cat.id === categoryId);
    setCategory(foundCategory || null);
    setFilteredTools(foundCategory?.subTools || []);
    setTimeout(() => setIsLoading(false), 500);
  }, [categoryId]);

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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center  pt-20">
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

  const Icon = category.icon;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO type="category" categoryId={categoryId} />
      <Header />
      <main className="flex-grow container py-8  pt-20">
        <div className="mb-8 ">
          <motion.button
            onClick={() => navigate('/tools')}
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
              <h1 className="text-3xl font-bold">{category.title}</h1>
              <p className="text-muted-foreground">Available Tools</p>
            </div>
          </div>

          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="p-6 rounded-xl border bg-card">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </div>
            ))
          ) : (
            filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Link
                  to={`/tools/${category.id}/${tool.id}`}
                  className="group block p-6 rounded-xl border bg-card hover:shadow-lg transition-all hover:border-primary/20 hover:bg-accent/50"
                >
                  <h3 className="text-xl font-medium group-hover:text-primary transition-colors mb-2">
                    {tool.title}
                  </h3>
                  {tool.description && (
                    <p className="text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tools found matching your search.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ToolCategoryPage;