import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Star, Zap, Users, TrendingUp, Award } from 'lucide-react';

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
                intro: `Our comprehensive collection of ${categoryName} provides everything you need to work with images online. Whether you're optimizing photos for your website, preparing images for social media, or converting between different formats, our free image tools make it easy. All tools work directly in your browser with no software installation required.`,
                benefits: [
                    'Compress images without losing quality',
                    'Convert between JPG, PNG, WebP, and other formats',
                    'Resize and crop images to exact dimensions',
                    'Optimize images for faster website loading',
                    'Batch process multiple images at once',
                    'Remove backgrounds and edit photos',
                ],
                useCases: [
                    'Web designers optimizing images for faster page loads',
                    'Social media managers preparing content for multiple platforms',
                    'Bloggers reducing image file sizes for better SEO',
                    'E-commerce sellers creating product thumbnails',
                    'Photographers converting RAW images to web formats',
                ],
            };
        } else if (categoryId.includes('pdf')) {
            return {
                intro: `Transform the way you work with PDF documents using our powerful ${categoryName}. From merging multiple files to compressing large documents, our PDF tools handle all your document processing needs. No downloads, no installations - just fast, secure PDF processing in your browser.`,
                benefits: [
                    'Merge multiple PDFs into a single document',
                    'Split large PDFs into smaller files',
                    'Compress PDF files to reduce size',
                    'Convert PDFs to Word, Excel, and other formats',
                    'Add watermarks and protect documents',
                    'Extract pages and images from PDFs',
                ],
                useCases: [
                    'Office workers combining reports and presentations',
                    'Students merging assignments and research papers',
                    'Legal professionals organizing case documents',
                    'Businesses compressing files for email attachments',
                    'Freelancers converting contracts and invoices',
                ],
            };
        } else if (categoryId.includes('text')) {
            return {
                intro: `Streamline your text processing workflow with our versatile ${categoryName}. Whether you're formatting content, analyzing text, or transforming strings, our tools provide instant results. Perfect for writers, developers, and content creators who need quick text manipulation.`,
                benefits: [
                    'Transform text case (uppercase, lowercase, title case)',
                    'Count words, characters, and paragraphs',
                    'Remove extra spaces and line breaks',
                    'Find and replace text patterns',
                    'Encode and decode text formats',
                    'Generate lorem ipsum placeholder text',
                ],
                useCases: [
                    'Content writers formatting articles and blog posts',
                    'Developers cleaning up code and documentation',
                    'SEO specialists analyzing keyword density',
                    'Students checking word counts for assignments',
                    'Copywriters preparing text for various platforms',
                ],
            };
        } else if (categoryId.includes('code') || categoryId.includes('developer')) {
            return {
                intro: `Boost your development productivity with our essential ${categoryName}. From code formatting to data validation, these tools are designed to save developers time and reduce errors. All tools process data locally in your browser for maximum security.`,
                benefits: [
                    'Format and beautify code automatically',
                    'Validate JSON, XML, and other data formats',
                    'Encode and decode Base64, URL, and HTML',
                    'Generate code snippets and templates',
                    'Minify and compress code for production',
                    'Convert between different data formats',
                ],
                useCases: [
                    'Web developers formatting and validating code',
                    'API developers testing JSON responses',
                    'Frontend engineers minifying CSS and JavaScript',
                    'Backend developers encoding authentication tokens',
                    'DevOps engineers working with configuration files',
                ],
            };
        } else if (categoryId.includes('calculator')) {
            return {
                intro: `Solve complex calculations instantly with our comprehensive ${categoryName}. From basic arithmetic to advanced financial calculations, our calculators provide accurate results for students, professionals, and anyone who needs quick mathematical solutions.`,
                benefits: [
                    'Perform basic and advanced calculations',
                    'Calculate percentages and ratios',
                    'Solve algebraic equations',
                    'Compute financial metrics and interest',
                    'Convert between units and measurements',
                    'Get instant, accurate results',
                ],
                useCases: [
                    'Students solving homework and exam problems',
                    'Finance professionals calculating returns and interest',
                    'Engineers performing technical calculations',
                    'Business owners estimating costs and profits',
                    'Shoppers calculating discounts and savings',
                ],
            };
        } else if (categoryId.includes('converter') || categoryId.includes('conversion')) {
            return {
                intro: `Convert files and data effortlessly with our powerful ${categoryName}. Supporting dozens of formats and conversion types, our tools make it easy to transform your data exactly how you need it. Fast, accurate, and completely free.`,
                benefits: [
                    'Convert between hundreds of file formats',
                    'Maintain quality during conversion',
                    'Batch convert multiple files at once',
                    'Preview results before downloading',
                    'No file size limits or restrictions',
                    'Instant conversion processing',
                ],
                useCases: [
                    'Designers converting images for different platforms',
                    'Video editors transforming media formats',
                    'Office workers converting documents',
                    'Developers transforming data formats',
                    'Content creators preparing files for upload',
                ],
            };
        } else if (categoryId.includes('qr')) {
            return {
                intro: `Create professional QR codes in seconds with our ${categoryName}. Perfect for marketing campaigns, business cards, event tickets, and contactless sharing. Generate custom QR codes with logos, colors, and various data types.`,
                benefits: [
                    'Generate QR codes for URLs, text, and more',
                    'Customize colors and add logos',
                    'Create high-resolution codes for printing',
                    'Track scans and analytics',
                    'Download in multiple formats',
                    'No expiration or scan limits',
                ],
                useCases: [
                    'Marketers creating campaign QR codes',
                    'Restaurants making contactless menus',
                    'Event organizers generating ticket codes',
                    'Businesses adding QR codes to business cards',
                    'Retailers creating product information codes',
                ],
            };
        } else if (categoryId.includes('password')) {
            return {
                intro: `Generate strong, secure passwords with our ${categoryName}. Protect your online accounts with randomly generated passwords that are virtually impossible to crack. Customize length, characters, and complexity to meet any security requirement.`,
                benefits: [
                    'Generate cryptographically secure passwords',
                    'Customize length and character types',
                    'Create memorable passphrases',
                    'Check password strength instantly',
                    'Generate multiple passwords at once',
                    'No passwords stored or transmitted',
                ],
                useCases: [
                    'IT administrators creating user accounts',
                    'Security-conscious users protecting accounts',
                    'Developers generating API keys and tokens',
                    'Businesses enforcing password policies',
                    'Anyone creating new online accounts',
                ],
            };
        }

        // Default content for other categories
        return {
            intro: `Discover our comprehensive collection of ${categoryName} designed to simplify your daily tasks. With ${toolCount} powerful tools at your fingertips, you can accomplish more in less time. All tools are free, secure, and work directly in your browser without any downloads or installations.`,
            benefits: [
                'Free to use with no hidden costs',
                'No registration or signup required',
                'Process data securely in your browser',
                'Works on all devices and platforms',
                'Fast, accurate results every time',
                'Regular updates and new features',
            ],
            useCases: [
                'Professionals streamlining their workflow',
                'Students completing assignments faster',
                'Businesses improving productivity',
                'Developers building and testing projects',
                'Content creators producing better work',
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

            {/* Introduction with Gradient Background */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-background border border-primary/10 p-8 md:p-10"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl -z-10"></div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                        <Award className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        About {category.title}
                    </h2>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        {content.intro}
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                        In {currentYear}, having access to reliable online tools is essential for productivity and efficiency.
                        Our {category.title.toLowerCase()} are built with modern web technologies to deliver professional-grade
                        results without the need for expensive software subscriptions. Everything runs in your browser, ensuring
                        your data stays private and secure on your device.
                    </p>
                </div>
            </motion.section>

            {/* Key Features with Vibrant Cards */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">Key Features</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {content.benefits.map((benefit, index) => {
                        const gradients = [
                            'from-blue-500 to-cyan-500',
                            'from-purple-500 to-pink-500',
                            'from-green-500 to-emerald-500',
                            'from-orange-500 to-red-500',
                            'from-indigo-500 to-purple-500',
                            'from-yellow-500 to-orange-500',
                        ];
                        const gradient = gradients[index % gradients.length];

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                whileHover={{ scale: 1.03, y: -4 }}
                                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                                <div className="relative flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground font-medium pt-1">{benefit}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            {/* Use Cases with Modern Design */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-background border border-border p-8 md:p-10"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent"></div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">Who Uses {category.title}?</h2>
                </div>

                <p className="text-muted-foreground mb-8 text-lg">
                    Our {category.title.toLowerCase()} are trusted by thousands of users worldwide for various purposes:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content.useCases.map((useCase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.05 }}
                            className="flex items-start gap-3 p-4 rounded-lg bg-background/50 hover:bg-background transition-colors"
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-muted-foreground leading-relaxed">{useCase}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Why Choose Us with Premium Gradient */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-10 md:p-12 shadow-2xl"
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDBjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L2c+PC9zdmc+')] opacity-10"></div>

                <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Why Choose Our {category.title}?</h2>
                    </div>

                    <p className="text-primary-foreground/90 leading-relaxed mb-4 text-lg">
                        Unlike other online tool platforms, we prioritize your privacy and user experience. All our {category.title.toLowerCase()}
                        process data locally in your browser, meaning your files and information never leave your device. This approach
                        ensures maximum security and privacy while delivering lightning-fast results.
                    </p>
                    <p className="text-primary-foreground/90 leading-relaxed text-lg">
                        We're committed to keeping our tools free and accessible to everyone. No hidden fees, no premium tiers,
                        and no annoying watermarks. Just powerful, professional tools that help you get work done efficiently.
                        With <span className="font-bold text-white">{toolCount} tools</span> in this category and counting, we're constantly adding new features based on user feedback.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-medium">100% Free</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Privacy First</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-medium">No Registration</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-medium">{toolCount}+ Tools</span>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Getting Started with Card Design */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="relative overflow-hidden rounded-xl border border-border bg-card p-8 md:p-10 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">Getting Started</h2>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-4 text-lg">
                    Using our {category.title.toLowerCase()} is incredibly simple. Just select the tool you need from the list above,
                    and you'll be taken to the tool page where you can start working immediately. No tutorials needed - our
                    intuitive interfaces make it easy for anyone to use, regardless of technical expertise.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                    All tools are mobile-friendly and work on any device with a modern web browser. Whether you're on a desktop
                    computer, tablet, or smartphone, you'll have access to the same powerful features. Bookmark your favorite
                    tools for quick access, and enjoy a seamless experience across all your devices.
                </p>
            </motion.section>
        </div>
    );
};

export default CategoryContentSection;
