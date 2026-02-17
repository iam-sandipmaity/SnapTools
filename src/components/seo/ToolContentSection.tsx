import { motion } from 'framer-motion';
import { CheckCircle2, Shield, Zap, Globe, Lock, Sparkles, ArrowRight, Star, Cpu, ShieldCheck, Workflow, Command } from 'lucide-react';
import { cn } from "@/lib/utils";


interface ToolContentSectionProps {
    tool: {
        id: string;
        name: string;
        description: string;
        category: string;
    };
}

/**
 * ToolContentSection - Generates rich, SEO-optimized content for tool pages
 * Enhanced with premium visual design, gradients, and glassmorphism
 */
const ToolContentSection = ({ tool }: ToolContentSectionProps) => {
    const currentYear = new Date().getFullYear();

    // Generate category-specific benefits
    const generateBenefits = () => {
        const category = tool.category.toLowerCase();
        const toolName = tool.name;

        const commonBenefits = [
            { icon: Zap, text: `Millisecond-latency ${toolName.toLowerCase()} execution`, color: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-orange-500' },
            { icon: ShieldCheck, text: 'Zero-knowledge protocol - Your data never leaves the hardware', color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-cyan-500' },
            { icon: Globe, text: 'Edge-optimized workstation for cross-platform deployment', color: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-500' },
            { icon: Lock, text: 'No identity verification or registration required', color: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-pink-500' },
        ];

        if (category.includes('image') || category.includes('photo')) {
            return [
                ...commonBenefits,
                { icon: Sparkles, text: 'Neural compression algorithms for lossless conversion', color: 'from-indigo-500/20 to-purple-500/20', iconColor: 'text-indigo-500' },
                { icon: Command, text: 'Full support for high-fidelity JPG, PNG, and WebP formats', color: 'from-pink-500/20 to-rose-500/20', iconColor: 'text-rose-500' },
            ];
        } else if (category.includes('pdf')) {
            return [
                ...commonBenefits,
                { icon: Sparkles, text: 'High-fidelity PDF manipulation and page architecture', color: 'from-red-500/20 to-orange-500/20', iconColor: 'text-red-500' },
                { icon: Command, text: 'Handle enterprise-grade PDF documents with millisecond precision', color: 'from-teal-500/20 to-cyan-500/20', iconColor: 'text-teal-500' },
            ];
        } else if (category.includes('text')) {
            return [
                ...commonBenefits,
                { icon: Sparkles, text: 'Instant programmatic text transformation modules', color: 'from-violet-500/20 to-purple-500/20', iconColor: 'text-violet-500' },
                { icon: Command, text: 'Buffer-ready output with single-click synchronization', color: 'from-sky-500/20 to-blue-500/20', iconColor: 'text-sky-500' },
            ];
        } else if (category.includes('code') || category.includes('developer')) {
            return [
                ...commonBenefits,
                { icon: Sparkles, text: 'Neural syntax highlighting across 50+ language definitions', color: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-500' },
                { icon: Command, text: 'Production-ready code formatting and minification logic', color: 'from-amber-500/20 to-yellow-500/20', iconColor: 'text-amber-500' },
            ];
        } else if (category.includes('converter') || category.includes('conversion')) {
            return [
                ...commonBenefits,
                { icon: Sparkles, text: 'Precise base-unit translation and currency synchronization', color: 'from-cyan-500/20 to-blue-500/20', iconColor: 'text-cyan-500' },
                { icon: Command, text: 'Universal conversion modules for technical data sets', color: 'from-fuchsia-500/20 to-pink-500/20', iconColor: 'text-fuchsia-500' },
            ];
        }

        return commonBenefits;
    };

    // Generate how-to steps
    const generateHowToSteps = () => {
        const toolName = tool.name.toLowerCase();
        const category = tool.category.toLowerCase();

        if (category.includes('image')) {
            return [
                `Initialize the ${toolName} engine by uploading your asset or via secure drag-and-drop`,
                `Configure the neural parameters and optimization settings for the ${toolName} module`,
                `Execute the transformation logic to process your image with absolute fidelity`,
                `Download the processed workstation-ready output instantly to your hardware`,
            ];
        } else if (category.includes('pdf')) {
            return [
                `Architect your document workspace by initializing the primary PDF source files`,
                `Deploy the ${toolName} logic to restructure, merge, or compress your technical documents`,
                `Verify the document integrity and synchronize the output parameters`,
                `Execute the final build and download the consolidated PDF architecture`,
            ];
        } else if (category.includes('text')) {
            return [
                `Buffer your source text into the secure local workstation input module`,
                `Invoke the ${toolName} logic to perform the required programmatic transformations`,
                `Synchronize the output buffer and verify the structural accuracy of the text`,
                `Seamlessly copy the transformed string or deploy the output result`,
            ];
        } else if (category.includes('converter')) {
            return [
                `Input your source data or technical file into the ${toolName} translation module`,
                `Specify the target architectural format or base-unit requirements`,
                `Execute the precision conversion logic to synchronize the data sets`,
                `Retrieve the translated output instantly via secure local download`,
            ];
        } else if (category.includes('generator')) {
            return [
                `Initialize the generation sequence by configuring your specialized parameters`,
                `Set the architectural metadata and structural requirements for the ${toolName}`,
                `Invoke the ${toolName} engine to synthesize your technical output`,
                `Securely retrieve the generated result or deploy the output module`,
            ];
        }

        return [
            `Launch the ${toolName} instance from the repository`,
            'Initialize data input via secure local buffer or drag-and-drop',
            'Configure technical parameters for specialized logic execution',
            'Download your processed architecture results instantly',
        ];
    };

    // Generate use cases
    const generateUseCases = () => {
        const category = tool.category.toLowerCase();
        const toolName = tool.name;

        if (category.includes('image')) {
            return [
                `Optimizing high-fidelity assets for millisecond-latency website performance`,
                `Preparing professional visual content for worldwide digital deployment`,
                `Reducing storage overhead for enterprise-grade asset management systems`,
                `Architecting thumbnails and preview assets for technical documentation`,
                `Batch processing large-scale image repositories with neural precision`,
            ];
        } else if (category.includes('pdf')) {
            return [
                'Consolidating multi-segmented technical reports into unified PDF architectures',
                'Compressing enterprise-grade documents for secure electronic transfer',
                'Transforming cross-platform documentation into standardized PDF formats',
                'Deconstructing monolithic PDF files into modular architectural segments',
                'Preparing high-fidelity documents for archival and professional distribution',
            ];
        } else if (category.includes('text')) {
            return [
                'Formatting technical strings for standardized content delivery systems',
                'Sanitizing source text from heterogeneous architectural inputs',
                'Transforming case-logic for consistency across professional documentation',
                'Generating precise metadata metrics for large-scale content analysis',
                'Preparing string-buffer assets for social and digital publication',
            ];
        } else if (category.includes('code')) {
            return [
                'Beautifying technical source-code for high-readability architectural review',
                'Validating data-exchange formats including JSON, XML, and TOML',
                'Encoding binary assets into transport-ready Base64 architectures',
                'Synthesizing boilerplate code snippets and modular templates',
                'Executing millisecond-latency minification for production deployment',
            ];
        } else if (category.includes('calculator')) {
            return [
                'Executing complex computational logic for professional analysis',
                'Monitoring physiological metrics with scientific-grade precision',
                'Synchronizing financial logic-gates for investment and tax auditing',
                'Translating technical measurements across universal base-units',
                'Synthesizing budgetary projections with high-accuracy financial modules',
            ];
        } else if (category.includes('qr')) {
            return [
                'Generating high-fidelity vector QR codes for physical marketing deployment',
                'Synthesizing cryptographic QR keys for secure identity management',
                'Architecting scan-ready modules for event registration architectures',
                'Deploying contactless interface modules for hospitality environments',
                'Generating secure WiFi synchronization codes for network infrastructure',
            ];
        }

        return [
            `Use ${toolName} for professional projects`,
            `Apply ${toolName} for personal tasks`,
            `Integrate ${toolName} into your workflow`,
            `Save time with automated ${toolName.toLowerCase()}`,
            `Improve productivity with ${toolName}`,
        ];
    };

    // Generate FAQ content
    const generateFAQs = () => {
        const toolName = tool.name;
        const category = tool.category.toLowerCase();

        const commonFAQs = [
            {
                question: `Is the ${toolName} module truly free for industrial use?`,
                answer: `Yes. This workstation-grade ${toolName} logic is provided with zero deployment costs. We maintain these mission-critical modules under a community-access protocol, ensuring high-fidelity technical manipulation remains accessible to everyone.`,
            },
            {
                question: `Does the ${toolName} engine store my technical assets?`,
                answer: `Negative. All processing occurs within your hardware's local kernel buffer. We employ a zero-knowledge architecture, meaning your data never leaves the workstation's secure sandbox and is purged immediately upon session termination.`,
            },
            {
                question: `What are the hardware requirements for this module?`,
                answer: `Our architecture is optimized for millisecond-latency performance across all modern nodes. As a browser-based technical workstation, it requires only a standard JavaScript-compliant environment for high-speed execution.`,
            },
        ];

        if (category.includes('image')) {
            return [
                ...commonFAQs,
                {
                    question: `Is the neural compression for ${toolName} truly lossless?`,
                    answer: `Our ${toolName} engine uses advanced neural algorithms to synchronize file-size reduction with visual fidelity. Depending on the configuration, you can achieve significant structural consolidation while maintaining industrial-grade clarity.`,
                },
                {
                    question: `Which architectural image formats are supported?`,
                    answer: `The module handles a universal range of high-fidelity assets, including modernized formats like WebP and AVIF, alongside standard JPG and PNG specifications.`,
                },
            ];
        } else if (category.includes('pdf')) {
            return [
                ...commonFAQs,
                {
                    question: `Will the PDF consolidation preserve document integrity?`,
                    answer: `Absolutely. The ${toolName} logic is engineered for multipartite consolidation without deconstructing internal structural metadata or reducing text-layer fidelity.`,
                },
                {
                    question: `Can I deconstruct secured PDF architectures?`,
                    answer: `Yes, provided you have the cryptographic clearance (password) for the document. The module can process encrypted assets within the local workstation sandbox.`,
                },
            ];
        } else if (category.includes('text')) {
            return [
                ...commonFAQs,
                {
                    question: `Can the ${toolName} handle large-scale string buffers?`,
                    answer: `The workstation is architected to process massive text blocks with millisecond-latency, utilizing local hardware acceleration for rapid transformation sequences.`,
                },
                {
                    question: `Does this module support universal character sets?`,
                    answer: `Yes. Our technical workstation supports the full UTF-8 specification, ensuring accurate synchronization across heterogeneous international data-sets.`,
                },
            ];
        }

        return commonFAQs;
    };

    const benefits = generateBenefits();
    const howToSteps = generateHowToSteps();
    const useCases = generateUseCases();
    const faqs = generateFAQs();

    return (
        <div className="mt-16 space-y-16 pb-8">
            {/* Decorative Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-sm text-muted-foreground">Learn More About {tool.name}</span>
                </div>
            </div>

            {/* About Section with Premium Typography */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-3xl p-10 md:p-16 shadow-sm ring-1 ring-black/[0.02]"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/3 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 -z-10"></div>

                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg ring-1 ring-primary/20">
                        <Cpu className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Technical Specification</p>
                        <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter leading-tight">
                            Module <em className="italic font-light text-primary">Architecture</em>
                        </h2>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-xl text-muted-foreground/90 leading-relaxed font-medium mb-6">
                            {tool.name} is architected as a high-fidelity technical workstation designed to {tool.description.toLowerCase()}.
                            Engineered for millisecond-latency performance, this module operates within a zero-knowledge local environment.
                        </p>
                        <p className="text-muted-foreground/80 leading-relaxed font-medium">
                            In the modern digital landscape, the requirement for professional manipulation logic is paramount. {tool.name}
                            synchronizes advanced algorithms with user-centric design principles, ensuring that your technical assets are
                            processed with absolute precision and zero data exposure risk.
                        </p>
                    </div>
                    <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 backdrop-blur-md">
                        <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                            <ShieldCheck size={16} /> Secure Protocol Status
                        </h4>
                        <ul className="space-y-4">
                            {[
                                "Zero-knowledge encryption layer",
                                "Hardware-accelerated local execution",
                                "Zero server-side persistence",
                                "Anonymous session architecture"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.section>

            {/* Key Benefits with Premium Cards */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-4">Elite <em className="italic font-light text-primary">Advantages</em></h2>
                    <p className="text-muted-foreground font-medium">Technical superiority delivered through localized processing modules.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                whileHover={{ y: -4 }}
                                className="group relative p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-500 shadow-sm overflow-hidden"
                            >
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-700", benefit.color)} />
                                <div className="relative flex items-center gap-6">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 bg-white/50 dark:bg-white/[0.05]", benefit.iconColor)}>
                                        <Icon size={24} />
                                    </div>
                                    <p className="text-base leading-relaxed text-foreground/80 font-bold tracking-tight">{benefit.text}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            {/* How to Use with Workflow Cards */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative py-20 border-y border-black/5 dark:border-white/5"
            >
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-4">Operational <em className="italic font-light text-primary">Workflow</em></h2>
                    <p className="text-muted-foreground font-medium leading-relaxed">Systematic execution steps for optimized module interaction.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {howToSteps.slice(0, 4).map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ y: -8 }}
                            className="relative p-8 rounded-[2rem] bg-white/30 dark:bg-white/[0.01] border border-black/5 dark:border-white/5 shadow-sm group hover:bg-white dark:hover:bg-white/[0.03] duration-500 transition-all"
                        >
                            <div className="text-5xl font-serif font-black text-primary/10 mb-6 group-hover:text-primary/20 transition-colors">
                                0{index + 1}
                            </div>
                            <p className="text-sm font-bold text-foreground/80 leading-relaxed tracking-tight group-hover:text-foreground transition-colors">{step}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Use Cases with Modern List */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative overflow-hidden rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-3xl p-10 md:p-16 shadow-sm ring-1 ring-black/[0.02]"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent"></div>

                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg ring-1 ring-primary/20">
                        <Workflow className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Operational Scope</p>
                        <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter leading-tight">
                            Industrial <br /><em className="italic font-light text-primary">Applications</em>
                        </h2>
                    </div>
                </div>

                <p className="text-muted-foreground/80 mb-10 text-lg font-medium leading-relaxed">
                    The {tool.name.toLowerCase()} architecture is versatile and engineered for diverse technical scenarios:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {useCases.map((useCase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.05 }}
                            className="flex items-start gap-5 p-6 rounded-3xl bg-white/30 dark:bg-white/[0.01] border border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/[0.03] transition-all duration-500 shadow-sm"
                        >
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-muted-foreground font-bold tracking-tight leading-relaxed">{useCase}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* FAQ Section with Accordion Style */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-4">Technical <em className="italic font-light text-primary">Documentation</em></h2>
                    <p className="text-muted-foreground font-medium">Frequently asked questions regarding module execution and architecture.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                            className="group relative overflow-hidden rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] p-8 shadow-sm transition-all duration-500 hover:bg-white dark:hover:bg-white/[0.04]"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-all duration-500"></div>
                            <h3 className="font-serif font-black text-xl mb-4 pl-4 text-foreground/90">{faq.question}</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed pl-4">{faq.answer}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Final CTA with Premium Gradient */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="relative overflow-hidden rounded-[3.5rem] bg-black dark:bg-white p-12 md:p-20 text-center shadow-2xl"
            >
                <div className="absolute inset-0 bg-primary/20 blur-[120px] opacity-40 -z-10"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 mb-10 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 rotate-12 group-hover:rotate-0 transition-transform duration-700"
                    >
                        <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>

                    <h2 className="text-4xl md:text-7xl font-serif font-black tracking-tighter mb-6 text-white dark:text-black leading-none">
                        Initialize Your <br /><em className="italic font-light text-primary">Workstation</em>
                    </h2>
                    <p className="text-white/60 dark:text-black/60 max-w-2xl mx-auto mb-12 text-xl font-medium leading-relaxed">
                        Join millions of digital architects who trust the {tool.name} module for mission-critical operations.
                        Experience the precision of high-fidelity manipulation today.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            "Workstation Grade",
                            "Zero Verification",
                            "Mission Critical",
                            "Edge Optimized"
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/10 dark:bg-black/5 border border-white/10 dark:border-black/10 backdrop-blur-xl px-6 py-3 rounded-2xl">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span className="font-black text-[10px] uppercase tracking-widest text-white dark:text-black">{badge}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default ToolContentSection;
