import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, FileText, Bell, MessageSquare, Cookie } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import { Helmet } from "react-helmet-async";

const PrivacySection = ({
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

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Helmet>
        <title>Privacy Policy | SnapTools - Secure & Private Tools</title>
        <meta name="description" content="At SnapTools, your privacy is our priority. Read our privacy policy to understand how we protect your data." />
      </Helmet>

      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Dynamic Background Architecture */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-primary/[0.02] blur-[150px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 -z-10" />

        <div className="container max-w-6xl mx-auto px-6 pt-40 pb-40">
          {/* Header Section */}
          <div className="max-w-3xl mb-24">
            <AnimatedElement animation="fadeIn">
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                <ShieldCheck className="w-3 h-3" />
                Data Integrity Standards
              </div>
              <h1 className="text-6xl md:text-9xl font-serif font-black tracking-tighter leading-[0.85] mb-8">
                Privacy <br /><em className="italic font-light text-primary">Protocol</em>
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                Our architecture is designed with a "Privacy First" philosophy.
                We believe your data belongs to you, and our tools are built to reflect that commitment.
              </p>
            </AnimatedElement>
          </div>

          {/* Policy Grid */}
          <div className="grid grid-cols-1 gap-8">
            <PrivacySection icon={Eye} title="1. Information Architecture" index={1}>
              <p>
                We collect information that you explicitly provide when interacting with our specialized modules.
                This consists primarily of usage telemetry and technical metadata required to optimize
                the performance of the SnapTools ecosystem on your specific device.
              </p>
            </PrivacySection>

            <PrivacySection icon={Lock} title="2. Utilization Logic" index={2}>
              <p>
                The primary purpose of data ingestion is the iterative refinement of our tool suite.
                We utilize telemetry to debug complex edge cases, enhance processing speeds,
                and ship updates that align with our users' actual workflow patterns.
              </p>
            </PrivacySection>

            <PrivacySection icon={FileText} title="3. Disclosure Framework" index={3}>
              <p>
                SnapTools operates on a zero-commercialization data policy. We do not sell,
                lease, or exchange your operational data with third-party entities.
                Any data shared is strictly anonymous and strictly for high-level aggregate analytics.
              </p>
            </PrivacySection>

            <PrivacySection icon={ShieldCheck} title="4. Security Infrastructure" index={4}>
              <p>
                We deploy industry-standard encryption and organizational protocols to safeguard
                the integrity of any data passing through our systems. Most of our tools
                execute entirely client-side, ensuring your sensitive files never even reach our infrastructure.
              </p>
            </PrivacySection>

            <PrivacySection icon={Cookie} title="5. Tracking Technologies" index={5}>
              <p>
                We use optional product analytics (Vercel Analytics in production, unless `VITE_DISABLE_ANALYTICS=true`)
                to understand aggregate navigation. Session cookies may also be used by the browser for theme and
                similar preferences. You can disable analytics in a self-hosted build and control cookies through
                your browser settings.
              </p>
            </PrivacySection>

            <PrivacySection icon={Bell} title="6. Protocol Modifications" index={6}>
              <p>
                This protocol is subject to periodic optimization. Significant changes will be
                communicated directly through this interface, with the "Last Synchronized"
                timestamp updated accordingly.
              </p>
            </PrivacySection>

            <PrivacySection icon={MessageSquare} title="7. Communication Channel" index={7}>
              <p>
                If you require clarification on any aspect of our privacy architecture,
                please initiate contact through our specialized inquiry module.
              </p>
              <div className="mt-8">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Initiate Inquiry
                </a>
              </div>
            </PrivacySection>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
