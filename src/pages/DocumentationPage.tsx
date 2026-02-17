import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { toolCategories } from "@/data/tools";
import {
  Search,
  BookOpen,
  Zap,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  FileText,
  Command,
  ChevronRight,
  Menu,
  X,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DocumentationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState('getting-started');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sectionParam = params.get('section');
    if (sectionParam) {
      setActiveSection(sectionParam);
      const element = document.getElementById(sectionParam);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const toggleToolDoc = (toolId: string) => {
    setExpandedToolId(expandedToolId === toolId ? null : toolId);
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsSidebarOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navGroups = [
    {
      title: "Introduction",
      items: [
        { id: "getting-started", label: "Overview", icon: BookOpen },
        { id: "tool-categories", label: "Tool Ecosystem", icon: Zap },
      ]
    },
    {
      title: "Guides",
      items: [
        { id: "best-practices", label: "Best Practices", icon: ShieldCheck },
        { id: "faq", label: "Common Questions", icon: HelpCircle },
        { id: "need-help", label: "Get Support", icon: Lightbulb },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Header />

      <div className="flex-grow pt-24 md:pt-32 relative">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-screen bg-gradient-to-l from-primary/5 to-transparent pointer-events-none -z-10" />

        <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-12 pb-32">

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden fixed bottom-8 right-6 z-[60] bg-primary text-white p-4 rounded-full shadow-2xl transition-transform active:scale-90"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>

          {/* SIDEBAR NAVIGATION */}
          <aside className={`
            fixed md:sticky md:top-32 inset-0 md:inset-auto z-50 md:z-10
            w-full md:w-72 h-screen md:h-fit
            bg-background md:bg-transparent
            transition-all duration-300
            ${isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full md:translate-x-0 opacity-0 md:opacity-100 font-medium"}
          `}>
            <div className="p-8 md:p-0">
              <div className="relative group mb-10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Find documentation..."
                  className="w-full bg-muted/50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 focus:border-primary/30 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none transition-all backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-10">
                {navGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/20 mb-6 px-4">
                      {group.title}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSectionClick(item.id)}
                          className={`
                            group flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-300
                            ${activeSection === item.id
                              ? "bg-primary/10 text-primary font-bold shadow-sm"
                              : "text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/[0.02] hover:text-foreground"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-4 h-4 ${activeSection === item.id ? "text-primary" : "opacity-50"}`} />
                            {item.label}
                          </div>
                          <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${activeSection === item.id ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN DOCUMENTATION CONTENT */}
          <main className="flex-1 max-w-4xl animate-fade-in-up">

            <header className="mb-20">
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4">
                <Command className="w-3 h-3" />
                Documentation
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter mb-6 leading-tight">
                Knowledge <em className="italic text-primary font-light">Base</em>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Comprehensive guides and technical documentation for the SnapTools ecosystem. Engineered to help you master digital precision.
              </p>
            </header>

            <div className="space-y-32">

              {/* Getting Started */}
              <section id="getting-started" className="scroll-m-32">
                <div className="bg-primary/5 dark:bg-primary/[0.02] border border-primary/10 rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group">
                  <BookOpen className="absolute -right-10 -bottom-10 w-64 h-64 text-primary opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" />
                  <h2 className="text-3xl md:text-4xl font-serif font-black mb-8 tracking-tight">Getting Started</h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
                    <p>
                      SnapTools is a cloud-native platform providing professional-grade software for digital creators. Every tool in our ecosystem is architected for three core principles: **Speed, Privacy, and Precision**.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-6 pt-6 ring-0">
                      <div className="bg-background/50 backdrop-blur shadow-sm p-6 rounded-2xl border border-border">
                        <h4 className="text-foreground font-bold mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" /> Infrastructure
                        </h4>
                        <p className="text-sm">Built on a global edge network ensuring millisecond latency for users worldwide.</p>
                      </div>
                      <div className="bg-background/50 backdrop-blur shadow-sm p-6 rounded-2xl border border-border">
                        <h4 className="text-foreground font-bold mb-2 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Security
                        </h4>
                        <p className="text-sm">Client-side processing logic ensures your data stays in your browser whenever possible.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tool Categories */}
              <section id="tool-categories" className="scroll-m-32">
                <h2 className="text-3xl md:text-4xl font-serif font-black mb-12 tracking-tight">The Tool Ecosystem</h2>
                <div className="grid gap-8">
                  {toolCategories.map((category) => (
                    <div key={category.id} id={category.id} className="group p-8 md:p-12 rounded-[2rem] border border-black/5 dark:border-white/5 bg-muted/30 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                          {category.icon && React.createElement(category.icon, { className: "w-8 h-8" })}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold tracking-tight mb-1">{category.title}</h3>
                          <p className="text-muted-foreground text-sm uppercase tracking-widest font-black opacity-50">Suite of Specialist Tools</p>
                        </div>
                      </div>

                      <p className="text-muted-foreground leading-relaxed mb-10">
                        {category.description || `High-performance ${category.title.toLowerCase()} utilities designed for professional conversion, analysis, and generation.`}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4 auto-rows-min">
                        {category.subTools?.map(tool => (
                          <div key={tool.id} className="flex flex-col gap-0 scroll-m-20">
                            <button
                              onClick={() => toggleToolDoc(tool.id)}
                              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${expandedToolId === tool.id
                                  ? "bg-primary/10 border-primary/30 shadow-sm"
                                  : "bg-background/50 border-border/50 hover:border-primary/20 hover:bg-background"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${expandedToolId === tool.id ? "bg-primary scale-125" : "bg-primary/30"}`} />
                                <span className={`text-sm font-medium transition-colors ${expandedToolId === tool.id ? "text-primary font-bold" : "text-foreground"}`}>{tool.title}</span>
                              </div>
                              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedToolId === tool.id ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
                            </button>

                            {/* Expandable Sidebar-style Code block for Tool Doc */}
                            {expandedToolId === tool.id && (
                              <div className="mt-4 p-6 rounded-2xl bg-white dark:bg-black/40 border border-primary/10 shadow-inner animate-fade-in-up col-span-full sm:col-span-2">
                                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  Documentation: {tool.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                  {tool.description || `Our ${tool.title} module provides high-fidelity processing capabilities tailored for professional workflows. Optimized for both speed and output quality.`}
                                </p>

                                <div className="grid md:grid-cols-2 gap-8">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Core Features</p>
                                    <ul className="space-y-2">
                                      {['Lossless processing engine', 'Batch operation support', 'Hardware-accelerated logic', 'Private local execution'].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <div className="w-1 h-1 rounded-full bg-primary/40" />
                                          {feat}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Usage Protocol</p>
                                    <div className="space-y-4">
                                      {[
                                        { s: 1, t: "Initialize the tool via the module panel." },
                                        { s: 2, t: "Upload or paste source assets." },
                                        { s: 3, t: "Configure processing parameters." },
                                        { s: 4, t: "Finalize and retrieve output." }
                                      ].map((step) => (
                                        <div key={step.s} className="flex gap-3">
                                          <span className="text-[10px] font-bold text-primary/50">{step.s}.</span>
                                          <span className="text-[11px] text-muted-foreground leading-tight">{step.t}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                                  <Link
                                    to={`/tools/${category.id}/${tool.id}`}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                  >
                                    Launch Tool <ArrowRight className="w-3 h-3" />
                                  </Link>
                                  <button
                                    onClick={() => toggleToolDoc(tool.id)}
                                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    Close Documentation
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Best Practices */}
              <section id="best-practices" className="scroll-m-32">
                <h2 className="text-3xl md:text-4xl font-serif font-black mb-10 tracking-tight">Professional Standards</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { title: "Review Requirements", desc: "Always check the file size and format constraints listed in tool sidebars." },
                    { title: "Data Backup", desc: "While we don't store your data, we recommend keeping originals before complex processing." },
                    { title: "Browser Health", desc: "For large file operations, ensure your browser has at least 500MB of overhead memory." },
                    { title: "Privacy Audit", desc: "Check the status indicator to see if a tool is running locally or via our secure cloud." }
                  ].map((item, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-muted/40 dark:bg-white/[0.02] border border-border hover:border-primary/30 transition-all group">
                      <h4 className="font-bold mb-3 flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          {i + 1}
                        </span>
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ Section */}
              <section id="faq" className="scroll-m-32">
                <h2 className="text-3xl md:text-4xl font-serif font-black mb-12 tracking-tight">Common Inquiries</h2>
                <div className="grid gap-4">
                  {[
                    { q: "Is SnapTools truly free?", a: "Yes. All tools are free to use. We are supported by community donations and optional professional plans." },
                    { q: "Can I use these tools commercially?", a: "Absolutely. All outputs generated by SnapTools are owned entirely by you and can be used for any commercial purpose." },
                    { q: "Do you offer an API?", a: "API access is currently in invitation-only Beta. Please contact our support team for more details." },
                    { q: "How is my privacy protected?", a: "We believe privacy is a human right. Our tools prioritize client-side JavaScript processing so your data never leaves your device." }
                  ].map((faq, i) => (
                    <details key={i} className="group p-6 md:p-8 rounded-2xl bg-muted/20 dark:bg-white/[0.01] border border-border open:bg-white dark:open:bg-white/[0.03] transition-all">
                      <summary className="list-none flex items-center justify-between cursor-pointer font-bold text-lg tracking-tight">
                        {faq.q}
                        <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform text-muted-foreground" />
                      </summary>
                      <div className="pt-6 text-muted-foreground leading-relaxed">
                        <p>{faq.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              {/* Get Support */}
              <section id="need-help" className="scroll-m-32 pt-20">
                <div className="bg-black dark:bg-white rounded-[3rem] p-12 md:p-20 text-white dark:text-black text-center relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-t from-primary/40 to-transparent opacity-50" />
                  <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="w-20 h-20 bg-white/10 dark:bg-black/10 rounded-full flex items-center justify-center backdrop-blur-3xl">
                      <HelpCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter">Need human assistance?</h2>
                    <p className="max-w-xl opacity-70">
                      Our engineering team is always on standby to help with technical queries or platform feedback.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
                      <Link to="/contact" className="w-full sm:w-auto">
                        <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest px-10 py-7 rounded-full w-full">
                          Contact Support
                        </Button>
                      </Link>
                      <Link to="/tools" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="border-white/20 dark:border-black/20 font-black text-[10px] uppercase tracking-widest px-10 py-7 rounded-full w-full hover:bg-white/10 dark:hover:bg-black/10">
                          Explore Community
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default DocumentationPage;