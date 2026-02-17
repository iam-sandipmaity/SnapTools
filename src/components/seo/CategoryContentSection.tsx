import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Star, Zap, Users, TrendingUp, Award, Cpu, Command, ShieldCheck, LayoutGrid } from 'lucide-react';


interface CategoryContentSectionProps {
    category: {
        id: string;
        title: string;
        description?: string;
    };
    toolCount: number;
}

/**
 * CategoryContentSection - Generates rich, SEO-optimized content for category pages
 * This component adds 300+ words of visible content to improve SEO rankings
 */
const CategoryContentSection = ({ category, toolCount }: CategoryContentSectionProps) => {
    const currentYear = new Date().getFullYear();

    // Generate category-specific content
    const generateCategoryDescription = () => {
        const categoryName = category.title;
        const categoryId = category.id.toLowerCase();

        if (categoryId.includes('image') || categoryId.includes('photo')) {
            return {
                intro: `Discover an industrial-grade collection of ${categoryName} designed for high-fidelity asset manipulation. Whether you are executing neural image compression, architectural format transformation, or edge-optimized resizing, our suite provides the millisecond-latency performance required for professional deployment.`,
                benefits: [
                    'Lossless neural compression for edge-ready assets',
                    'High-fidelity transformation (JPG, PNG, WebP, AVIF)',
                    'Precise coordinate-based cropping and scaling',
                    'Zero-knowledge local processing environments',
                    'Batch-processing modules for large repositories',
                    'Production-ready optimization for web core vitals',
                ],
                useCases: [
                    'Digital architects optimizing assets for worldwide delivery',
                    'Social ecosystem managers preparing high-fidelity content',
                    'SEO engineers reducing LCP (Largest Contentful Paint) metrics',
                    'Technical designers synthesizing product documentation',
                    'Photographers deploying high-resolution web galleries',
                ],
            };
        } else if (categoryId.includes('pdf')) {
            return {
                intro: `Deploy professional PDF architecture with our specialized ${categoryName}. From modular document merging to precision compression logic, our infrastructure handles mission-critical document processing tasks with absolute fidelity and zero data exposure risk.`,
                benefits: [
                    'Multipartite PDF consolidation and merging',
                    'Modular page extraction and deconstruction',
                    'Industrial-grade compression algorithms',
                    'Enterprise-ready format transformation',
                    'Cryptographic document protection and watermarking',
                    'High-fidelity asset extraction from PDF cores',
                ],
                useCases: [
                    'Corporate architects consolidating technical reports',
                    'Academic researchers merging disparate datasets',
                    'Legal professionals organizing secure case archives',
                    'Operations teams optimizing file-transfer overhead',
                    'Technical writers preparing modular documentation',
                ],
            };
        } else if (categoryId.includes('text')) {
            return {
                intro: `Streamline your content architecture with our high-performance ${categoryName}. Engineered for programmatic text manipulation, these modules provide instant synchronization and transformation logic for technical writers, developers, and digital architects.`,
                benefits: [
                    'Universal case-logic transformation modules',
                    'High-precision character and metadata analysis',
                    'Structural sanitization and whitespace removal',
                    'Pattern-based find and replace algorithms',
                    'Buffer-ready encoding and decoding protocols',
                    'Procedural placeholder text generation',
                ],
                useCases: [
                    'Content architects formatting technical articles',
                    'Engineers sanitizing heterogeneous data inputs',
                    'SEO specialists analyzing structural keyword density',
                    'Developers cleaning documentation and source strings',
                    'Copywriters preparing multi-platform digital assets',
                ],
            };
        } else if (categoryId.includes('code') || categoryId.includes('developer')) {
            return {
                intro: `Boost your development productivity with our essential ${categoryName} ecosystem. From neural syntax highlighting to production-ready minification, these modules are designed to save architects time while reducing structural overhead. All logic is executed within a secure local sandbox.`,
                benefits: [
                    'High-fidelity code formatting and beautification',
                    'Universal validation for JSON, XML, and TOML',
                    'Secure Base64 and URL encoding/decoding',
                    'Modular code snippet and template generation',
                    'Millisecond-latency minification for production',
                    'Universal format translation across data-sets',
                ],
                useCases: [
                    'Web developers architecting and validating codebases',
                    'API engineers testing high-performance JSON schemas',
                    'Frontend architects minifying production assets',
                    'Backend developers encoding secure authentication tokens',
                    'DevOps engineers managing modular configuration files',
                ],
            };
        } else if (categoryId.includes('calculator')) {
            return {
                intro: `Execute mission-critical calculations through our comprehensive ${categoryName} suite. From scientific-grade arithmetic to specialized financial logic-gates, our modules provide high-precision results for architects, engineers, and financial analysts.`,
                benefits: [
                    'Scientific-grade computational logic suites',
                    'High-precision percentage and ratio modules',
                    'Synchronized algebraic and technical equations',
                    'Enterprise financial metrics and interest logic',
                    'Universal unit-translation and measurement modules',
                    'Millisecond-latency result synchronization',
                ],
                useCases: [
                    'Engineering architects solving complex technical models',
                    'Finance professionals auditing returns and interest',
                    'Scientific researchers performing precision calculations',
                    'Strategic planners estimating cost-basis and margins',
                    'Health professionals monitoring physiological metrics',
                ],
            };
        } else if (categoryId.includes('converter') || categoryId.includes('conversion')) {
            return {
                intro: `Transform technical data-sets and file architectures through our high-fidelity ${categoryName}. Supporting a universal array of formats and translation logic, our suite ensures your assets are synchronized exactly as required for production deployment.`,
                benefits: [
                    'Universal conversion across 500+ format pairs',
                    'Zero-loss fidelity during architectural translation',
                    'Batch-processing modules for multi-file groups',
                    'Real-time verification and preview workflows',
                    'No architectural scale limits or restrictions',
                    'High-performance translation throughput',
                ],
                useCases: [
                    'Technical designers converting assets for edge delivery',
                    'Media engineers transforming heterogeneous media',
                    'Operations teams synchronizing disparate documentation',
                    'Developers automating data-set transformation logic',
                    'Content architects preparing multi-format repositories',
                ],
            };
        } else if (categoryId.includes('qr')) {
            return {
                intro: `Synthesize high-fidelity vector QR codes through our specialized ${categoryName}. Engineered for marketing deployment, secure identity management, and contactless synchronization. Generate professional modules with customizable metadata and visual parameters.`,
                benefits: [
                    'Vector-grade QR generation for URLs and text',
                    'Custom architectural branding and visual logic',
                    'High-resolution modules for physical output',
                    'Advanced analytical modules for scan tracking',
                    'Cross-platform deployment in standard formats',
                    'Infinite scan-cycles without expiration logic',
                ],
                useCases: [
                    'Marketing architects deploying campaign-ready modules',
                    'Identity managers creating secure contactless menus',
                    'Event coordinators synthesizing access-gate codes',
                    'Businesses branding professional communication assets',
                    'Retail architects deploying product-information modules',
                ],
            };
        } else if (categoryId.includes('password')) {
            return {
                intro: `Generate entropy-driven, high-security credentials through our ${categoryName} infrastructure. Protect your technical assets with randomly synthesized passphrases that are virtually immune to standard cryptographic collision attempts.`,
                benefits: [
                    'Cryptographically secure entropy generation',
                    'Customizable length and character-set modules',
                    'Human-memorable passphrase synthesis logic',
                    'High-fidelity password strength audit modules',
                    'Batch-generation for enterprise account setups',
                    'Zero-knowledge persistence - No data is stored',
                ],
                useCases: [
                    'System administrators architecting user accounts',
                    'Security architects protecting sensitive infrastructure',
                    'Developers generating secure API keys and tokens',
                    'Compliance teams enforcing entropy-based policies',
                    'Technical users securing personal digital identities',
                ],
            };
        }

        // Default content for other categories
        return {
            intro: `Initialize our comprehensive collection of ${categoryName} designed to optimize your technical workflow. With ${toolCount} high-performance modules at your fingertips, you can achieve professional results with millisecond-latency.`,
            benefits: [
                'Industrial-grade utility with zero deployment cost',
                'No identity verification or registration required',
                'Localized execution within a secure browser sandbox',
                'Cross-platform synchronization across all nodes',
                'High-fidelity results synthesized in milliseconds',
                'Regular architectural updates and module expansions',
            ],
            useCases: [
                'Professional architects streamlining technical workflows',
                'Strategic researchers accelerating assignment completion',
                'Enterprise teams improving operational productivity',
                'Developers architecting and testing complex projects',
                'Content architects producing high-fidelity digital work',
            ],
        };
    };

    const content = generateCategoryDescription();

    return (
        <div className="mt-16 space-y-16 pb-12">
            {/* Decorative Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-sm text-muted-foreground">Explore {category.title}</span>
                </div>
            </div>

            {/* Introduction with Premium Typography */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-3xl p-10 md:p-16 shadow-sm ring-1 ring-black/[0.02]"
            >
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 -z-10"></div>

                <div className="flex flex-col md:flex-row md:items-center gap-8 mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg ring-1 ring-primary/20">
                        <LayoutGrid className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Ecosystem Specification</p>
                        <h2 className="text-4xl md:text-7xl font-serif font-black tracking-tighter leading-tight">
                            Suite <em className="italic font-light text-primary">Overview</em>
                        </h2>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-xl text-muted-foreground/90 leading-relaxed font-medium mb-8">
                            {content.intro}
                        </p>
                        <p className="text-muted-foreground/80 leading-relaxed font-medium">
                            The SnapTools industrial architecture ensures that every module within the {category.title.toLowerCase()}
                            suite operates with extreme precision. Engineered for professional-grade manipulation, our infrastructure
                            prioritizes hardware-level execution and zero-knowledge privacy protocols for all technical operations.
                        </p>
                    </div>
                    <div className="bg-primary/5 rounded-[2.5rem] p-10 border border-primary/10 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-8 flex items-center gap-2">
                            <ShieldCheck size={16} /> Infrastructure Security
                        </h4>
                        <div className="space-y-6">
                            {[
                                { label: "Deployment", value: "Global Edge Network" },
                                { label: "Execution", value: "Client-Side Logic" },
                                { label: "Protocol", value: "Zero-Knowledge" },
                                { label: "Latency", value: "Millisecond-Target" }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-primary/10 pb-4">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-40">{item.label}</span>
                                    <span className="text-sm font-bold text-foreground">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Key Features with Designer Cards */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-4">Core <em className="italic font-light text-primary">Capabilities</em></h2>
                    <p className="text-muted-foreground font-medium">Specialized modules engineered for high-fidelity technical manipulation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {content.benefits.map((benefit, index) => {
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                whileHover={{ y: -6 }}
                                className="group relative p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-500 shadow-sm overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="relative flex flex-col gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                        <Command size={20} />
                                    </div>
                                    <p className="text-base leading-relaxed text-foreground/80 font-bold tracking-tight">{benefit}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            {/* Use Cases with Architectural Layout */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative overflow-hidden rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] backdrop-blur-xl p-10 md:p-16 shadow-sm"
            >
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-5xl font-serif font-black tracking-tight mb-2">Target <em className="italic font-light text-primary">Applications</em></h2>
                        <p className="text-muted-foreground font-medium">Optimized for specialized professional segments.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content.useCases.map((useCase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.05 }}
                            className="flex items-start gap-4 p-6 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-primary/5 transition-all duration-500 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                <Sparkles size={14} />
                            </div>
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium leading-relaxed">{useCase}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Why Choose Us with Premium Architectural CTA */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative overflow-hidden rounded-[3.5rem] bg-black dark:bg-white p-12 md:p-20 shadow-2xl"
            >
                <div className="absolute inset-0 bg-primary/20 blur-[120px] opacity-40 -z-10"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-8 mb-12">
                        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 rotate-12">
                            <Star className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Technical Superiority</p>
                            <h2 className="text-4xl md:text-7xl font-serif font-black tracking-tighter leading-none text-white dark:text-black">
                                Why SnapTools <br /><em className="italic font-light text-primary">{category.title}</em>
                            </h2>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 text-left">
                        <div className="space-y-6">
                            <p className="text-white/80 dark:text-black/80 leading-relaxed text-xl font-medium">
                                Unlike legacy platforms, the SnapTools ecosystem prioritizes architectural integrity and user privacy. All modules within the {category.title.toLowerCase()}
                                suite execute data-manipulation logic locally within your browser's secure sandbox.
                            </p>
                            <p className="text-white/60 dark:text-black/60 leading-relaxed text-lg font-medium">
                                This approach ensures mission-critical security while delivering millisecond-latency results. We are committed to maintaining a high-fidelity,
                                free technical infrastructure without the overhead of registration or proprietary subscriptions.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { badge: "100% Free", icon: CheckCircle2 },
                                { badge: "Privacy First", icon: ShieldCheck },
                                { badge: "Zero Verification", icon: Zap },
                                { badge: `${toolCount}+ Modules`, icon: LayoutGrid }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white/10 dark:bg-black/5 border border-white/10 dark:border-black/10 backdrop-blur-3xl px-6 py-5 rounded-[2rem]">
                                    <item.icon className="w-5 h-5 text-primary" />
                                    <span className="font-black text-[10px] uppercase tracking-widest text-white dark:text-black">{item.badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Getting Started with Architectural Cards */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="relative overflow-hidden rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-3xl p-10 md:p-16 shadow-sm ring-1 ring-black/[0.02]"
            >
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg ring-1 ring-primary/20">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Onboarding Protocol</p>
                        <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter leading-tight">
                            Module <em className="italic font-light text-primary">Access</em>
                        </h2>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    <p className="text-xl text-muted-foreground/90 leading-relaxed font-medium">
                        Initializing your workflow within the {category.title.toLowerCase()} ecosystem is engineered for simplicity.
                        Simply select a module from our comprehensive directory to activate the high-fidelity technical workstation.
                        No registration or identity verification is required for immediate implementation.
                    </p>
                    <p className="text-muted-foreground/80 leading-relaxed font-medium">
                        All modules are architected with a responsive-ready interface, ensuring mission-critical accessibility across
                        all nodes—from high-performance desktop workstations to mobile technical environments. Our infrastructure
                        guarantees structural consistency across all digital touchpoints.
                    </p>
                </div>
            </motion.section>
        </div>
    );
};

export default CategoryContentSection;
