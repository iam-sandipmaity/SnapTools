import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEO from "@/components/seo";
import { motion } from "framer-motion";
import {
    Keyboard,
    Terminal,
    Cpu,
    Zap,
    Monitor,
    BookOpen,
    Moon,
    Command as CommandIcon,
    ChevronRight,
    ShieldCheck,
    Activity
} from "lucide-react";
import AnimatedElement from "@/components/animated-element";

const ShortcutCard = ({ keys, label, description, icon: Icon, delay }: { keys: string[], label: string, description: string, icon: any, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="group p-8 rounded-[2.5rem] bg-white/50 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl"
    >
        <div className="flex items-start justify-between mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Icon size={24} />
            </div>
            <div className="flex gap-1.5">
                {keys.map((k, i) => (
                    <React.Fragment key={i}>
                        <kbd className="min-w-[3rem] h-10 px-3 rounded-xl border border-black/10 dark:border-white/20 bg-muted/50 flex items-center justify-center font-mono text-xs font-black uppercase shadow-sm text-foreground">
                            {k}
                        </kbd>
                        {i < keys.length - 1 && <span className="flex items-center text-xs text-muted-foreground/40">+</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
        <h3 className="text-xl font-bold mb-2 tracking-tight">{label}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
);

const WorkstationPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <SEO
                title="Workstation Operator Console - SnapTools Shortcuts"
                description="Master the SnapTools workstation with professional keyboard shortcuts. Rapid navigation, theme cycling, and ecosystem discovery commands."
            />
            <Header />

            <main className="flex-grow pt-32 pb-24 relative overflow-hidden">
                {/* Background Decorative Rings */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="container max-w-6xl">
                    <header className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[9px] uppercase tracking-widest mb-6">
                            <Terminal className="w-3 h-3" />
                            Operator Console v2.0
                        </div>
                        <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
                            Workstation <br />
                            <em className="italic font-light text-primary">Shortcuts</em>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                            SnapTools is designed for high-performance operators. Use these professional sequences to navigate the ecosystem at command-line speed.
                        </p>
                    </header>

                    {/* Primary Commands */}
                    <section className="mb-24">
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-2xl font-serif font-black tracking-tight">Core System Commands</h2>
                            <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ShortcutCard
                                delay={0.1}
                                icon={CommandIcon}
                                label="Ecosystem Discovery"
                                description="Initialize global search and navigate to any tool or registry node instantly."
                                keys={["Cmd", "K"]}
                            />
                            <ShortcutCard
                                delay={0.2}
                                icon={Keyboard}
                                label="Quick Help"
                                description="Toggle the shortcuts overview overlay from anywhere in the workstation."
                                keys={["?"]}
                            />
                            <ShortcutCard
                                delay={0.3}
                                icon={Moon}
                                label="Cycle Theme Node"
                                description="Transition the interface between Light and Dark operation modes."
                                keys={["Shift", "T"]}
                            />
                            <ShortcutCard
                                delay={0.4}
                                icon={Activity}
                                label="Terminate Module"
                                description="Instantly close any active modal, dialog, or search interface."
                                keys={["Esc"]}
                            />
                        </div>
                    </section>

                    {/* Navigation Sequences */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-2xl font-serif font-black tracking-tight">Navigation Sequences</h2>
                            <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ShortcutCard
                                delay={0.5}
                                icon={Monitor}
                                label="Return to Home"
                                description="Wipe current state and return to the primary workstation landing node."
                                keys={["G", "H"]}
                            />
                            <ShortcutCard
                                delay={0.6}
                                icon={Zap}
                                label="Tool Registry"
                                description="Navigate directly to the comprehensive collection of technical tools."
                                keys={["G", "T"]}
                            />
                            <ShortcutCard
                                delay={0.7}
                                icon={BookOpen}
                                label="Documentation Node"
                                description="Access system documentation and technical guides for SnapTools."
                                keys={["G", "D"]}
                            />
                        </div>
                    </section>

                    {/* Pro Tip */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-24 p-8 rounded-[3rem] bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-8"
                    >
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Cpu size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">High-Performance Operation</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Navigation sequences (starting with 'G') allow for rapid switching without needing to interact with the header menu. This reduces cognitive load and accelerates your technical workflow.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default WorkstationPage;
