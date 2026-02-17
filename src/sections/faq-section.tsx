import { Link } from "react-router-dom";
import AnimatedElement from "@/components/animated-element";
import { HelpCircle, ChevronRight, ArrowRight } from "lucide-react";

const FAQSection = () => {
  const faqs = [
    {
      question: "Are the tools free to use?",
      answer: "Yes. SnapTools is a community-owned ecosystem. All processing modules are free to use without subscriptions or hidden paywalls."
    },
    {
      question: "Is my data secure?",
      answer: "We prioritize your privacy. All processing happens locally in your browser using client-side JavaScript—your files never hit our servers."
    },
    {
      question: "Can I use the tools offline?",
      answer: "Since most operations are executed locally, standard tools work entirely offline once the module is initialized in your browser."
    },
    {
      question: "What file formats are supported?",
      answer: "We support a vast array of technical formats. From specialized PDF structures to neural image formats, our support is constantly evolving."
    }
  ];

  return (
    <section className="py-32 px-6 bg-background relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2 -z-10" />

      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <AnimatedElement animation="fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-8">
              <HelpCircle className="w-3 h-3" />
              Information Hub
            </div>
            <h2 className="text-5xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
              Common <br />
              <em className="italic font-light text-primary">Queries</em>
            </h2>
            <p className="text-xl text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-medium">
              Quick insights into the SnapTools architecture and our commitment to professional-grade digital privacy.
            </p>
          </AnimatedElement>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {faqs.map((faq, index) => (
            <AnimatedElement key={index} delay={index * 0.1}>
              <div className="p-10 rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-white dark:hover:bg-white/[0.04] transition-all duration-500">
                <h3 className="text-2xl font-serif font-black tracking-tight mb-4">{faq.question}</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">{faq.answer}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>

        <div className="text-center mt-16 animate-fade-in-up">
          <Link
            to="/documentation?section=faq#faq"
            className="group inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest text-primary"
          >
            Access Full Documentation
            <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
