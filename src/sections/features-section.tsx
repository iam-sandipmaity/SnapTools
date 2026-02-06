
import FeatureCard from "@/components/feature-card";
import { features } from "@/data/features";
import AnimatedElement from "@/components/animated-element";

const FeaturesSection = () => {
  return (
    <section 
      id="features" 
      className="bg-accent py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 space-y-12"
    >
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Why Choose SnapTools?</h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Built with productivity in mind, our platform offers everything you need to work smarter, not harder
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <AnimatedElement 
            key={index} 
            delay={index * 0.15} 
            animation="slideUp"
            className="hover:scale-[1.02] transition-transform duration-300 ease-in-out"
          >
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              className="h-full flex flex-col justify-between"
            />
          </AnimatedElement>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
