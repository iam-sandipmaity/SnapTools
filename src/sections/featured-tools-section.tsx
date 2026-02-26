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
  Code,
  Clock,
  Video,
  Eye,
  Calculator,
  Zap,
  Command,
  ArrowRight
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
    categoryId: "share",
    title: "P2P Real-time Transfer",
    description: "Secure P2P real-time transfer engine",
    icon: Share2,
    gradient: { from: "#6366f1", to: "#8b5cf6" }
  },
  {
    id: "text-share",
    categoryId: "share",
    title: "Text Share",
    description: "Instant real-time cryptographic text sharing",
    icon: MessageSquare,
    gradient: { from: "#8b5cf6", to: "#d946ef" }
  },
  {
    id: "image-compressor",
    categoryId: "image",
    title: "Image Compressor",
    description: "Lossless neural image reduction logic",
    icon: ImageDown,
    gradient: { from: "#06b6d4", to: "#3b82f6" }
  },
  {
    id: "qr-generator",
    categoryId: "qr",
    title: "QR Generator",
    description: "High-fidelity vector QR generation",
    icon: QrCode,
    gradient: { from: "#f59e0b", to: "#ef4444" }
  },
  {
    id: "password-generator",
    categoryId: "password",
    title: "Password Generator",
    description: "Entropy-driven security string generation",
    icon: KeyRound,
    gradient: { from: "#ec4899", to: "#f43f5e" }
  },
  {
    id: "pdf-merger",
    categoryId: "pdf",
    title: "PDF Merger",
    description: "Professional multi-document consolidation",
    icon: FileText,
    gradient: { from: "#f43f5e", to: "#fb923c" }
  },
  {
    id: "json-formatter",
    categoryId: "code",
    title: "JSON Formatter",
    description: "Syntax-aware data validation & formatting",
    icon: Code,
    gradient: { from: "#8b5cf6", to: "#6366f1" }
  },
  {
    id: "pdf-viewer",
    categoryId: "pdf",
    title: "PDF Viewer",
    description: "Advanced PDF manipulation & encryption",
    icon: Eye,
    gradient: { from: "#f43f5e", to: "#fb923c" }
  },
  {
    id: "webcam-test",
    categoryId: "miscellaneous",
    title: "Webcam Tester",
    description: "Hardware-accelerated sensor diagnostics",
    icon: Video,
    gradient: { from: "#06b6d4", to: "#3b82f6" }
  },
  {
    id: "bmi-calculator",
    categoryId: "calculator",
    title: "BMI Calculator",
    description: "Precise physiological index calculation",
    icon: Calculator,
    gradient: { from: "#10b981", to: "#06b6d4" }
  }
];

const FeaturedToolsSection = () => {
  const navigate = useNavigate();

  const handleToolClick = (categoryId: string, toolId: string) => {
    navigate(`/tools/${categoryId}/${toolId}`);
  };

  return (
    <section className="py-32 px-6 relative overflow-hidden bg-background">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <AnimatedElement animation="fadeIn">
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                <Zap className="w-3 h-3" />
                Elite Selection
              </div>
              <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter leading-[0.9] mb-6">
                Featured <br />
                <em className="italic font-light text-primary">Modules</em>
              </h2>
              <p className="text-xl text-muted-foreground/80 leading-relaxed font-medium">
                Direct access to our most powerful and frequently deployed technical utilities. Engineered for speed and precision.
              </p>
            </AnimatedElement>
          </div>

          <AnimatedElement animation="fadeIn" delay={0.2}>
            <button
              onClick={() => navigate('/tools')}
              className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:text-primary transition-colors"
            >
              View Full Ecosystem
              <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </AnimatedElement>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {featuredTools.map((tool, index) => (
            <AnimatedElement key={tool.id} delay={index * 0.05}>
              <motion.div
                whileHover={{ y: -8 }}
                className="relative group cursor-pointer h-full"
                onClick={() => handleToolClick(tool.categoryId, tool.id)}
              >
                <div className="h-full bg-white/70 dark:bg-white/[0.02] backdrop-blur-3xl border border-black/[0.03] dark:border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] group-hover:bg-white dark:group-hover:bg-white/[0.04] isolate overflow-hidden">
                  {/* Glass Top Highlight for 3D depth */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent" />

                  {/* Background Accents for Light Mode */}
                  <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-0 transition-opacity group-hover:opacity-[0.06] -z-10"
                    style={{ background: `linear-gradient(135deg, ${tool.gradient.from}, ${tool.gradient.to})` }}
                  />

                  {/* Icon with Dynamic Gradient Glow */}
                  <div className="relative mb-8">
                    <div
                      className="absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                      style={{ background: tool.gradient.from }}
                    />
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 text-white shadow-xl isolate"
                      style={{ background: `linear-gradient(135deg, ${tool.gradient.from}, ${tool.gradient.to})` }}
                    >
                      <tool.icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Interactive Status */}
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary transition-colors">
                      Launch
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-150 transition-all opacity-0 group-hover:opacity-100" />
                  </div>
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
