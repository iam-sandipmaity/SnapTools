import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Keyboard,
    Terminal,
    Command as CommandIcon,
    Zap,
    Type,
    Monitor,
    BookOpen,
    Moon,
    Sun,
    X,
    Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ShortcutsOverlay() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            // 1. ? key (Shift + /)
            if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
                setOpen((prev) => !prev);
            }

            // 2. Shift + T (Theme cycle)
            if (e.key === "T" && e.shiftKey) {
                setTheme(theme === "dark" ? "light" : "dark");
            }

            // 3. Navigation Sequences (G then H/T/D)
            const newKeys = [...keys, e.key.toLowerCase()].slice(-2);
            setKeys(newKeys);

            if (newKeys[0] === "g") {
                if (newKeys[1] === "h") navigate("/");
                if (newKeys[1] === "t") navigate("/tools");
                if (newKeys[1] === "d") navigate("/documentation");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [theme, keys, navigate, setTheme]);

    const ShortcutRow = ({ keys, label, icon: Icon }: { keys: string[], label: string, icon: any }) => (
        <div className="flex items-center justify-between py-4 border-b border-black/5 dark:border-white/5 last:border-0">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/60">
                    <Icon size={16} />
                </div>
                <span className="text-sm font-medium tracking-tight text-foreground/80">{label}</span>
            </div>
            <div className="flex gap-1.5">
                {keys.map((k, i) => (
                    <React.Fragment key={i}>
                        <kbd className="min-w-[2.5rem] h-8 px-2 rounded-lg border border-black/10 dark:border-white/20 bg-muted/50 flex items-center justify-center font-mono text-[11px] font-black uppercase shadow-sm">
                            {k}
                        </kbd>
                        {i < keys.length - 1 && <span className="flex items-center text-[10px] text-muted-foreground/40">+</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Centered DialogContent */}
            <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[3rem] border-black/5 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-white/95 dark:bg-black/95 backdrop-blur-3xl">
                <div className="p-8 border-b border-black/5 dark:border-white/5 bg-primary/[0.02]">
                    <DialogTitle className="flex items-center gap-3 text-3xl font-serif font-black tracking-tighter mb-2">
                        <Cpu className="text-primary w-8 h-8" />
                        System <em className="italic font-light">Shortcuts</em>
                    </DialogTitle>
                    <DialogDescription className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                        Workstation Operator Console v2.0
                    </DialogDescription>
                </div>

                <div className="p-8">
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Core Commands</h4>
                        <ShortcutRow icon={SearchIcon} label="Ecosystem Discovery" keys={["Cmd", "K"]} />
                        <ShortcutRow icon={Keyboard} label="Shortcut Documentation" keys={["?"]} />
                        <ShortcutRow icon={Moon} label="Cycle Theme Node" keys={["Shift", "T"]} />
                        <ShortcutRow icon={X} label="Close Active Module" keys={["ESC"]} />
                    </div>

                    <div className="mt-10 space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Navigation Sequences</h4>
                        <ShortcutRow icon={Monitor} label="Home Ecosystem" keys={["G", "H"]} />
                        <ShortcutRow icon={Zap} label="Tool Repository" keys={["G", "T"]} />
                        <ShortcutRow icon={BookOpen} label="Documentation Node" keys={["G", "D"]} />
                    </div>
                </div>

                <div className="px-8 py-4 bg-muted/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal size={12} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Terminal Ready</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Secure Connection Established</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Internal Helper for Search Icon to avoid import conflicts or use simple Lucide
const SearchIcon = ({ size }: { size: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);
