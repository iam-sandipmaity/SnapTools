import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
    Sparkles,
    PlusCircle,
    Bug,
    ChevronRight,
    Rocket,
    Calendar,
    History,
    Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const changelogData = [
    {
        version: "0.3.0",
        date: "May 1, 2026",
        title: "Self-Host and PDF Workstation Update",
        description: "This release combined UI and sharing improvements with the new self-hosting messaging pass and the upgraded EmbedPDF-based PDF workstation that landed on the feature/self-host branch.",
        items: [
            { type: "improved", text: "UI updates and theme color refinements across the SnapTools experience." },
            { type: "new", text: "Text sharing improvements and a refreshed file sharing flow with updated logic and interface changes." },
            { type: "new", text: "ETH Validation Checker added to the tool collection." },
            { type: "improved", text: "Self-hosting documentation, privacy messaging, and deployment guidance were clarified for more accurate infrastructure expectations." },
            { type: "new", text: "The PDF Viewer was upgraded to EmbedPDF with richer editing capabilities, broader annotation tooling, and edited-document export support." },
            { type: "new", text: "Standalone PDF Encryption and PDF Decryption flows were added for direct upload, password protection, password removal, and local downloads." },
            { type: "fixed", text: "PDF password-removal exports were hardened to rebuild fresh unlocked files and tolerate malformed source metadata during decrypt workflows." }
        ]
    },
    {
        version: "0.2.0",
        date: "February 23, 2026",
        title: "The Tool Catalog Expansion",
        description: "A large feature release that expanded SnapTools across sharing, PDF, finance, date, media, business, AI, UI, and Open Graph improvements, matching the official v0.2.0 release notes.",
        items: [
            { type: "new", text: "Major tool additions across sharing, PDF, finance, date, SEO, media, business, and AI categories." },
            { type: "improved", text: "Open Graph generation and OG image handling were expanded through multiple iterations and UI updates." },
            { type: "improved", text: "Contact, privacy, terms, navbar, fonts, and broader interface polish landed across the site." },
            { type: "new", text: "Contributor-facing updates and package support for API-based OG generation were added." },
            { type: "fixed", text: "Deployment issues and crypto polyfill compatibility problems were addressed during the release cycle." },
            { type: "improved", text: "Encryption-related tooling received another round of updates near the end of the release." }
        ]
    },
    {
        version: "0.1.0",
        date: "December 25, 2025",
        title: "Initial Infrastructure Launch",
        description: "The inception of the SnapTools technical directory with legacy browser-based processing modules.",
        items: [
            { type: "new", text: "Alpha deployment of core PDF, Image, and Conversion logic." },
            { type: "new", text: "First-generation 'Super Tools' utility collection." },
            { type: "improved", text: "Basic client-side sandbox execution for privacy-first tool usage." }
        ]
    }
];

const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "new": return <PlusCircle className="w-4 h-4 text-emerald-500" />;
        case "improved": return <Sparkles className="w-4 h-4 text-blue-500" />;
        case "fixed": return <Bug className="w-4 h-4 text-rose-500" />;
        default: return null;
    }
};

const TypeBadge = ({ type }: { type: string }) => {
    switch (type) {
        case "new":
            return (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-2 py-0 text-[10px] uppercase tracking-wider font-bold">
                    New
                </Badge>
            );
        case "improved":
            return (
                <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none px-2 py-0 text-[10px] uppercase tracking-wider font-bold">
                    Improved
                </Badge>
            );
        case "fixed":
            return (
                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none px-2 py-0 text-[10px] uppercase tracking-wider font-bold">
                    Fixed
                </Badge>
            );
        default: return null;
    }
};

const Changelog = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
            <Header />

            <main className="flex-1 pt-32 pb-20 px-6 overflow-hidden relative">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none opacity-20 dark:opacity-10">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-40 right-10 w-80 h-80 bg-blue-400/20 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto relative">
                    {/* Page Header */}
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
                            <History className="w-3 h-3" />
                            History of Evolution
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                            Changelog
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            We're constantly iterating and shipping new features. Here's a look at everything we've improved to help you build better.
                        </p>
                    </div>

                    {/* Timeline Wrapper */}
                    <div className="relative space-y-20">
                        {/* The line that runs through the timeline */}
                        <div className="absolute left-[13px] sm:left-1/2 top-4 bottom-0 w-[1px] bg-border sm:-translate-x-1/2 hidden md:block" />

                        {changelogData.map((release, releaseIdx) => (
                            <div
                                key={release.version}
                                className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${releaseIdx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                    }`}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-0 top-1.5 md:left-1/2 md:-translate-x-1/2 z-20 hidden md:block">
                                    <div className="w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                                    </div>
                                </div>

                                {/* Date / Version (Side) */}
                                <div className="w-full md:w-1/2 flex items-start md:px-12 md:pt-1">
                                    <div className={`flex flex-col gap-1 ${releaseIdx % 2 === 0 ? "md:text-right md:items-end w-full" : "md:text-left md:items-start w-full"
                                        }`}>
                                        <div className="text-primary font-bold tracking-tighter text-lg">v{release.version}</div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {release.date}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className="w-full md:w-1/2 md:px-12">
                                    <div className="group relative bg-muted/40 dark:bg-white/[0.025] hover:bg-muted/60 dark:hover:bg-white/[0.05] border border-border rounded-3xl p-8 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/5">
                                        <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">
                                            {release.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                                            {release.description}
                                        </p>

                                        <ul className="space-y-4">
                                            {release.items.map((item, itemIdx) => (
                                                <li key={itemIdx} className="flex gap-4 group/item">
                                                    <div className="mt-1 shrink-0 bg-background rounded-full p-1.5 border border-border shadow-sm group-hover/item:border-primary/30 transition-colors">
                                                        <TypeIcon type={item.type} />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <TypeBadge type={item.type} />
                                                        </div>
                                                        <span className="text-sm leading-relaxed text-foreground/80">
                                                            {item.text}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Decorative arrow indicating focus */}
                                        <div className={`absolute top-8 pointer-events-none hidden md:block ${releaseIdx % 2 === 0 ? "-left-3 rotate-180" : "-right-3"
                                            }`}>
                                            <div className="w-6 h-6 bg-muted/40 dark:bg-[#0d0e12] border-r border-t border-border rotate-45" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Info: Architectural CTA */}
                    <div className="mt-40 text-center p-12 md:p-20 rounded-[3rem] bg-gradient-to-b from-primary/[0.03] to-transparent border border-primary/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />

                        <Rocket className="w-12 h-12 text-primary mx-auto mb-8 animate-pulse" />

                        <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter mb-6 leading-[0.9]">
                            Want to see <br />
                            <em className="italic font-light text-primary">more?</em>
                        </h2>

                        <p className="text-lg md:text-xl text-muted-foreground/80 mb-12 max-w-xl mx-auto leading-relaxed font-medium">
                            We're building the most comprehensive technical workstation. <br className="hidden md:block" />
                            Architectural suggestions are always prioritized.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => window.location.href = '/contact'}
                                className="h-16 px-10 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:scale-[1.02] transition-all hover:shadow-primary/20 flex items-center gap-3"
                            >
                                <PlusCircle size={16} />
                                Request Module
                            </button>
                            <button
                                onClick={() => window.location.href = '/tools'}
                                className="h-16 px-10 bg-white dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-foreground font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/[0.1] transition-all flex items-center gap-3"
                            >
                                Explorer Suite
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Changelog;
