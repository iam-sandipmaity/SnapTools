import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Github, 
  Server, 
  Shield, 
  Code, 
  Terminal,
  CheckCircle2,
  Copy,
  ExternalLink,
  ArrowLeft,
  Lock,
  Database,
  Globe,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

const SelfHost = () => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const steps = [
    {
      title: "Clone the Repository",
      description: "Get the complete SnapTools source code from GitHub",
      command: "git clone https://github.com/iam-sandipmaity/SnapTools.git",
      icon: <Github className="w-6 h-6" />
    },
    {
      title: "Install Dependencies",
      description: "Set up all required packages and dependencies",
      command: "cd SnapTools && npm install",
      icon: <Terminal className="w-6 h-6" />
    },
    {
      title: "Configure Environment",
      description: "Set up your environment variables for full control",
      command: "cp .env.example .env && nano .env",
      icon: <Code className="w-6 h-6" />
    },
    {
      title: "Build & Deploy",
      description: "Compile and start your own private instance",
      command: "npm run build && npm run preview",
      icon: <Server className="w-6 h-6" />
    }
  ];

  const features = [
    {
      title: "Complete Data Privacy",
      description: "All processing happens on your server. No external analytics, no tracking, no data leaves your infrastructure.",
      icon: <Shield className="w-8 h-8 text-green-500" />
    },
    {
      title: "Full Source Access",
      description: "Modify any tool, add custom features, remove what you don't need. Complete control over your tool suite.",
      icon: <Code className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Developer Friendly",
      description: "Built with React, TypeScript, and Vite. Easy to understand, modify, and extend with your own tools.",
      icon: <Terminal className="w-8 h-8 text-purple-500" />
    },
    {
      title: "Self-Contained",
      description: "No external dependencies for core functionality. Works offline, behind firewalls, in air-gapped networks.",
      icon: <Lock className="w-8 h-8 text-orange-500" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Header />

      <main className="flex-grow pt-32 pb-40 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-1/3 h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-1/4 h-[600px] bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none -z-10" />

        <div className="site-container relative z-10">
          {/* Back Navigation */}
          <motion.button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all mb-12 bg-transparent border-none cursor-pointer font-black text-[10px] uppercase tracking-widest"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft size={14} />
            Back
          </motion.button>

          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-black text-[10px] uppercase tracking-widest mb-8">
              <Shield className="w-3 h-3" />
              Privacy-First Architecture
            </div>
            
            <h1 className="text-5xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
              Take Full <em className="italic font-light text-primary">Control</em>
              <br />
              <span className="text-4xl md:text-6xl">Self-Host SnapTools</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-12">
              Deploy your own private instance of SnapTools on your infrastructure. 
              Complete privacy, zero tracking, full source access. Perfect for privacy-conscious 
              professionals, developers, and organizations with strict data policies.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-16 px-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary text-white hover:scale-[1.02] transition-all"
                onClick={() => window.open('https://github.com/iam-sandipmaity/SnapTools', '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-primary/20 hover:bg-primary/5"
                onClick={() => document.getElementById('setup-guide')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Terminal className="w-4 h-4 mr-2" />
                Setup Guide
              </Button>
            </div>
          </motion.div>

          {/* Why Self-Host Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-4">
                Why Choose <em className="italic text-primary">Self-Hosting?</em>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join the movement of developers and privacy advocates who demand complete control over their tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border-0 bg-white/50 dark:bg-white/[0.02] backdrop-blur-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
                    <CardContent className="pt-8">
                      <div className="mb-6">{feature.icon}</div>
                      <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Setup Guide */}
          <motion.div
            id="setup-guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-4">
                Quick <em className="italic text-primary">Setup</em> Guide
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get your private SnapTools instance running in under 5 minutes
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-0 bg-white/50 dark:bg-white/[0.02] backdrop-blur-2xl shadow-2xl overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          {step.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              Step {index + 1}
                            </Badge>
                            <h3 className="text-xl font-bold">{step.title}</h3>
                          </div>
                          <p className="text-muted-foreground mb-4">{step.description}</p>
                          
                          <div className="relative group">
                            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                              <code className="text-primary">{step.command}</code>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(step.command, `Step ${index + 1}`)}
                            >
                              {copiedCommand === `Step ${index + 1}` ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Environment Variables Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-32"
          >
            <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-3xl shadow-2xl overflow-hidden">
              <CardContent className="p-12 md:p-20">
                <div className="max-w-3xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest mb-8">
                    <Database className="w-3 h-3" />
                    Environment Configuration
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight mb-6">
                    Configure Your <em className="italic text-primary">Private Instance</em>
                  </h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed mb-12">
                    Customize your self-hosted SnapTools with environment variables. 
                    Control analytics, API endpoints, and feature flags. Full flexibility for power users.
                  </p>

                  <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 md:p-8 text-left font-mono text-sm overflow-x-auto">
                    <div className="text-muted-foreground mb-2"># .env</div>
                    <div><span className="text-blue-500">VITE_APP_TITLE</span>=<span className="text-green-500">"My Private Tools"</span></div>
                    <div><span className="text-blue-500">VITE_DISABLE_ANALYTICS</span>=<span className="text-green-500">true</span></div>
                    <div><span className="text-blue-500">VITE_ENABLE_RAZORPAY</span>=<span className="text-green-500">false</span></div>
                    <div><span className="text-blue-500">VITE_CUSTOM_DOMAIN</span>=<span className="text-green-500">"tools.yourdomain.com"</span></div>
                  </div>

                  <Button
                    size="lg"
                    className="mt-8 h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    onClick={() => {
                      const envExample = `# SnapTools Environment Configuration
VITE_APP_TITLE=My Private Tools
VITE_DISABLE_ANALYTICS=true
VITE_ENABLE_RAZORPAY=false
VITE_CUSTOM_DOMAIN=tools.yourdomain.com`;
                      copyToClipboard(envExample, 'Environment Example');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy .env Example
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="border-0 bg-gradient-to-br from-primary to-primary/80 text-white shadow-2xl overflow-hidden">
              <CardContent className="p-12 md:p-20 text-center relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <Globe className="w-16 h-16 mx-auto mb-8 text-white/80" />
                  <h2 className="text-4xl md:text-5xl font-serif font-black mb-6">
                    Ready to Deploy Your Own?
                  </h2>
                  <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Join thousands of developers who've taken control of their tooling infrastructure. 
                    Open source, privacy-first, and built for the modern web.
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button
                      size="lg"
                      className="h-16 px-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white text-primary hover:bg-white/90 hover:scale-[1.02] transition-all"
                      onClick={() => window.open('https://github.com/iam-sandipmaity/SnapTools', '_blank')}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Star on GitHub
                      <Zap className="w-3 h-3 ml-2" />
                    </Button>
                    
                    <Link to="/tools">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-16 px-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-white/30 text-white hover:bg-white/10"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Tools
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SelfHost;
