import React, { useState } from 'react';
import { ChevronRight, Image, Zap, Settings, MonitorSpeaker, Smartphone, Globe, BarChart3, Clock, User, Calendar, Tag, TrendingUp, Archive, FileImage, Palette, Eye, Code, Target } from 'lucide-react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ImageOptimizationGuide = () => {
  const [activeSection, setActiveSection] = useState(null);

  const techniques = [
    {
      id: 1,
      title: "Advanced Image Compression Strategies",
      icon: <Archive className="w-6 h-6" />,
      color: "blue",
      description: "Master lossless and lossy compression techniques to achieve optimal file sizes without quality degradation",
      features: ["Lossless vs lossy compression analysis", "Quality vs file size optimization", "Batch compression workflows", "Format-specific compression settings"],
      tips: "Use 80-85% quality for JPEG images to achieve the best balance between file size and visual quality. This sweet spot reduces file size by 50-70% while maintaining excellent visual fidelity."
    },
    {
      id: 2,
      title: "Next-Gen Image Formats (WebP, AVIF, HEIC)",
      icon: <FileImage className="w-6 h-6" />,
      color: "green",
      description: "Leverage modern image formats for superior compression and quality compared to traditional formats",
      features: ["WebP implementation strategies", "AVIF adoption and fallbacks", "HEIC mobile optimization", "Browser compatibility handling"],
      tips: "WebP provides 25-35% better compression than JPEG while maintaining visual quality. Always implement proper fallbacks for older browsers."
    },
    {
      id: 3,
      title: "Responsive Image Implementation",
      icon: <MonitorSpeaker className="w-6 h-6" />,
      color: "purple",
      description: "Deliver the right image size for every device and screen resolution to optimize loading performance",
      features: ["Srcset and sizes attributes", "Art direction with picture element", "Density-based image serving", "Breakpoint optimization"],
      tips: "Use the picture element for art direction and srcset for resolution switching. This can reduce image payload by 40-60% on mobile devices."
    },
    {
      id: 4,
      title: "Lazy Loading and Progressive Enhancement",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "orange",
      description: "Implement smart loading strategies to improve initial page load times and user experience",
      features: ["Native lazy loading implementation", "Intersection Observer API", "Progressive image loading", "Critical image prioritization"],
      tips: "Lazy loading can improve initial page load by 20-50%. Ensure above-the-fold images are loaded immediately while deferring others."
    },
    {
      id: 5,
      title: "Image CDN and Caching Strategies",
      icon: <Globe className="w-6 h-6" />,
      color: "teal",
      description: "Leverage content delivery networks and caching mechanisms for faster global image delivery",
      features: ["CDN configuration best practices", "Cache headers optimization", "Edge computing benefits", "Global distribution strategies"],
      tips: "Image CDNs can reduce loading times by 40-80% through geographic distribution and automatic format optimization based on user agent."
    },
    {
      id: 6,
      title: "Format Selection and Conversion",
      icon: <Palette className="w-6 h-6" />,
      color: "pink",
      description: "Choose the optimal image format based on content type, use case, and target audience",
      features: ["JPEG for photographs", "PNG for graphics with transparency", "SVG for scalable graphics", "Format conversion automation"],
      tips: "Use JPEG for photos, PNG for graphics with transparency, WebP as a modern alternative, and SVG for icons and simple graphics."
    },
    {
      id: 7,
      title: "Image Preprocessing and Optimization",
      icon: <Settings className="w-6 h-6" />,
      color: "indigo",
      description: "Prepare images for optimal web delivery through strategic preprocessing techniques",
      features: ["Automatic resizing workflows", "Color space optimization", "Metadata removal", "Batch processing automation"],
      tips: "Remove unnecessary metadata and optimize color profiles to reduce file sizes by 10-30% without affecting visual quality."
    },
    {
      id: 8,
      title: "Performance Monitoring and Analytics",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "red",
      description: "Track and measure image performance impact on overall website speed and user experience",
      features: ["Core Web Vitals tracking", "Loading time analysis", "User experience metrics", "Performance budgeting"],
      tips: "Monitor Largest Contentful Paint (LCP) as images often contribute significantly to this Core Web Vital metric."
    },
    {
      id: 9,
      title: "Mobile-First Image Optimization",
      icon: <Smartphone className="w-6 h-6" />,
      color: "cyan",
      description: "Optimize images specifically for mobile devices and varying network conditions",
      features: ["Mobile-specific formats", "Network-aware loading", "Touch-optimized experiences", "Offline image strategies"],
      tips: "Mobile users consume 70% of web content. Prioritize mobile optimization with smaller initial payloads and progressive enhancement."
    },
    {
      id: 10,
      title: "Accessibility and SEO Considerations",
      icon: <Eye className="w-6 h-6" />,
      color: "yellow",
      description: "Ensure images are accessible and contribute positively to search engine optimization",
      features: ["Alt text optimization", "Structured data implementation", "Image sitemaps", "Accessibility compliance"],
      tips: "Descriptive alt text and proper image markup improve both accessibility and SEO, potentially increasing organic traffic by 10-20%."
    }
  ];

  const keyMetrics = [
    { label: "Average Page Load Improvement", value: "40-60%", icon: <Zap className="w-5 h-5" /> },
    { label: "File Size Reduction", value: "50-80%", icon: <Archive className="w-5 h-5" /> },
    { label: "Mobile Performance Boost", value: "30-50%", icon: <Smartphone className="w-5 h-5" /> },
    { label: "SEO Impact", value: "10-20%", icon: <TrendingUp className="w-5 h-5" /> }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      green: "bg-green-50 border-green-200 text-green-800",
      purple: "bg-purple-50 border-purple-200 text-purple-800",
      orange: "bg-orange-50 border-orange-200 text-orange-800",
      teal: "bg-teal-50 border-teal-200 text-teal-800",
      pink: "bg-pink-50 border-pink-200 text-pink-800",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
      red: "bg-red-50 border-red-200 text-red-800",
      cyan: "bg-cyan-50 border-cyan-200 text-cyan-800",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-800"
    };
    return colorMap[color] || colorMap.blue;
  };

  const getBadgeClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      purple: "bg-purple-100 text-purple-700",
      orange: "bg-orange-100 text-orange-700",
      teal: "bg-teal-100 text-teal-700",
      pink: "bg-pink-100 text-pink-700",
      indigo: "bg-indigo-100 text-indigo-700",
      red: "bg-red-100 text-red-700",
      cyan: "bg-cyan-100 text-cyan-700",
      yellow: "bg-yellow-100 text-yellow-700"
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <>
      <div className="mb-16">
        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">
          <span className="px-4 py-2 bg-primary/10 rounded-full">Imaging Architecture</span>
          <span className="flex items-center gap-2 text-muted-foreground"><User className="w-3 h-3" /> SnapTools Team</span>
          <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-3 h-3" /> January 22, 2024</span>
          <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-3 h-3" /> 12 min read</span>
        </div>

        <h1 className="leading-[0.85] mb-12">
          Mastering Image <br />
          <em className="italic font-light text-primary">Fidelity.</em>
        </h1>

        <p className="text-xl text-muted-foreground leading-relaxed font-medium mb-12">
          Master the art of neural compression, responsive delivery protocols, and next-gen format architecture to dramatically improve your website's structural performance.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="p-6 rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-500 text-center">
            <div className="flex justify-center mb-4 text-primary">
              {metric.icon}
            </div>
            <div className="text-3xl font-serif font-black tracking-tight text-foreground mb-1">{metric.value}</div>
            <div className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/60">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-12">
        {techniques.map((technique) => (
          <div
            key={technique.id}
            className={`group relative overflow-hidden rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] transition-all duration-700 ${activeSection === technique.id ? 'ring-2 ring-primary/20 shadow-2xl' : 'hover:bg-white dark:hover:bg-white/[0.03]'
              }`}
          >
            <div
              className="p-10 cursor-pointer"
              onClick={() => setActiveSection(activeSection === technique.id ? null : technique.id)}
            >
              <div className="flex items-start gap-8">
                <div className="shrink-0 w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                  {technique.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/50">Module {technique.id}</span>
                    <h2 className="m-0 text-3xl font-serif font-black tracking-tight group-hover:text-primary transition-colors">
                      {technique.title}
                    </h2>
                  </div>

                  <p className="m-0 text-lg font-medium text-muted-foreground/80 leading-relaxed">
                    {technique.description}
                  </p>

                  <AnimatePresence>
                    {activeSection === technique.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 space-y-6">
                          <h3 className="m-0 text-sm font-black uppercase tracking-widest text-foreground">Operational Logic</h3>
                          <ul className="grid md:grid-cols-2 gap-4 m-0">
                            {technique.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-sm font-medium text-muted-foreground pl-0 before:hidden">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>

                          {technique.tips && (
                            <div className="p-6 rounded-3xl bg-primary/5 border-l-4 border-primary">
                              <p className="m-0 text-sm font-medium">
                                <strong className="text-primary uppercase tracking-widest text-[9px] block mb-2">Protocol Insight</strong>
                                {technique.tips}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <ChevronRight className={`w-6 h-6 text-muted-foreground/30 transition-all duration-500 ${activeSection === technique.id ? 'rotate-90 text-primary' : 'group-hover:translate-x-1'
                  }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-32 p-12 rounded-[3.5rem] bg-black dark:bg-white text-white dark:text-black relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-primary/20 blur-[100px] opacity-40" />
        <div className="relative z-10 text-center space-y-8">
          <h2 className="m-0 text-4xl md:text-5xl font-serif font-black tracking-tighter text-white dark:text-black leading-tight">
            Deploy Neural <br />
            <em className="italic font-light text-primary underline underline-offset-8 decoration-1 decoration-primary/30">Compression.</em>
          </h2>
          <p className="text-white/60 dark:text-black/60 max-w-xl mx-auto text-lg leading-relaxed font-medium">
            Transform your website's performance with professional-grade imaging tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tools" className="no-underline">
              <button className="bg-primary text-white hover:bg-primary/90 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 border-none cursor-pointer">
                Initialize Suite
              </button>
            </Link>
            <button className="bg-white/10 dark:bg-black/5 hover:bg-white/20 dark:hover:bg-black/10 text-white dark:text-black px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/10 dark:border-black/10 cursor-pointer">
              Performance Specs
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageOptimizationGuide;