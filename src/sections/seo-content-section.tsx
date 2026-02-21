import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import AnimatedElement from "@/components/animated-element";
import {
  FileText,
  Image,
  RefreshCw,
  Calculator,
  QrCode,
  Shield,
  CheckCircle2,
  Sparkles,
  Lock,
  Zap,
  Users,
  Globe,
  Download,
  Code,
  Award,
  Star,
  Github,
  Heart,
  Quote,
  TrendingUp,
  MousePointerClick,
  Command,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Workflow,
  Rocket,
  Play,
  Pause
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SEOContentSection = () => {
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const toolCategories = [
    {
      icon: FileText,
      title: "PDF Architecture",
      description: "Merge PDF files, split pages, and compress documents with high-fidelity logic. Engineered for professional consolidation and manipulation without quality degradation.",
      color: "bg-primary/10",
      link: "/tools/pdf"
    },
    {
      icon: Image,
      title: "Imaging Suite",
      description: "Lossless neural image reduction and advanced format transformation. Optimize assets for worldwide edge delivery while maintaining visual integrity.",
      color: "bg-primary/10",
      link: "/tools/image"
    },
    {
      icon: RefreshCw,
      title: "Universal Converters",
      description: "Real-time currency synchronization, base64 data encoding, and precise unit translation modules. Fast, accurate, and easy to use technical converters.",
      color: "bg-primary/10",
      link: "/tools/conversion"
    },
    {
      icon: Calculator,
      title: "Precision Calculators",
      description: "Physiological index monitoring, financial logic gates, and scientific computation modules. Perform complex calculations with millisecond accuracy.",
      color: "bg-primary/10",
      link: "/tools/calculator"
    },
    {
      icon: QrCode,
      title: "Vector QR Engine",
      description: "Generate high-fidelity vector QR codes for URLs, cryptographic keys, and WiFi profiles. Download in professional formats for digital and physical deployment.",
      color: "bg-primary/10",
      link: "/tools/qr"
    },
    {
      icon: Shield,
      title: "SecOps Utilities",
      description: "Entropy-driven password generation, secure hash verification (SHA-256/512), and local encryption modules. Protect your technical assets with zero-knowledge protocols.",
      color: "bg-primary/10",
      link: "/tools/password"
    }
  ];

  const keyFeatures = [
    { icon: ShieldCheck, title: "100% Free Ecosystem", desc: "No hidden tiers or paywalled logic. Every module is available for global deployment at zero cost." },
    { icon: Sparkles, title: "Instant Access Protocol", desc: "Start processing in milliseconds. No registration, no identity verification, just immediate technical utility." },
    { icon: Lock, title: "Privacy Primitive", desc: "All logic is executed locally within your browser's secure sandbox. Data never leaves your hardware." },
    { icon: Zap, title: "Edge Performance", desc: "Optimized for millisecond-latency through a worldwide CDN and hardware-accelerated JavaScript." },
    { icon: Users, title: "Global Trust", desc: "Trusted by millions of architects, developers, and designers for high-stakes digital manipulation." },
    { icon: Globe, title: "Cross-Platform Sync", desc: "Responsive workstation design that adapts perfectly to desktop, tablet, and high-performance mobile nodes." }
  ];

  const stats = [
    { icon: Cpu, value: "100+", label: "Specialist Modules" },
    { icon: Users, value: "1M+", label: "Secure Sessions" },
    { icon: Workflow, value: "50+", label: "Logic Categories" },
    { icon: Award, value: "4.9/5", label: "Trust Rating" }
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "UI Architect", content: "The neural image compression is spectacular. Reduced my high-res assets by 80% with zero visual artifacts. Truly professional-grade.", rating: 5 },
    { name: "Mike Chen", role: "DevOps Engineer", content: "The PDF merger and JSON validation modules are essential for my workflow. Everything I need in one secure, high-speed ecosystem.", rating: 5 },
    { name: "Emily Rodriguez", role: "Growth Lead", content: "Vector QR generation is perfect for our physical deployment campaigns. Fast, watermarked-free, and enterprise-ready.", rating: 5 },
    { name: "David Kumar", role: "Software Lead", content: "Encryption utilities are reliable and fast. Client-side processing ensures my cryptographic tasks stay private. Impressive engineering.", rating: 5 }
  ];

  const howItWorks = [
    { step: "01", title: "Select Module", description: "Identify the appropriate logic category or search our directory of 100+ specialized technical tools." },
    { step: "02", title: "Initialize Logic", description: "Upload or input your source data directly into the browser. No data ever hits our remote infrastructure." },
    { step: "03", title: "Secure Output", description: "Retrieve your processed assets instantly. Fast, secure, and engineered for professional precision." }
  ];

  return (
    <section className="py-20 md:py-32 px-4 md:px-6 bg-background relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-screen bg-primary/[0.02] blur-[140px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 -z-10" />

      <div className="site-container">

        {/* HERO HEADER: WHY CHOOSE SNAPTOOLS */}
        <div className="text-center mb-32 max-w-4xl mx-auto">
          <AnimatedElement animation="fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-8">
              <Star size={12} className="fill-current" />
              Global Standard
            </div>
            <h2 className="text-5xl md:text-8xl font-serif font-black tracking-tighter leading-[0.9] mb-10">
              Technical <br />
              <em className="italic font-light text-primary">Superiority</em>
            </h2>
            <p className="text-xl text-muted-foreground/80 leading-relaxed font-medium">
              SnapTools is architected to be the most comprehensive free technical workstation. From **PDF consolidation** to **neural image reduction**, we provide the mission-critical modules you need for digital precision.
            </p>
          </AnimatedElement>
        </div>

        {/* STATS: DATA OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-32">
          {stats.map((stat, index) => (
            <AnimatedElement key={index} delay={index * 0.1} animation="slideUp">
              <div className="group p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-white dark:hover:bg-white/[0.05] transition-all duration-500 shadow-sm text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 md:mb-6 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                  <stat.icon size={20} />
                </div>
                <div className="text-3xl md:text-4xl font-serif font-black tracking-tighter mb-1">{stat.value}</div>
                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</div>
              </div>
            </AnimatedElement>
          ))}
        </div>

        {/* CATEGORIES: COMPREHENSIVE COLLECTION */}
        <div className="mb-40">
          <header className="text-center mb-20">
            <AnimatedElement animation="fadeIn">
              <h3 className="text-4xl md:text-6xl font-serif font-black tracking-tight mb-6">
                Unified Ecosystem
              </h3>
              <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto font-medium leading-relaxed">
                Professional-grade modules for every specialized requirement. Explore categorized suites designed for technical excellence.
              </p>
            </AnimatedElement>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {toolCategories.map((category, index) => (
              <AnimatedElement key={index} delay={index * 0.1} animation="slideUp">
                <Link
                  to={category.link}
                  className="group relative p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/70 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-2 block overflow-hidden outline-none ring-primary/20 focus-visible:ring-4"
                >
                  {/* Glass Top Highlight for 3D depth */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent" />
                  <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg transition-transform group-hover:scale-110", category.color)}>
                    <category.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-black tracking-tight mb-4 group-hover:text-primary transition-colors">{category.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground/80 leading-relaxed font-medium">
                    {category.description}
                  </p>
                  <div className="mt-10 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-all">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Explore Suite</span>
                    <div className="w-8 h-8 rounded-full bg-muted/50 dark:bg-white/[0.05] flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-[360deg] duration-700">
                      <Command size={14} />
                    </div>
                  </div>
                </Link>
              </AnimatedElement>
            ))}
          </div>
        </div>

        {/* HIGHLIGHTS: WHAT MAKES US THE BEST */}
        <div className="mb-40 relative py-32">
          <div className="absolute inset-0 bg-primary/[0.02] border-y border-black/5 dark:border-white/5 -z-10" />
          <div className="max-w-6xl mx-auto">
            <header className="text-center mb-20 px-6">
              <AnimatedElement animation="fadeIn">
                <h3 className="text-4xl md:text-6xl font-serif font-black tracking-tight mb-6 leading-tight">
                  Engineered for <br /><em className="italic font-light text-primary">Professionals</em>
                </h3>
                <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto font-medium">
                  Zero compromise on technical fidelity. Our workstation is engineered to meet the requirements of modern digital architects.
                </p>
              </AnimatedElement>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-6">
              {keyFeatures.map((feature, index) => (
                <AnimatedElement key={index} delay={index * 0.1}>
                  <div className="group p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:bg-white/80 dark:hover:bg-white/[0.04] transition-all duration-500 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 transition-all group-hover:bg-primary group-hover:text-white shadow-lg">
                      <feature.icon size={22} />
                    </div>
                    <h4 className="text-lg md:text-xl font-bold mb-3 tracking-tight">{feature.title}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground/80 leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </div>

        {/* WORKFLOW: HOW TO USE */}
        <div className="mb-40">
          <header className="text-center mb-24">
            <AnimatedElement animation="fadeIn">
              <h3 className="text-4xl md:text-6xl font-serif font-black tracking-tight mb-6 leading-tight">
                Architectural <br /><em className="italic font-light text-primary">Workflow</em>
              </h3>
              <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto font-medium leading-relaxed">
                Initialize your workstation in seconds. No downloads, no registration, just high-performance results.
              </p>
            </AnimatedElement>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto relative px-4 md:px-6">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent hidden md:block" />

            {howItWorks.map((step, index) => (
              <AnimatedElement key={index} delay={index * 0.1} animation="slideUp">
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 md:mb-8 rounded-[1.5rem] md:rounded-3xl bg-black dark:bg-white shadow-2xl flex items-center justify-center text-2xl md:text-3xl font-serif font-black text-white dark:text-black hover:rotate-[360deg] transition-transform duration-1000">
                    {step.step}
                  </div>
                  <h4 className="text-xl md:text-2xl font-serif font-black tracking-tight mb-3 md:mb-4">{step.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground/80 leading-relaxed font-medium">{step.description}</p>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>

        {/* TESTIMONIALS: TRUSTED BY PROS */}
        <div className="mb-40 relative px-0 overflow-hidden">
          <div className="text-center mb-24 px-6">
            <AnimatedElement animation="fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-8">
                <Quote className="w-3 h-3 fill-current" />
                Elite Validations
              </div>
              <h3 className="text-4xl md:text-7xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
                Global <br />
                <em className="italic font-light text-primary">Consensus</em>
              </h3>
              <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto font-medium">
                Join thousands of digital architects who rely on SnapTools for their daily technical operations.
              </p>
            </AnimatedElement>
          </div>

          <div className="relative group/marquee">
            {/* Seamless Marquee Container */}
            {!shouldReduceMotion ? (
              <div
                className={cn(
                  "flex gap-6 animate-marquee",
                  isPaused && "[animation-play-state:paused]"
                )}
                style={{
                  animationPlayState: isPaused ? 'paused' : 'running'
                }}
              >
                {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                  <div
                    key={index}
                    className="w-[400px] shrink-0 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl flex flex-col h-full hover:shadow-2xl hover:border-primary/20 transition-all duration-500"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    <div className="flex gap-1 mb-6 md:mb-8">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="text-primary fill-current opacity-80" />
                      ))}
                    </div>
                    <Quote size={28} className="text-primary opacity-20 mb-6" />
                    <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium mb-8 md:mb-10 flex-grow italic">
                      "{testimonial.content}"
                    </p>
                    <div className="pt-6 border-t border-black/5 dark:border-white/5">
                      <div className="font-bold tracking-tight text-lg">{testimonial.name}</div>
                      <div className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">{testimonial.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl flex flex-col h-full"
                  >
                    <div className="flex gap-1 mb-8">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="text-primary fill-current opacity-80" />
                      ))}
                    </div>
                    <Quote size={24} className="text-primary opacity-20 mb-6" />
                    <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium mb-10 flex-grow italic">
                      "{testimonial.content}"
                    </p>
                    <div className="pt-6 border-t border-black/5 dark:border-white/5">
                      <div className="font-bold tracking-tight text-lg">{testimonial.name}</div>
                      <div className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">{testimonial.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Controls Overlay */}
            {!shouldReduceMotion && (
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPaused(!isPaused)}
                  className="rounded-full w-12 h-12 border-primary/20 bg-background/50 backdrop-blur-md hover:bg-primary hover:text-white transition-all shadow-lg"
                  aria-label={isPaused ? "Resume Animation" : "Pause Animation"}
                >
                  {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                </Button>
              </div>
            )}

            {/* Edge Fades for Seamless Look */}
            {!shouldReduceMotion && (
              <>
                <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
              </>
            )}
          </div>
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          /* Faster marquee with configurable CSS variable. Default: 28s */
          .animate-marquee {
            --marquee-duration: 28s;
            animation: marquee var(--marquee-duration) linear infinite;
          }
          /* Mobile: speed up the marquee for smaller viewports */
          @media (max-width: 640px) {
            .animate-marquee { --marquee-duration: 18s; }
          }
          /* Slightly slower on very large screens to avoid too-fast motion */
          @media (min-width: 1600px) {
            .animate-marquee { --marquee-duration: 36s; }
          }
        `}</style>

        {/* ALTERNATIVE: FREE VS PAID */}
        <div className="mb-40 px-4 md:px-6">
          <AnimatedElement animation="fadeIn">
            <div className="p-8 md:p-20 rounded-[2.5rem] md:rounded-[4rem] bg-black dark:bg-white text-white dark:text-black relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] opacity-30 -z-10" />
              <div className="flex flex-col lg:flex-row gap-12 md:gap-16 items-center">
                <div className="lg:w-1/2 space-y-8">
                  <h3 className="text-3xl md:text-6xl font-serif font-black tracking-tighter leading-[0.9]">
                    Professional <br />
                    <em className="italic font-light opacity-80">Alternative</em>
                  </h3>
                  <p className="text-base md:text-lg opacity-70 leading-relaxed font-medium">
                    Why maintain expensive enterprise subscriptions when SnapTools offers professional-grade logic for free? We are the open alternative to Adobe, Smallpdf, and premium conversion platforms.
                  </p>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4">
                    {[
                      { vs: "Adobe Acrobat", msg: "PDF Architecture" },
                      { vs: "Smallpdf", msg: "No Rate Limits" },
                      { vs: "TinyPNG", msg: "Neural Engine" },
                      { vs: "Paid QR", msg: "Vector Logic" }
                    ].map((item, i) => (
                      <div key={i} className="p-4 md:p-5 rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-3xl border border-white/10 dark:border-black/10">
                        <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1 md:mb-2">Competing with</p>
                        <p className="text-sm md:text-base font-bold tracking-tight">{item.vs}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:w-1/2 w-full">
                  <div className="p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-primary text-white space-y-6 md:space-y-8 shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Rocket className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h4 className="text-2xl md:text-3xl font-black tracking-tight leading-tight uppercase">
                      Enterprise Logic <br />
                      <span className="text-white/60">at Community Cost</span>
                    </h4>
                    <p className="text-xs md:text-sm leading-relaxed font-medium opacity-80 max-w-sm">
                      Access 100+ specialized modules without limitations. Our ecosystem is built to scale with your technical requirements.
                    </p>
                    <Link to="/tools">
                      <Button className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-white text-primary font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-neutral-100">
                        Launch Workstation <ArrowRight size={14} className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedElement>
        </div>

        {/* OPEN SOURCE: FOSS MANIFESTO */}
        <AnimatedElement animation="fadeIn" delay={0.2}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="relative p-8 md:p-24 rounded-[2.5rem] md:rounded-[4rem] border-2 border-primary/20 bg-muted/30 dark:bg-white/[0.01] backdrop-blur-3xl overflow-hidden group">
              {/* Animated Background Decor */}
              <Github className="absolute -right-20 -bottom-20 w-[400px] h-[400px] text-primary opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000" />

              <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16 relative z-10">
                <div className="lg:w-2/3 space-y-6 md:space-y-8 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-4">
                    <Code size={12} />
                    FOSS Infrastructure
                  </div>
                  <h3 className="text-3xl md:text-7xl font-serif font-black tracking-tighter leading-[0.9]">
                    Open Source <br />
                    <em className="italic font-light text-primary">Manifesto</em>
                  </h3>
                  <p className="text-base md:text-xl text-muted-foreground/80 leading-relaxed max-w-2xl font-medium">
                    SnapTools is built by the community, for the community. Our architecture is transparent, auditable, and accessible on GitHub under open-source protocols.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center lg:justify-start pt-4">
                    <a
                      href="https://github.com/iam-sandipmaity/snaptools"
                      target="_blank"
                      className="h-14 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl bg-[#000000] text-white flex items-center justify-center font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-4 shadow-2xl hover:scale-[1.02] transition-all"
                    >
                      <Github className="w-[18px] h-[18px] md:w-5 md:h-5" />
                      Fork Protocol <ArrowUpRight size={14} />
                    </a>
                    <a
                      href="https://github.com/iam-sandipmaity/snaptools"
                      target="_blank"
                      className="h-14 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl border-2 border-primary/20 flex items-center justify-center font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-4 hover:bg-primary/5 transition-all text-foreground"
                    >
                      <Star className="w-4 h-4 md:w-[18px] md:h-[18px] text-primary fill-current" />
                      Star Repository
                    </a>
                  </div>
                </div>

                <div className="lg:w-1/3 w-full">
                  <div className="p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-black/40 border border-primary/10 shadow-2xl backdrop-blur-3xl text-center">
                    <Heart className="w-10 h-10 md:w-12 md:h-12 text-primary fill-current mx-auto mb-4 md:mb-6" />
                    <h4 className="text-lg md:text-xl font-bold mb-2">Community Driven</h4>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-medium mb-6 md:mb-8">Maintain our free infrastructure by supporting the project on GitHub.</p>
                    <div className="flex items-center justify-center gap-1 py-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-500 fill-current" />)}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Architectural Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>

        {/* BOTTOM ACCESSIBILITY MARK */}
        <div className="mt-32 text-center opacity-20 pointer-events-none select-none">
          <h4 className="text-[12vw] font-serif font-black tracking-tighter">SnapTools Core</h4>
        </div>

      </div>
    </section>
  );
};

export default SEOContentSection;
