
import FeatureCard from "@/components/feature-card";
import { features } from "@/data/features";
import AnimatedElement from "@/components/animated-element";
import { ShieldCheck } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 px-6 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/[0.02] -z-10 blur-[120px]" />

      <div className="container max-w-7xl mx-auto space-y-24">
        <div className="text-center max-w-4xl mx-auto">
          <AnimatedElement animation="fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-8">
              <ShieldCheck className="w-3 h-3" />
              Standard Excellence
            </div>
            <h2 className="text-5xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
              Why choose <br />
              <em className="italic font-light text-primary">SnapTools?</em>
            </h2>
            <p className="text-xl text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-medium">
              Every tool is architected for three core principles: extreme performance, uncompromising privacy, and professional-grade accessibility.
            </p>
          </AnimatedElement>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedElement
              key={index}
              delay={index * 0.1}
              animation="slideUp"
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className="h-full"
              />
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
