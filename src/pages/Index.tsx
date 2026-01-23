
import Header from "@/components/header";
import HeroSection from "@/sections/hero-section";
import FeaturedToolsSection from "@/sections/featured-tools-section";
import ToolsSection from "@/sections/tools-section";
import FeaturesSection from "@/sections/features-section";
import CtaSection from "@/sections/cta-section";
import FAQSection from "@/sections/faq-section";
import Newsletter from "@/components/newsletter";
import Footer from "@/components/footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <HeroSection />
        <FeaturedToolsSection />
        <ToolsSection />
        <FeaturesSection />
        <CtaSection />
        <FAQSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
