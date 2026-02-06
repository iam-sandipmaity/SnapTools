
import Header from "@/components/header";
import HeroSection from "@/sections/hero-section";
import FeaturedToolsSection from "@/sections/featured-tools-section";
import ToolsSection from "@/sections/tools-section";
import FeaturesSection from "@/sections/features-section";
import CtaSection from "@/sections/cta-section";
import FAQSection from "@/sections/faq-section";
import SEOContentSection from "@/sections/seo-content-section";
import Newsletter from "@/components/newsletter";
import Footer from "@/components/footer";
import SEO from "@/components/seo";

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
        <ToolsSection />
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
