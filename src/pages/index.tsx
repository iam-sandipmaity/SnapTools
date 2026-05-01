
import Header from "@/components/header";
import HeroSection from "@/sections/hero-section";
import FeaturedToolsSection from "@/sections/featured-tools-section";
import FeaturesSection from "@/sections/features-section";
import CtaSection from "@/sections/cta-section";
import FAQSection from "@/sections/faq-section";
import SEOContentSection from "@/sections/seo-content-section";
import Newsletter from "@/components/newsletter";
import Footer from "@/components/footer";
import SEO from "@/components/seo";
import { lazy, Suspense, useState, useEffect } from "react";
import { SystemDiagnosticLoader } from "@/components/SystemDiagnosticLoader";
import { InteractiveGrid } from "@/components/InteractiveGrid";

// Lazy load ToolsSection to prevent loading 40KB of tool metadata on initial load
const ToolsSection = lazy(() => import("@/sections/tools-section"));

const Index = () => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Check if diagnostic has run in this session
    const hasRunDiagnostic = sessionStorage.getItem("snaptools_diagnostic_run");
    if (!hasRunDiagnostic) {
      setShowLoader(true);
      sessionStorage.setItem("snaptools_diagnostic_run", "true");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <InteractiveGrid />
      {showLoader && <SystemDiagnosticLoader />}
      <SEO
        title="SnapTools - 200+ Free Online PDF, Image & Converter Tools"
        description="Free online tools for PDF merge/split/compress, image compression, QR codes, calculators & more. No registration. Fast, secure & privacy-focused."
      />
      <Header />
      <main id="main-content" className="flex-grow pt-1">
        <HeroSection />
        <FeaturedToolsSection />
        {/* Lazy load tools section - loads when user scrolls */}
        <Suspense fallback={<div className="container-padding py-20 text-center">Loading tools...</div>}>
          <ToolsSection />
        </Suspense>
        <FeaturesSection />
        <SEOContentSection />
        <CtaSection />
        <FAQSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
