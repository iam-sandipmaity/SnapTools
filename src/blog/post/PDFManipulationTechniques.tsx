import React, { useState } from 'react';
import { ChevronRight, FileText, Scissors, RotateCcw, Shield, Zap, RefreshCw, Edit3, Search, Clock, User, Calendar, Tag } from 'lucide-react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const PDFManipulationTechniques = () => {
  const [activeSection, setActiveSection] = useState(null);

  const techniques = [
    {
      id: 1,
      title: "Smart PDF Merging with Custom Page Ordering",
      icon: <RefreshCw className="w-6 h-6" />,
      color: "green",
      description: "Master advanced merging techniques with custom page ordering and metadata preservation",
      features: ["Rearrange pages during merger", "Apply page-level transitions", "Maintain bookmarks and metadata", "Optimize file size during merging"]
    },
    {
      id: 2,
      title: "Strategic PDF Splitting",
      icon: <Scissors className="w-6 h-6" />,
      color: "purple",
      description: "Learn efficient document division while preserving structure and functionality",
      features: ["Split by page ranges", "Extract specific sections", "Create logical document divisions", "Preserve formatting and links"]
    },
    {
      id: 3,
      title: "PDF to Word Conversion Best Practices",
      icon: <FileText className="w-6 h-6" />,
      color: "yellow",
      description: "Convert PDFs to Word while maintaining formatting integrity and handling complex layouts",
      features: ["Maintain complex formatting", "Preserve tables and images", "Handle multi-column layouts", "Convert scanned documents accurately"]
    },
    {
      id: 4,
      title: "Advanced Page Management",
      icon: <RotateCcw className="w-6 h-6" />,
      color: "red",
      description: "Take control of PDF pages with advanced manipulation techniques",
      features: ["Rotating and aligning pages", "Adding and removing pages", "Reordering content efficiently", "Managing page sizes"]
    },
    {
      id: 5,
      title: "Form Field Manipulation",
      icon: <Edit3 className="w-6 h-6" />,
      color: "indigo",
      description: "Create and manage interactive PDF forms for enhanced workflows",
      features: ["Create interactive forms", "Extract form data", "Validate field inputs", "Automate form filling"]
    },
    {
      id: 6,
      title: "Security and Encryption",
      icon: <Shield className="w-6 h-6" />,
      color: "gray",
      description: "Protect sensitive documents with industry-standard security measures",
      features: ["Set document permissions", "Apply digital signatures", "Encrypt sensitive content", "Manage access controls"]
    },
    {
      id: 7,
      title: "PDF Optimization Techniques",
      icon: <Zap className="w-6 h-6" />,
      color: "orange",
      description: "Optimize PDFs for better performance without compromising quality",
      features: ["Faster loading", "Reduced file size", "Web compatibility", "Mobile viewing"]
    },
    {
      id: 8,
      title: "Batch Processing Workflows",
      icon: <RefreshCw className="w-6 h-6" />,
      color: "teal",
      description: "Automate document processing with efficient batch operations",
      features: ["Custom processing rules", "Bulk operations", "Scheduled tasks", "Error handling"]
    },
    {
      id: 9,
      title: "Advanced Annotation Tools",
      icon: <Edit3 className="w-6 h-6" />,
      color: "pink",
      description: "Enhance collaboration with professional markup and commenting features",
      features: ["Custom stamps", "Rich text comments", "Drawing tools", "Review tracking"]
    },
    {
      id: 10,
      title: "OCR and Watermarking",
      icon: <Search className="w-6 h-6" />,
      color: "cyan",
      description: "Transform scanned documents and protect intellectual property",
      features: ["OCR text recognition", "Multi-language support", "Custom watermark design", "Batch watermarking"]
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      green: "bg-green-50 border-green-200 text-green-800",
      purple: "bg-purple-50 border-purple-200 text-purple-800",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
      red: "bg-red-50 border-red-200 text-red-800",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
      gray: "bg-gray-50 border-gray-200 text-gray-800",
      orange: "bg-orange-50 border-orange-200 text-orange-800",
      teal: "bg-teal-50 border-teal-200 text-teal-800",
      pink: "bg-pink-50 border-pink-200 text-pink-800",
      cyan: "bg-cyan-50 border-cyan-200 text-cyan-800"
    };
    return colorMap[color] || colorMap.gray;
  };

  const getBadgeClasses = (color) => {
    const colorMap = {
      green: "bg-green-100 text-green-700",
      purple: "bg-purple-100 text-purple-700",
      yellow: "bg-yellow-100 text-yellow-700",
      red: "bg-red-100 text-red-700",
      indigo: "bg-indigo-100 text-indigo-700",
      gray: "bg-gray-100 text-gray-700",
      orange: "bg-orange-100 text-orange-700",
      teal: "bg-teal-100 text-teal-700",
      pink: "bg-pink-100 text-pink-700",
      cyan: "bg-cyan-100 text-cyan-700"
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <>
      <div className="mb-16">
        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">
          <span className="px-4 py-2 bg-primary/10 rounded-full">PDF Architecture</span>
          <span className="flex items-center gap-2 text-muted-foreground"><User className="w-3 h-3" /> SnapTools Engineering</span>
          <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-3 h-3" /> January 18, 2024</span>
          <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-3 h-3" /> 8 min read</span>
        </div>

        <h1 className="leading-[0.85] mb-12">
          Advanced PDF <br />
          <em className="italic font-light text-primary">Manipulation.</em>
        </h1>

        <p className="text-xl text-muted-foreground leading-relaxed font-medium mb-12">
          Strategic protocols for document integrity, architectural merging, and cryptographic security within the portable document format ecosystem.
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 mb-20 shadow-sm">
        <p className="m-0 italic">
          Mastery of document architecture is a mission-critical skill for modern digital engineers. This technical repository explores 10 strategic manipulation protocols designed to maximize throughput and ensure architectural consistency across all digital touchpoints.
        </p>
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/50">Protocol {technique.id}</span>
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
                          <h3 className="m-0 text-sm font-black uppercase tracking-widest text-foreground">Operational Parameters</h3>
                          <ul className="grid md:grid-cols-2 gap-4 m-0">
                            {technique.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-sm font-medium text-muted-foreground pl-0 before:hidden">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>

                          {technique.id === 1 && (
                            <div className="p-6 rounded-3xl bg-primary/5 border-l-4 border-primary">
                              <p className="m-0 text-sm font-medium">
                                <strong className="text-primary uppercase tracking-widest text-[9px] block mb-2">Engineering Insight</strong>
                                Leveraging the SnapTools neural engine allows for millisecond-latency manipulation while maintaining zero-knowledge security protocols.
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
            Ready to Initialize <br />
            <em className="italic font-light text-primary underline underline-offset-8 decoration-1 decoration-primary/30">Mastery.</em>
          </h2>
          <p className="text-white/60 dark:text-black/60 max-w-xl mx-auto text-lg leading-relaxed font-medium">
            Deploy advanced manipulation protocols across your document architecture with the SnapTools technical suite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tools" className="no-underline">
              <button className="bg-primary text-white hover:bg-primary/90 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 border-none cursor-pointer">
                Initialize Suite
              </button>
            </Link>
            <button className="bg-white/10 dark:bg-black/5 hover:bg-white/20 dark:hover:bg-black/10 text-white dark:text-black px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/10 dark:border-black/10 cursor-pointer">
              Documentation
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PDFManipulationTechniques;