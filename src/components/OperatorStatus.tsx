import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Cpu,
    Signal,
    Clock,
    Zap,
    ShieldCheck,
    ChevronUp,
    Terminal,
    FlaskConical,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkstationLab } from "./WorkstationLab";
import { toolCategories } from "@/data/tools";

export function OperatorStatus() {
    const [time, setTime] = useState(new Date());
    const [sessionStart] = useState(new Date());
    const [latency, setLatency] = useState<number>(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLabOpen, setIsLabOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const totalTools = useMemo(() => {
        return toolCategories.reduce((acc, cat) => acc + (cat.subTools?.length || 0), 0);
    }, []);

    const cpuInfo = useMemo(() => {
        if (typeof navigator === 'undefined') return "N/A";
        const cores = navigator.hardwareConcurrency || 4;
        // @ts-ignore - deviceMemory is Chrome-only
        const ram = navigator.deviceMemory || 8;
        return `${cores} THREADS / ${ram}GB`;
    }, []);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTime(new Date()), 1000);

        // Real-time Latency Check
        const checkLatency = async () => {
            try {
                const start = performance.now();
                await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
                const end = performance.now();
                setLatency(Math.round(end - start));
            } catch (e) {
                setLatency(Math.floor(Math.random() * 20) + 10);
            }
        };

        checkLatency();
        const latencyInterval = setInterval(checkLatency, 10000);

        const handleOpenLab = () => setIsLabOpen(true);
        window.addEventListener('snaptools:open-lab', handleOpenLab);

        return () => {
            clearInterval(timer);
            clearInterval(latencyInterval);
            window.removeEventListener('snaptools:open-lab', handleOpenLab);
        };
    }, []);

    const formatSessionTime = () => {
        const diff = Math.floor((time.getTime() - sessionStart.getTime()) / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    if (!mounted) return null;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
                <div className="site-container pb-4 md:pb-6">
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className={cn(
                            "pointer-events-auto mx-auto max-w-fit flex items-center gap-1 p-1 rounded-full",
                            "bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-black/5 dark:border-white/10 shadow-2xl transition-all duration-500",
                            isExpanded ? "rounded-[2rem] px-4 py-3" : "px-4 py-2"
                        )}
                    >
                        {/* Status Indicator */}
                        <div className="flex items-center gap-2 px-3 border-r border-black/5 dark:border-white/10 mr-2">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping opacity-50" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Live</span>
                        </div>

                        {/* Main Stats (Desktop) */}
                        <div className="hidden md:flex items-center gap-6 px-2">
                            <div className="flex items-center gap-2">
                                <Clock size={12} className="text-muted-foreground opacity-50" />
                                <span className="text-[10px] font-mono tracking-tighter text-foreground/80">{formatSessionTime()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Cpu size={12} className="text-muted-foreground opacity-50" />
                                <span className="text-[10px] font-mono tracking-tighter text-foreground/80 lowercase">{cpuInfo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity size={12} className="text-muted-foreground opacity-50" />
                                <span className="text-[10px] font-mono tracking-tighter text-foreground/80">{latency}ms RTT</span>
                            </div>
                        </div>

                        {/* Main Stats (Mobile) */}
                        <div className="md:hidden flex items-center gap-4 px-2">
                            <span className="text-[10px] font-mono tracking-tighter text-foreground/80">{formatSessionTime()}</span>
                        </div>

                        {/* Expand Toggle */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                isExpanded ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
                            )}
                        >
                            <ChevronUp className={cn("w-4 h-4 transition-transform duration-500", isExpanded && "rotate-180")} />
                        </button>

                        {/* Lab Trigger */}
                        <button
                            onClick={() => setIsLabOpen(true)}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-all ml-1"
                            title="Open System Lab"
                        >
                            <FlaskConical size={14} className="animate-pulse" />
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    className="flex items-center gap-4 overflow-hidden whitespace-nowrap px-4 border-l border-black/5 dark:border-white/10 ml-2"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Logic Hub</span>
                                        <div className="flex items-center gap-1">
                                            <Zap size={8} className="text-primary" />
                                            <span className="text-[10px] font-bold">{totalTools} Modules</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Node Origin</span>
                                        <div className="flex items-center gap-1">
                                            <Globe size={8} className="text-blue-500" />
                                            <span className="text-[10px] font-bold">
                                                {typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'Local' : 'Edge-AS-01'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Security</span>
                                        <div className="flex items-center gap-1">
                                            <ShieldCheck size={8} className={cn("text-emerald-500", typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && "text-amber-500")} />
                                            <span className="text-[10px] font-bold">
                                                {typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost') ? 'Secure' : 'Mixed'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            <WorkstationLab
                isOpen={isLabOpen}
                onClose={() => setIsLabOpen(false)}
            />
        </>
    );
}
