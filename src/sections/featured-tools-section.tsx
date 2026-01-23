import { useNavigate } from "react-router-dom";
import AnimatedElement from "@/components/animated-element";
import { motion } from "framer-motion";
import { 
  Share2, 
  MessageSquare, 
  ImageDown, 
  QrCode, 
  KeyRound, 
  FileText,
  Calculator,
  Palette,
  Code,
  Clock
} from "lucide-react";

interface FeaturedTool {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  icon: any;
  gradient: {
    from: string;
    to: string;
  };
}

const featuredTools: FeaturedTool[] = [
  {
    id: "file-share",
    categoryId: "file",
    title: "File Share",
    description: "Share files securely with peer-to-peer connection",
    icon: Share2,
    gradient: { from: "#6366f1", to: "#8b5cf6" }
  },
  {
    id: "text-share",
    categoryId: "file",
    title: "Text Share",
    description: "Share text in real-time with anyone instantly",
    icon: MessageSquare,
    gradient: { from: "#8b5cf6", to: "#d946ef" }
  },
  {
    id: "image-compressor",
    categoryId: "image",
    title: "Image Compressor",
    description: "Reduce image size without losing quality",
    icon: ImageDown,
    gradient: { from: "#06b6d4", to: "#3b82f6" }
  },
  {
    id: "qr-generator",
    categoryId: "qr",
    title: "QR Generator",
    description: "Create custom QR codes for any purpose",
    icon: QrCode,
    gradient: { from: "#f59e0b", to: "#ef4444" }
  },
  {
    id: "password-generator",
    categoryId: "password",
    title: "Password Generator",
    description: "Generate strong and secure passwords",
    icon: KeyRound,
    gradient: { from: "#ec4899", to: "#f43f5e" }
  },
  {
    id: "pdf-merger",
    categoryId: "pdf",
    title: "PDF Merger",
    description: "Combine multiple PDFs into one file",
    icon: FileText,
    gradient: { from: "#f43f5e", to: "#fb923c" }
  },
  {
    id: "json-formatter",
    categoryId: "code",
    title: "JSON Formatter",
    description: "Format and validate JSON data easily",
    icon: Code,
    gradient: { from: "#8b5cf6", to: "#6366f1" }
  },
  {
    id: "color-picker",
    categoryId: "color",
    title: "Color Picker",
    description: "Pick and convert colors in multiple formats",
    icon: Palette,
    gradient: { from: "#ec4899", to: "#a855f7" }
  },
  {
    id: "bmi-calculator",
    categoryId: "calculator",
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index quickly",
    icon: Calculator,
    gradient: { from: "#10b981", to: "#06b6d4" }
  },
  {
    id: "world-clock",
    categoryId: "clock",
    title: "World Clock",
    description: "View time zones around the world",
    icon: Clock,
    gradient: { from: "#8b5cf6", to: "#ec4899" }
  }
];

const FeaturedToolsSection = () => {
  const navigate = useNavigate();

  const handleToolClick = (categoryId: string, toolId: string) => {
    navigate(`/tools/${categoryId}/${toolId}`);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-accent/20">
      <div className="container mx-auto">
      <div className="text-center mb-12">
        <AnimatedElement animation="fadeIn">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Featured Tools
          </h2>
        </AnimatedElement>
        <AnimatedElement delay={0.1} animation="fadeIn">
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quick access to our most popular and essential tools
          </p>
        </AnimatedElement>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {featuredTools.map((tool, index) => (
          <AnimatedElement key={tool.id} delay={index * 0.05}>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="relative group cursor-pointer"
              onClick={() => handleToolClick(tool.categoryId, tool.id)}
            >
              <div className="relative overflow-hidden rounded-xl p-6 h-full bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg">
                {/* Gradient Background */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${tool.gradient.from}, ${tool.gradient.to})`
                  }}
                />
                
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 relative z-10"
                  style={{
                    background: `linear-gradient(135deg, ${tool.gradient.from}, ${tool.gradient.to})`
                  }}
                >
                  <tool.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </AnimatedElement>
        ))}
      </div>
      </div>
    </section>
  );
};

export default FeaturedToolsSection;
