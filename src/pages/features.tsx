import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Shield,
  Gauge,
  Laptop,
  Cloud,
  Users,
  Globe,
  Lock,
  Cpu,
  MousePointer2,
  Workflow
} from "lucide-react";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: string;
}) => (
  <div
    className="group p-8 rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
      <Icon className="h-7 w-7 transition-colors duration-500" />
    </div>
    <h3 className="text-2xl font-serif font-bold mb-3 tracking-tight">{title}</h3>
    <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
  </div>
);

const Features = () => {
  const mainFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Proprietary processing engine that handles heavy file operations in milliseconds, not minutes.",
      delay: "100ms"
    },
    {
      icon: Shield,
      title: "Private by Design",
      description: "Everything runs client-side when possible. Your files never touch our servers unless absolutely necessary.",
      delay: "200ms"
    },
    {
      icon: Globe,
      title: "Global Edge",
      description: "Deployed across 20+ global regions to ensure the lowest latency wherever you are in the world.",
      delay: "300ms"
    }
  ];

  const secondaryFeatures = [
    {
      icon: Laptop,
      title: "Full Responsive",
      description: "Seamless experience from mobile to desktop. Work on your terms, from any device anywhere.",
      delay: "400ms"
    },
    {
      icon: Cpu,
      title: "AI Optimized",
      description: "Leveraging the latest AI models to provide context-aware results for text and image tools.",
      delay: "500ms"
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-grade encryption for all file transfers with automated data purging policies.",
      delay: "600ms"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-grow pt-32 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none opacity-30 dark:opacity-20">
          <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/40 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[5%] w-80 h-80 bg-blue-500/30 rounded-full blur-[100px]" />
        </div>

        {/* HERO SECTION */}
        <section className="container max-w-6xl mx-auto px-6 text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-8 animate-fade-in shadow-sm">
            <Workflow className="w-3 h-3" />
            Capabilities
          </div>
          <h1 className="text-5xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-[0.95] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 animate-fade-in-up">
            Powering Your <br />
            <em className="italic text-primary">Digital Workflow</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            We've distilled complex operations into a single-click experience. Built for speed, privacy, and absolute precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Link to="/tools">
              <Button className="px-10 py-7 text-xs uppercase tracking-widest font-black rounded-full shadow-[0_20px_40px_rgba(25,118,210,0.25)] hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                Explore All Tools
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" className="px-10 py-7 text-xs uppercase tracking-widest font-black rounded-full hover:bg-primary/5 w-full sm:w-auto">
                See Professional Plans
              </Button>
            </Link>
          </div>
        </section>

        {/* MAIN CAPABILITIES GRID */}
        <section className="container max-w-7xl mx-auto px-6 pb-40">
          <div className="grid md:grid-cols-3 gap-10">
            {mainFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>

          {/* Secondary Features with different style */}
          <div className="mt-32 pt-20 border-t border-black/5 dark:border-white/5">
            <div className="grid md:grid-cols-3 gap-16">
              {secondaryFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-6 animate-fade-in-up" style={{ animationDelay: feature.delay }}>
                  <div className="shrink-0 p-4 rounded-2xl bg-muted/50 dark:bg-white/[0.03] border border-border h-fit">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 tracking-tight">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PERFORMANCE SECTION */}
        <section className="bg-black/5 dark:bg-white/[0.02] py-40">
          <div className="container max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 border border-white/10 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-7xl font-serif font-black text-primary mb-2">99.9%</div>
                  <div className="text-xs uppercase tracking-widest font-bold opacity-40">Uptime Reliability</div>
                </div>
                {/* Decorative abstract elements */}
                <div className="absolute top-10 right-10 w-20 h-20 border border-primary/20 rounded-full animate-ping" />
                <div className="absolute bottom-10 left-10 w-32 h-32 border border-primary/10 rounded-full" />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Performance Optimized</p>
              <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter leading-[1.1]">
                Engineered for <br />
                <em className="italic text-primary">Extreme Precision.</em>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe that productivity software should get out of your way. Our architecture is designed to minimize distractions and maximize throughput. No wait times, no unnecessary clicks.
              </p>
              <div className="grid grid-cols-2 gap-8 mt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold tracking-tighter">0.1s</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Avg Response</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold tracking-tighter">200+</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Free Modules</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="container max-w-6xl mx-auto px-6 py-40">
          <div className="relative overflow-hidden rounded-[4rem] bg-black dark:bg-white p-16 md:p-24 shadow-2xl">
            {/* Architectural Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[120px] opacity-40 -z-10"></div>

            <div className="relative z-10 flex flex-col items-center text-center gap-12">
              <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 rotate-12">
                <Workflow className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-6">
                <h2 className="text-5xl md:text-8xl font-serif font-black text-white dark:text-black tracking-tighter leading-[0.85]">
                  Refine Your <br />
                  <em className="italic font-light text-primary">Architecture.</em>
                </h2>
                <p className="text-white/60 dark:text-black/60 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                  Join 50,000+ digital architects leveraging the SnapTools mission-critical infrastructure for high-fidelity technical manipulation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                <Link to="/tools" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase tracking-[0.3em] px-12 py-8 rounded-2xl w-full shadow-2xl shadow-primary/20">
                    Initialize Suite
                  </Button>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-white/20 dark:border-black/10 text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/5 font-black text-[10px] uppercase tracking-[0.3em] px-12 py-8 rounded-2xl w-full">
                    Consultation
                  </Button>
                </Link>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Enterprise Ready", "Zero Knowledge", "Millisecond Latency"].map((badge, i) => (
                  <div key={i} className="px-5 py-2.5 rounded-full bg-white/5 dark:bg-black/5 border border-white/10 dark:border-black/10 backdrop-blur-xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 dark:text-black/40">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default Features;
