import { motion } from 'framer-motion';
import { CheckCircle2, Shield, Zap, Globe, Lock, Sparkles, ArrowRight, Star } from 'lucide-react';

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
            { icon: Zap, text: `Lightning-fast ${toolName.toLowerCase()} processing`, color: 'from-yellow-500 to-orange-500' },
            { icon: Shield, text: 'Your data never leaves your browser - 100% private', color: 'from-blue-500 to-cyan-500' },
            { icon: Globe, text: 'Works on any device - desktop, tablet, or mobile', color: 'from-green-500 to-emerald-500' },
            { icon: Lock, text: 'No registration or signup required', color: 'from-purple-500 to-pink-500' },
        ];

        if (category.includes('image') || category.includes('photo')) {
            return [
                ...commonBenefits,
                { icon: Sparkles, text: 'Preserve image quality with advanced algorithms', color: 'from-indigo-500 to-purple-500' },
                { icon: CheckCircle2, text: 'Support for JPG, PNG, WebP, and more formats', color: 'from-pink-500 to-rose-500' },
            ];
        } else if (category.includes('pdf')) {
            return [
                ...commonBenefits,
                { icon: Sparkles, text: 'Maintain document formatting and quality', color: 'from-red-500 to-orange-500' },
                { icon: CheckCircle2, text: 'Handle large PDF files with ease', color: 'from-teal-500 to-cyan-500' },
            ];
        } else if (category.includes('text')) {
            return [
                ...commonBenefits,
                { icon: Sparkles, text: 'Instant text processing and transformation', color: 'from-violet-500 to-purple-500' },
                { icon: CheckCircle2, text: 'Copy results with a single click', color: 'from-sky-500 to-blue-500' },
            ];
        } else if (category.includes('code') || category.includes('developer')) {
            return [
                ...commonBenefits,
                { icon: Sparkles, text: 'Syntax highlighting and formatting', color: 'from-emerald-500 to-green-500' },
                { icon: CheckCircle2, text: 'Support for multiple programming languages', color: 'from-amber-500 to-yellow-500' },
            ];
        } else if (category.includes('converter') || category.includes('conversion')) {
            return [
                ...commonBenefits,
                { icon: Sparkles, text: 'Accurate conversion with precision', color: 'from-cyan-500 to-blue-500' },
                { icon: CheckCircle2, text: 'Multiple format support', color: 'from-fuchsia-500 to-pink-500' },
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
                'Upload your image file or drag and drop it into the tool',
                `Select your desired ${toolName} settings and options`,
                'Click the process button to apply the transformation',
                'Download your optimized image instantly',
            ];
        } else if (category.includes('pdf')) {
            return [
                'Upload your PDF file(s) to the tool',
                `Choose your ${toolName} preferences`,
                'Process your document with a single click',
                'Download the result immediately',
            ];
        } else if (category.includes('text')) {
            return [
                'Paste or type your text into the input area',
                `Select the ${toolName} operation you need`,
                'Click the button to process your text',
                'Copy or download the results',
            ];
        } else if (category.includes('converter')) {
            return [
                'Input your data or upload your file',
                'Select the target format or unit',
                'Click convert to transform your data',
                'Get instant results you can use right away',
            ];
        } else if (category.includes('generator')) {
            return [
                'Configure your generation preferences',
                `Set the parameters for your ${toolName}`,
                'Click generate to create your output',
                'Copy, download, or use your generated result',
            ];
        }

        return [
            `Open the ${toolName} tool`,
            'Input your data or upload your file',
            'Configure any necessary settings',
            'Process and download your results',
        ];
    };

    // Generate use cases
    const generateUseCases = () => {
        const category = tool.category.toLowerCase();
        const toolName = tool.name;

        if (category.includes('image')) {
            return [
                'Optimize images for faster website loading',
                'Prepare photos for social media posting',
                'Reduce file sizes for email attachments',
                'Create thumbnails for blogs and articles',
                'Batch process multiple images at once',
            ];
        } else if (category.includes('pdf')) {
            return [
                'Merge multiple documents into one PDF',
                'Compress large PDF files for sharing',
                'Convert documents to PDF format',
                'Split large PDFs into smaller files',
                'Prepare documents for printing or archiving',
            ];
        } else if (category.includes('text')) {
            return [
                'Format text for blog posts and articles',
                'Clean up copied text from various sources',
                'Transform text case for consistency',
                'Count words and characters for content writing',
                'Prepare text for social media posts',
            ];
        } else if (category.includes('code')) {
            return [
                'Format and beautify code for readability',
                'Validate JSON, XML, or other data formats',
                'Encode or decode data for web development',
                'Generate code snippets and templates',
                'Debug and test code transformations',
            ];
        } else if (category.includes('calculator')) {
            return [
                'Perform quick calculations for work or study',
                'Calculate percentages and ratios',
                'Solve mathematical equations',
                'Convert between different units',
                'Estimate costs and budgets',
            ];
        } else if (category.includes('qr')) {
            return [
                'Create QR codes for business cards',
                'Generate codes for marketing campaigns',
                'Make QR codes for event tickets',
                'Create contactless menu codes for restaurants',
                'Generate WiFi sharing QR codes',
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

        return [
            {
                question: `Is ${toolName} really free?`,
                answer: `Yes! ${toolName} is completely free to use with no hidden costs, subscriptions, or premium features. All functionality is available to everyone at no charge.`,
            },
            {
                question: `Do I need to create an account to use ${toolName}?`,
                answer: `No account needed! You can start using ${toolName} immediately without any registration, signup, or login. Just open the tool and start working.`,
            },
            {
                question: `Is my data safe when using ${toolName}?`,
                answer: `Absolutely! All processing happens locally in your browser. Your files and data never leave your device, ensuring complete privacy and security.`,
            },
            {
                question: `What file formats does ${toolName} support?`,
                answer: `${toolName} supports all common file formats and standards. The tool is designed to handle various inputs and provide flexible output options.`,
            },
            {
                question: `Can I use ${toolName} on my mobile device?`,
                answer: `Yes! ${toolName} is fully responsive and works perfectly on smartphones, tablets, and desktop computers. Use it anywhere, anytime.`,
            },
        ];
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

            {/* About Section with Gradient Card */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-background border border-primary/10 p-8 md:p-10"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl -z-10"></div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        About {tool.name}
                    </h2>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        {tool.name} is a powerful, free online tool designed to help you {tool.description.toLowerCase()}.
                        Whether you're a professional, student, or casual user, our {tool.name.toLowerCase()} provides
                        everything you need in a simple, intuitive interface. Built with modern web technologies, this
                        tool delivers fast, accurate results without requiring any software installation or downloads.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                        In {currentYear}, having access to reliable online tools is essential for productivity. Our {tool.name}
                        stands out by offering professional-grade functionality completely free of charge. No watermarks,
                        no limitations, and no signup required. Simply open the tool in your browser and start working
                        immediately. Your privacy is our priority - all processing happens locally on your device, ensuring
                        your data remains completely secure and private.
                    </p>
                </div>
            </motion.section>

            {/* Key Benefits with Gradient Cards */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">Why Choose Our {tool.name}?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                                <div className="relative flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm leading-relaxed text-foreground font-medium">{benefit.text}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            {/* How to Use with Step Cards */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">How to Use {tool.name}</h2>
                </div>

                <p className="text-muted-foreground mb-8 text-lg">
                    Using our {tool.name.toLowerCase()} is incredibly simple. Follow these easy steps to get started:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {howToSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
                            <div className="relative flex items-start gap-5 p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                                    {index + 1}
                                </div>
                                <p className="text-muted-foreground pt-2 leading-relaxed">{step}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Use Cases with Modern List */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-background border border-border p-8 md:p-10"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent"></div>

                <h2 className="text-3xl font-bold mb-6">Common Use Cases for {tool.name}</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                    Our {tool.name.toLowerCase()} is versatile and can be used in many different scenarios:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {useCases.map((useCase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.05 }}
                            className="flex items-start gap-3 p-4 rounded-lg bg-background/50 hover:bg-background transition-colors"
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-muted-foreground leading-relaxed">{useCase}</span>
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
                <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/50 group-hover:w-2 transition-all"></div>
                            <h3 className="font-semibold text-lg mb-3 pl-4 text-foreground">{faq.question}</h3>
                            <p className="text-muted-foreground leading-relaxed pl-4">{faq.answer}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Final CTA with Premium Gradient */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-10 md:p-12 text-center shadow-2xl"
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDBjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L2c+PC9zdmc+')] opacity-10"></div>

                <div className="relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.1, type: "spring" }}
                        className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                        <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Get Started?</h2>
                    <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
                        Join thousands of users who trust {tool.name} for their daily tasks. Start using our free
                        {' '}{tool.name.toLowerCase()} today and experience the difference. No signup, no downloads,
                        no hassle - just pure functionality at your fingertips.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 text-sm text-white/90">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">100% Free</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">No Registration</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">Secure & Private</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">Works Offline</span>
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default ToolContentSection;
