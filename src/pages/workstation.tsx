import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Command,
  ExternalLink,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Command className="h-6 w-6 text-primary" />,
    title: "Fast navigation",
    description:
      "Use the command palette, keyboard shortcuts, and focused routing to move around SnapTools quickly.",
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Private by default",
    description:
      "Most tools run directly in the browser so your files stay local to your session and device.",
  },
  {
    icon: <Server className="h-6 w-6 text-primary" />,
    title: "Deploy your own",
    description:
      "Spin up a self-hosted instance when you want full infrastructure control for your team or organization.",
  },
];

const quickLinks = [
  {
    title: "Browse all tools",
    description: "Open the full catalog of utilities for PDF, image, text, and data workflows.",
    to: "/tools",
    icon: <Rocket className="h-5 w-5" />,
    cta: "Open tools",
  },
  {
    title: "Self-host SnapTools",
    description: "Review the setup guide if you want to run SnapTools on your own infrastructure.",
    to: "/self-host",
    icon: <Terminal className="h-5 w-5" />,
    cta: "View guide",
  },
];

const Workstation = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="relative overflow-hidden pt-32 pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[-10%] top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-[-8%] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <section className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-5xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              SnapTools Workstation
            </div>

            <h1 className="max-w-4xl font-serif text-5xl font-black tracking-tight md:text-7xl">
              Your control surface for high-speed browser utilities.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              The workstation is the launch point for SnapTools: jump into the tool catalog,
              open self-hosting docs, and move through the app with the same operator-focused
              shortcuts surfaced across the experience.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/tools">
                <Button size="lg" className="h-14 rounded-2xl px-8 text-[10px] font-black uppercase tracking-[0.25em]">
                  Launch Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link to="/self-host">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-2xl px-8 text-[10px] font-black uppercase tracking-[0.25em]"
                >
                  Self-Host Guide
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
              >
                <Card className="h-full border-primary/10 bg-background/70 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      {feature.icon}
                    </div>
                    <h2 className="text-xl font-bold">{feature.title}</h2>
                    <p className="mt-3 leading-7 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {quickLinks.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + index * 0.08 }}
              >
                <Card className="h-full border-primary/10 bg-primary/[0.03]">
                  <CardContent className="flex h-full flex-col p-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <h2 className="text-2xl font-bold">{item.title}</h2>
                    <p className="mt-3 flex-1 leading-7 text-muted-foreground">{item.description}</p>
                    <Link to={item.to} className="mt-6 inline-flex">
                      <Button variant="ghost" className="px-0 text-[11px] font-black uppercase tracking-[0.22em]">
                        {item.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Workstation;
