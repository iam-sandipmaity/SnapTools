import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Terminal, ShieldCheck, Zap } from "lucide-react";

export function SystemDiagnosticLoader() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 1200); // Total duration slightly longer for the full sequence

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden cursor-wait"
                >
                    {/* Vertical Scan Line */}
                    <motion.div
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ duration: 0.8, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] bg-primary/40 shadow-[0_0_20px_rgba(var(--primary),0.5)] z-10"
                    />

                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />

                    <div className="relative flex flex-col items-center gap-8 max-w-sm w-full px-6">
                        {/* Core Icon */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
                        >
                            <Cpu size={40} className="animate-pulse" />
                        </motion.div>

                        {/* Diagnostic Logs */}
                        <div className="w-full space-y-3">
                            <DiagnosticLine delay={0.1} label="Node Connection" status="STABLE" icon={Zap} />
                            <DiagnosticLine delay={0.25} label="Registry Modules" status="SYNCED" icon={Terminal} />
                            <DiagnosticLine delay={0.4} label="Privacy Protocols" status="STRICT" icon={ShieldCheck} />
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="h-full bg-primary"
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/40"
                        >
                            Initializing Workstation Interface
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function DiagnosticLine({ label, status, icon: Icon, delay }: { label: string; status: string; icon: any; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="flex items-center justify-between text-[11px] font-mono tracking-tight"
        >
            <div className="flex items-center gap-2 text-white/40">
                <Icon size={12} />
                <span>{label}</span>
            </div>
            <span className="text-primary font-black">{status}</span>
        </motion.div>
    );
}
