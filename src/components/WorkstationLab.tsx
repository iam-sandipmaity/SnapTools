import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Settings2,
    Volume2,
    VolumeX,
    Grid3X3,
    Zap,
    Monitor,
    MousePointer2,
    FlaskConical
} from "lucide-react";
import { useWorkstationSettings } from "@/hooks/use-workstation-settings";
import { getSessionLog } from "@/lib/analytics";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkstationLabProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WorkstationLab({ isOpen, onClose }: WorkstationLabProps) {
    const { settings, updateSetting } = useWorkstationSettings();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[110]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white/90 dark:bg-black/95 backdrop-blur-3xl border-l border-black/5 dark:border-white/10 z-[120] shadow-2xl p-8 overflow-y-auto pointer-events-auto"
                    >
                        <header className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <FlaskConical size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-serif font-black tracking-tight">System Lab</h2>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Experimentation Module</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X size={20} />
                            </Button>
                        </header>

                        <div className="space-y-10">
                            {/* Sound Section */}
                            <section className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold flex items-center gap-2">
                                            {settings.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                                            Acoustic Feedback
                                        </Label>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">System-generated blips for mechanical confirmation.</p>
                                    </div>
                                    <Switch
                                        checked={settings.soundEnabled}
                                        onCheckedChange={(val) => updateSetting('soundEnabled', val)}
                                    />
                                </div>
                            </section>

                            <div className="h-px bg-black/5 dark:bg-white/5" />

                            {/* Aesthetics Section */}
                            <section className="space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Atmospheric Logic</h3>

                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold flex items-center gap-2">
                                            <Grid3X3 size={14} />
                                            Structural Grid
                                        </Label>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">Display interactive layout guides in the background.</p>
                                    </div>
                                    <Switch
                                        checked={settings.gridEnabled}
                                        onCheckedChange={(val) => updateSetting('gridEnabled', val)}
                                    />
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold flex items-center gap-2">
                                            <Zap size={14} />
                                            Ambient Glow
                                        </Label>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">Dynamic lighting based on mouse movement.</p>
                                    </div>
                                    <Switch
                                        checked={settings.ambientGlow}
                                        onCheckedChange={(val) => updateSetting('ambientGlow', val)}
                                    />
                                </div>
                            </section>

                            <div className="h-px bg-black/5 dark:bg-white/5" />

                            {/* theme Section */}
                            <section className="space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Interface Configuration</h3>

                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'modern', label: 'Modern', icon: Monitor },
                                        { id: 'cyber', label: 'Cyber', icon: FlaskConical },
                                        { id: 'minimal', label: 'Lite', icon: MousePointer2 }
                                    ].map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => updateSetting('terminalTheme', theme.id as any)}
                                            className={cn(
                                                "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                                                settings.terminalTheme === theme.id
                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                    : "bg-white/50 dark:bg-white/[0.02] border-black/5 dark:border-white/10 text-muted-foreground hover:border-primary/20"
                                            )}
                                        >
                                            <theme.icon size={16} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{theme.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <div className="h-px bg-black/5 dark:bg-white/5" />

                            {/* Activity Log */}
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Session activity</h3>
                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {getSessionLog().length > 0 ? (
                                        getSessionLog().map((log, i) => (
                                            <div key={i} className="flex items-center justify-between text-[10px] font-mono p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                                <span className="text-primary font-bold">{log.type}</span>
                                                <span className="opacity-40">{log.timestamp}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-muted-foreground italic text-center py-4">No activity recorded yet.</p>
                                    )}
                                </div>
                            </section>
                        </div>

                        <footer className="mt-20 pt-10 border-t border-black/5 dark:border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-center text-muted-foreground/40 leading-relaxed">
                                System Lab v1.0.4 <br />
                                Configuration persists in local browser vault.
                            </p>
                        </footer>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
