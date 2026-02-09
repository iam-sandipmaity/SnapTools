
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
import { lazy, Suspense } from "react";

// Lazy load ToolsSection to prevent loading 40KB of tool metadata on initial load
const ToolsSection = lazy(() => import("@/sections/tools-section"));

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="SnapTools - 100+ Free Online PDF, Image & Converter Tools"
        description="Free online tools for PDF merge/split/compress, image compression, QR codes, calculators & more. No registration. Fast, secure & privacy-focused."
      />
      <Header />
      <main className="flex-grow pt-16">
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
