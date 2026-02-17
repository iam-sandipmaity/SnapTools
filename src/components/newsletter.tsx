import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Mail, Sparkles, ArrowRight } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Security alert: Invalid email protocol detected.");
      return;
    }
    toast.success("Identity verified. You are now synchronized with SnapTools Insights.");
    setEmail("");
  };

  return (
    <section id="newsletter" className="py-32 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="relative bg-white dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-[2rem] md:rounded-[4rem] p-8 md:p-24 text-center overflow-hidden shadow-2xl">
          {/* Ambient Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] -z-10" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-10">
              <Sparkles className="w-3 h-3" />
              Protocol Access
            </div>

            <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
              Stay <em className="italic font-light text-primary">Synchronized</em>
            </h2>

            <p className="text-xl text-muted-foreground/80 font-medium mb-12 max-w-xl mx-auto leading-relaxed">
              Join 10,000+ architects and creators. Receive architectural updates and high-fidelity technical insights directly to your node.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto p-2 bg-muted/30 dark:bg-white/[0.02] backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-3xl">
              <div className="flex-grow relative flex items-center">
                <Mail className="absolute left-6 text-muted-foreground/40 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Identify via email..."
                  className="h-16 border-none bg-transparent shadow-none pl-14 text-lg font-medium focus-visible:ring-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="h-16 px-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-widest shadow-xl shrink-0 group">
                Subscribe Protocol <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>

            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 mt-8">
              Encrypted Delivery • Zero Spam Policy • 1-Click Desync
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
