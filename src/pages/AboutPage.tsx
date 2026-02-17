import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Users, Heart, Command, Globe, Code2 } from "lucide-react";

const AboutPage = () => {
  const values = [
    {
      icon: Zap,
      title: "Edge Optimization",
      description: "We architect every module for millisecond-latency, leveraging global edge compute for real-time processing."
    },
    {
      icon: Shield,
      title: "Privacy Primitive",
      description: "Privacy isn't a feature; it's our foundation. We prioritize client-side execution so your data stays on your metal."
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      description: "Designed to be lightweight and accessible from any node on the planet, regardless of bandwidth constraints."
    },
    {
      icon: Code2,
      title: "Technical Precision",
      description: "Tools engineered by developers, for developers. We focus on raw performance and output fidelity."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Header />

      <main className="flex-grow pt-32 pb-40 relative overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-0 left-0 w-1/3 h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-1/4 h-[500px] bg-primary/5 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="container max-w-7xl mx-auto px-6 relative z-10">

          {/* HERO SECTION */}
          <header className="max-w-4xl mx-auto text-center mb-24 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-8">
              <Command className="w-3 h-3" />
              Our Manifesto
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
              The Pursuit of <br />
              <em className="italic font-light text-primary">Precision</em>
            </h1>
            <p className="text-xl text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto">
              SnapTools was born from a simple observation: the digital tools we use daily should be fast, private, and unequivocally professional. We are building the world's most accessible workstation for technical creators.
            </p>
          </header>

          {/* GRID: MISSION & PHILOSOPHY */}
          <div className="grid lg:grid-cols-2 gap-16 mb-40 animate-fade-in-up">
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black tracking-tight">The Mission</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground/90 space-y-6">
                <p>
                  We believe that professional-grade software shouldn't be locked behind heavy subscriptions or invasive registration walls. SnapTools provides an open ecosystem of specialized modules that run directly in your browser.
                </p>
                <p>
                  By leveraging modern WebAssembly and client-side JavaScript, we've eliminated the need for data transfers to 3rd-party servers for many of our tools, establishing a new standard for online privacy.
                </p>
              </div>
              <div className="pt-4">
                <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-muted/30 dark:bg-white/[0.01] border border-black/5 dark:border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">100,000+ Monthly Users</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">Architecting his future workflow</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((item, i) => (
                <div key={i} className="group p-8 rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-white dark:hover:bg-white/[0.04] transition-all duration-500 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <item.icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* TEAM & CTA */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative bg-black dark:bg-white rounded-[4rem] p-12 md:p-24 text-white dark:text-black text-center overflow-hidden shadow-2xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 opacity-30 blur-[100px]" />

              <div className="relative z-10 max-w-3xl mx-auto">
                <div className="w-20 h-20 rounded-full bg-white/10 dark:bg-black/10 mx-auto flex items-center justify-center mb-8 backdrop-blur-3xl">
                  <Heart className="w-8 h-8 text-primary fill-current" />
                </div>
                <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
                  Join the <br />
                  <em className="italic font-light opacity-80">Community</em>
                </h2>
                <p className="text-lg opacity-70 mb-12 max-w-xl mx-auto leading-relaxed">
                  SnapTools is a community-first platform. Help us maintain this ecosystem by contributing modules, reporting bugs, or supporting our infrastructure.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link to="/tools" className="w-full sm:w-auto">
                    <Button className="h-16 px-12 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl w-full sm:w-auto">
                      Explore Ecosystem
                    </Button>
                  </Link>
                  <Link to="/donate" className="w-full sm:w-auto">
                    <Button variant="outline" className="h-16 px-12 rounded-2xl border-white/20 dark:border-black/20 font-black text-[10px] uppercase tracking-widest w-full sm:w-auto hover:bg-white/10 dark:hover:bg-black/10">
                      Support Our Work
                    </Button>
                  </Link>
                </div>
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

export default AboutPage;