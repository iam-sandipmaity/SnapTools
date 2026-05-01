import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Mail, Twitter, MapPin, Clock, Send, ShieldCheck, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { initEmailJS, sendEmail } from "@/lib/emailjs";
import { Loader2 } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    initEmailJS();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await sendEmail(formData);

    if (result.success) {
      toast({
        title: "Communication Established",
        description: "Your inquiry has been synthesized into our queue.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } else {
      toast({
        title: "Transmission Error",
        description: "Failed to establish secure uplink. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-grow pt-40 pb-32 relative overflow-hidden">
        {/* Architectural Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/3 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3 -z-10"></div>

        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-start">

            {/* Left Column: Context */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
                Inquiry Terminal
              </div>

              <h1 className="text-6xl md:text-9xl font-serif font-black tracking-tighter mb-10 leading-[0.8] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
                Contact <br />
                <em className="italic font-light text-primary text-5xl md:text-7xl block mt-4">Uplink.</em>
              </h1>

              <p className="text-xl text-muted-foreground/80 max-w-md leading-relaxed font-medium mb-16">
                Establish a direct communication channel with the SnapTools engineering and support division.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 mb-16">
                <div className="p-8 rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-500">
                  <div className="w-12 h-12 rounded-[1rem] bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Endpoint</div>
                  <div className="text-sm font-bold truncate">contact.sandipmaity@gmail.com</div>
                </div>

                <div className="p-8 rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-500">
                  <div className="w-12 h-12 rounded-[1rem] bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <Twitter className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Social Hub</div>
                  <div className="text-sm font-bold">@iam_sandipmaity</div>
                </div>

                <div className="p-8 rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-500">
                  <div className="w-12 h-12 rounded-[1rem] bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Geolocation</div>
                  <div className="text-sm font-bold">Kolkata, India</div>
                </div>

                <div className="p-8 rounded-[2rem] border border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5 transition-all duration-500">
                  <div className="w-12 h-12 rounded-[1rem] bg-primary flex items-center justify-center text-white mb-6">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Latency</div>
                  <div className="text-sm font-bold text-primary">24-48 Hour Response</div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-8 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Zero Knowledge</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Global Routing</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Inquiry Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-50 -z-10" />
              <div className="p-12 rounded-[3.5rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Send className="w-24 h-24 rotate-12" />
                </div>

                <h2 className="text-4xl font-serif font-black tracking-tighter mb-10 leading-tight">
                  Initialize <br />
                  <em className="italic font-light text-primary">Secure Transmission.</em>
                </h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label htmlFor="name" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 pl-2">
                        Identity
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 px-6 py-4 text-lg font-medium focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 pl-2">
                        Digital Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 px-6 py-4 text-lg font-medium focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="subject" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 pl-2">
                      Inquiry Protocol
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 px-6 py-4 text-lg font-medium focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                      placeholder="e.g. Technical Support"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="message" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 pl-2">
                      Payload
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 px-6 py-4 text-lg font-medium focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-none"
                      placeholder="Describe your architectural requirements..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full group mt-8 bg-black dark:bg-white text-white dark:text-black rounded-2xl px-4 py-6 font-black text-[10px] uppercase tracking-[0.3em] overflow-hidden relative shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Initialize Transmission
                          <Send className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
