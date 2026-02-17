import AnimatedElement from "@/components/animated-element";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DocumentationSection = () => {
  return (
    <section
      id="documentation"
      className="bg-blue-50/50 dark:bg-slate-900/50 py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 space-y-12"
    >
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <AnimatedElement animation="fadeIn">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Documentation</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Everything you need to know about using SnapTools
          </p>
        </AnimatedElement>
      </div>

      <AnimatedElement animation="fadeIn" delay={0.2}>
        <Tabs defaultValue="getting-started" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Features Guide</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Welcome to SnapTools</h3>
                <p className="text-muted-foreground">
                  Getting started with SnapTools is easy! Simply choose a tool from our extensive collection and start using it right away. No registration required.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Quick Start Steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Browse our tool categories</li>
                    <li>Select the tool you need</li>
                    <li>Follow the tool-specific instructions</li>
                    <li>Get your results instantly</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Features Overview</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Code Tools</h4>
                    <p className="text-muted-foreground">Format, minify, and validate your code with our comprehensive suite of development tools.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Text Tools</h4>
                    <p className="text-muted-foreground">Transform, analyze, and manipulate text with our powerful text processing utilities.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Image Tools</h4>
                    <p className="text-muted-foreground">Convert, optimize, and edit images with our easy-to-use image processing tools.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Is SnapTools free to use?</h4>
                    <p className="text-muted-foreground">Yes, all our tools are completely free to use with no hidden charges.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Do I need to create an account?</h4>
                    <p className="text-muted-foreground">No, you can use all our tools without registration.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Is my data secure?</h4>
                    <p className="text-muted-foreground">We process all data locally in your browser and never store or transmit your information.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AnimatedElement>
    </section>
  );
};

export default DocumentationSection;