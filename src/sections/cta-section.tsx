import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <section className="py-32 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="relative bg-black dark:bg-white rounded-[2rem] md:rounded-[4rem] p-8 md:p-24 text-white dark:text-black text-center overflow-hidden shadow-2xl">
          {/* Ambient Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-t from-primary/30 to-transparent opacity-50" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <AnimatedElement animation="slideUp">
              <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-8">
                <Sparkles className="w-3 h-3" />
                Instant Accessibility
              </div>

              <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
                Elevate your <br />
                <em className="italic font-light opacity-80">productivity</em>
              </h2>

              <p className="text-xl opacity-70 mb-12 max-w-xl mx-auto leading-relaxed">
                Access our entire suite of professional modules today. No subscriptions, no gates, just high-performance results.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/tools" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-primary text-white hover:bg-primary/90 h-16 px-12 rounded-2xl font-black text-[10px] uppercase tracking-widest w-full sm:w-auto shadow-xl"
                  >
                    Enter Workstation <ArrowRight className="ml-3 w-4 h-4" />
                  </Button>
                </Link>

                <Link to="/documentation" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/20 dark:border-black/20 h-16 px-12 rounded-2xl font-black text-[10px] uppercase tracking-widest w-full sm:w-auto hover:bg-white/10 dark:hover:bg-black/10"
                  >
                    Read Documentation
                  </Button>
                </Link>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
