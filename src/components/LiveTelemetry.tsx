import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Globe, Cpu, Activity } from "lucide-react";

export function LiveTelemetry() {
    const [latency, setLatency] = useState(24);
    const [activeNode, setActiveNode] = useState("US-EAST-1");
    const [uptime, setUptime] = useState(99.99);
    const [tickerIndex, setTickerIndex] = useState(0);

    const tickerMessages = [
        "NODE_SYNC: OPERATIONAL",
        "ENCRYPTION: AES-256-GCM",
        "LOAD_BALANCER: STABLE",
        "EDGE_CACHE: 94% HIT RATE",
        "PROTOCOL: HTTP/3 ENABLED",
        "SECURITY_SHIELD: ACTIVE"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuate latency
            setLatency(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                return Math.max(12, Math.min(48, prev + change));
            });

            // Update ticker
            setTickerIndex(prev => (prev + 1) % tickerMessages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 px-4 py-2 rounded-full bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 backdrop-blur-sm">
            {/* Node Status */}
            <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Node Online</span>
            </div>

            {/* Latency */}
            <div className="hidden sm:flex items-center gap-1.5 border-l border-black/10 dark:border-white/10 pl-4 md:pl-8">
                <Zap size={10} className="text-muted-foreground/40" />
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Latency:</span>
                <span className="text-[9px] font-mono font-black text-foreground/80">{latency}ms</span>
            </div>

            {/* Region */}
            <div className="hidden md:flex items-center gap-1.5 border-l border-black/10 dark:border-white/10 pl-8">
                <Globe size={10} className="text-muted-foreground/40" />
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Origin:</span>
                <span className="text-[9px] font-mono font-black text-foreground/80">{activeNode}</span>
            </div>

            {/* Ticker */}
            <div className="flex items-center gap-1.5 border-l border-black/10 dark:border-white/10 pl-4 md:pl-8 min-w-[140px]">
                <Activity size={10} className="text-primary/60" />
                <AnimatePresence mode="wait">
                    <motion.span
                        key={tickerIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[9px] font-mono font-black text-primary/80 whitespace-nowrap"
                    >
                        {tickerMessages[tickerIndex]}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* Uptime */}
            <div className="hidden lg:flex items-center gap-1.5 border-l border-black/10 dark:border-white/10 pl-8">
                <Cpu size={10} className="text-muted-foreground/40" />
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">SLA:</span>
                <span className="text-[9px] font-mono font-black text-green-500/80">{uptime}%</span>
            </div>
        </div>
    );
}
