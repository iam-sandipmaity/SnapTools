import AnimatedElement from "@/components/animated-element";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="about"
      className="bg-blue-50/50 dark:bg-slate-900/50 py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 space-y-12"
    >
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <AnimatedElement animation="fadeIn">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">About SnapTools</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Your one-stop destination for powerful online tools and utilities
          </p>
        </AnimatedElement>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        <AnimatedElement animation="slideUp" delay={0.2}>
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Our Mission</h3>
            <p className="text-muted-foreground">
              We believe that powerful tools should be accessible to everyone. Our mission is to provide a comprehensive suite of utilities that enhance your productivity and streamline your workflow, all in one place.
            </p>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="slideUp" delay={0.3}>
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Why SnapTools?</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li>✓ Free, fast, and easy to use</li>
              <li>✓ No registration required</li>
              <li>✓ Privacy-focused approach</li>
              <li>✓ Regular updates and new tools</li>
            </ul>
          </div>
        </AnimatedElement>
      </div>

      <AnimatedElement animation="fadeIn" delay={0.4}>
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/documentation')}
            className="group"
          >
            Learn More
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
          </Button>
        </div>
      </AnimatedElement>
    </section>
  );
};

export default AboutSection;