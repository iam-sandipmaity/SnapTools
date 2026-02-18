import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { Scale, CheckCircle, AlertCircle, Zap, Shield, RefreshCw, FileText } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import { Helmet } from "react-helmet-async";

const TermsSection = ({
  icon: Icon,
  title,
  children,
  index
}: {
  icon: any,
  title: string,
  children: React.ReactNode,
  index: number
}) => (
  <AnimatedElement animation="fadeIn" delay={index * 0.1}>
    <div className="relative group p-8 md:p-12 rounded-[2.5rem] bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/10 hover:border-primary/20 transition-all duration-500">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <Icon className="text-primary" size={24} />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-black tracking-tighter mb-6">{title}</h2>
        <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  </AnimatedElement>
);

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Helmet>
        <title>Terms and Conditions | SnapTools - Legal Framework</title>
        <meta name="description" content="Review the SnapTools terms and conditions. Understand the rules, guidelines, and legal framework governing our professional tool suite." />
      </Helmet>

      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Dynamic Background Architecture */}
        <div className="absolute top-0 right-0 w-full h-[1000px] bg-primary/[0.015] blur-[150px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2 -z-10" />

        <div className="container max-w-6xl mx-auto px-6 pt-40 pb-40">
          {/* Header Section */}
          <div className="max-w-3xl mb-24">
            <AnimatedElement animation="fadeIn">
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                <Scale className="w-3 h-3" />
                Legal Framework v2.0
              </div>
              <h1 className="text-6xl md:text-9xl font-serif font-black tracking-tighter leading-[0.85] mb-8">
                Operating <br /><em className="italic font-light text-primary">Terms</em>
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                By engaging with the SnapTools ecosystem, you agree to adhere to the
                operational parameters outlined in this framework.
              </p>
            </AnimatedElement>
          </div>

          {/* Terms Grid */}
          <div className="grid grid-cols-1 gap-8">
            <TermsSection icon={CheckCircle} title="1. Acceptance of Terms" index={1}>
              <p>
                Accessing or utilizing specialized SnapTools modules constitutes an
                unconditional acceptance of this framework. If your operational
                requirements conflict with these parameters, you are advised to
                terminate your session immediately.
              </p>
            </TermsSection>

            <TermsSection icon={Zap} title="2. Usage Authorization" index={2}>
              <p>
                Users are granted a non-exclusive, temporary operational license
                for personal and professional transitory viewing of our tools.
                This grant does not constitute a transfer of intellectual property
                rights or ownership of the underlying logic modules.
              </p>
            </TermsSection>

            <TermsSection icon={AlertCircle} title="3. Warranty Disclaimer" index={3}>
              <p>
                The SnapTools ecosystem is provided in an "as-is" technological state.
                We disclaim all warranties, whether expressed or implied, including
                but not limited to merchantability, fitness for a specific purpose,
                and non-infringement of intellectual property.
              </p>
            </TermsSection>

            <TermsSection icon={Shield} title="4. Liability Constraints" index={4}>
              <p>
                In no event shall SnapTools or its maintainers be held liable for
                operational disruptions, data inconsistencies, or secondary
                damages arising from the utilization of our software suite.
              </p>
            </TermsSection>

            <TermsSection icon={FileText} title="5. Data Privacy Linkage" index={5}>
              <p>
                Operational engagement is simultaneously governed by our
                Privacy Protocol. We encourage a simultaneous review of that
                document to understand our data integrity standards.
              </p>
              <div className="mt-6">
                <a href="/privacy" className="text-primary font-bold text-sm hover:underline flex items-center gap-2">
                  View Privacy Protocol <Zap size={12} />
                </a>
              </div>
            </TermsSection>

            <TermsSection icon={RefreshCw} title="6. Framework Evolution" index={6}>
              <p>
                SnapTools maintainers reserve the right to recalibrate these terms
                at their sole discretion. Continued utilization after framework
                modifications signifies your acceptance of the updated operational
                parameters.
              </p>
            </TermsSection>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
