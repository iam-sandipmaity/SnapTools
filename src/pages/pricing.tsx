import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Command, ShieldCheck, Zap, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const PricingTier = ({
  title,
  price,
  description,
  features,
  buttonText,
  highlighted = false,
  delay = "0s"
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
  delay?: string;
}) => (
  <div
    className={cn(
      "group relative rounded-[3rem] p-10 transition-all duration-500 animate-fade-in-up flex flex-col h-full",
      highlighted
        ? "bg-black dark:bg-white text-white dark:text-black shadow-2xl scale-105 z-10"
        : "bg-white/50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 backdrop-blur-xl hover:bg-white dark:hover:bg-white/[0.04]"
    )}
    style={{ animationDelay: delay }}
  >
    {highlighted && (
      <div className="absolute top-8 right-8">
        <div className="bg-primary px-4 py-1.5 rounded-full flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-white" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Most Popular</span>
        </div>
      </div>
    )}

    <div className="mb-10">
      <h3 className="text-2xl font-serif font-black tracking-tight mb-2">{title}</h3>
      <p className={cn("text-sm opacity-60 leading-relaxed", highlighted ? "" : "")}>{description}</p>
    </div>

    <div className="mb-12">
      <div className="flex items-baseline gap-1">
        <span className="text-6xl font-serif font-black tracking-tighter">{price}</span>
        {price !== "Free" && <span className="text-xs font-black uppercase tracking-widest opacity-40">/ Month</span>}
      </div>
    </div>

    <ul className="space-y-5 mb-12 flex-grow">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3 group/item">
          <div className={cn("mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0", highlighted ? "bg-white/20 dark:bg-black/10" : "bg-primary/10")}>
            <Check className={cn("h-3 w-3", highlighted ? "text-white dark:text-black" : "text-primary")} />
          </div>
          <span className="text-sm font-medium opacity-80 group-hover/item:opacity-100 transition-all cursor-default">{feature}</span>
        </li>
      ))}
    </ul>

    <Button
      className={cn(
        "h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
        highlighted
          ? "bg-primary text-white hover:bg-primary/90 hover:scale-[1.02]"
          : "bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02]"
      )}
    >
      {buttonText}
      {highlighted ? <ArrowRight className="ml-2 w-4 h-4" /> : <ArrowUpRight className="ml-2 w-4 h-4" />}
    </Button>
  </div>
);

const Pricing = () => {
  const tiers = [
    {
      title: "Discovery",
      price: "Free",
      description: "Experiment with our ecosystem core and standard modules.",
      features: [
        "100+ standard browser tools",
        "Limited cloud processing bits",
        "Standard latency guarantees",
        "Public node community access",
        "Basic technical docs"
      ],
      buttonText: "Start Experimenting",
      delay: "0.1s"
    },
    {
      title: "Professional",
      price: "$9.99",
      description: "Engineered for solo architects and technical leads.",
      features: [
        "All Discovery features",
        "Unlimited client-side processing",
        "Priority edge-network routing",
        "Early access to beta modules",
        "Advanced technical support",
        "Hardware-accelerated logic"
      ],
      buttonText: "Authorize Access",
      highlighted: true,
      delay: "0.2s"
    },
    {
      title: "Enterprise",
      price: "$29.99",
      description: "Customized infrastructure for resilient organizations.",
      features: [
        "All Professional features",
        "Multi-region deployment control",
        "Dedicated infrastructure node",
        "Custom module development",
        "SLA-managed 24/7 support",
        "White-labeled instance options"
      ],
      buttonText: "Secure Integration",
      delay: "0.3s"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Header />

      <main className="flex-grow pt-32 pb-40 relative overflow-hidden">
        {/* Ambient Gradients */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full -translate-y-1/2 pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 pointer-events-none -z-10" />

        <div className="container max-w-7xl mx-auto px-6 relative z-10">

          {/* HEADER */}
          <header className="max-w-4xl mx-auto text-center mb-24 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-8">
              <ShieldCheck className="w-3 h-3" />
              Scale Securely
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
              Elite <br />
              <em className="italic font-light text-primary">Infrastucture</em>
            </h1>
            <p className="text-xl text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto">
              Select the plan that aligns with your operational requirements. From standard experiments to enterprise-grade execution.
            </p>
          </header>

          {/* TIERS GRID */}
          <div className="grid md:grid-cols-3 gap-8 mb-40 items-stretch">
            {tiers.map((tier) => (
              <PricingTier key={tier.title} {...tier} />
            ))}
          </div>

          {/* FOOTER CTA */}
          <section className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="inline-flex items-center gap-4 p-8 rounded-[3rem] bg-muted/30 dark:bg-white/[0.01] border border-black/5 dark:border-white/10 backdrop-blur-3xl shadow-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Command size={24} />
              </div>
              <div className="text-left py-2">
                <h4 className="text-xl font-bold tracking-tight mb-1">Require a bespoke architecture?</h4>
                <p className="text-sm text-muted-foreground">Our engineering leads are available for custom orchestration discussions.</p>
              </div>
              <div className="ml-8">
                <Link to="/contact">
                  <Button variant="outline" className="h-14 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest border-primary/20 hover:bg-primary hover:text-white transition-all">
                    Contact Protocols
                  </Button>
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

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

export default Pricing;