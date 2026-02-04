import AnimatedElement from "@/components/animated-element";
import { 
  FileText, 
  Image, 
  RefreshCw, 
  Calculator, 
  QrCode, 
  Shield,
  CheckCircle2,
  Sparkles,
  Lock,
  Zap,
  Users,
  Globe,
  Download,
  Code,
  Award,
  Star,
  Github,
  Heart,
  Quote,
  TrendingUp,
  MousePointerClick
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const SEOContentSection = () => {
  const toolCategories = [
    {
      icon: FileText,
      title: "Free PDF Tools Online",
      description: "Merge PDF files, split PDF pages, compress PDF size, convert PDF to Word, PDF to JPG, encrypt PDF, and more. Our PDF merger combines multiple PDFs instantly, while the PDF compressor reduces file sizes without quality loss. All PDF tools work in your browser - no software installation needed.",
      color: "bg-tooltopia-soft-pink",
      link: "/tools/pdf"
    },
    {
      icon: Image,
      title: "Image Compressor & Editor",
      description: "Compress images online free and reduce file sizes by up to 90% without losing quality. Convert image formats (PNG to JPG, JPG to WebP), resize images, crop photos, and apply filters. Perfect for optimizing images for websites, social media, and email attachments.",
      color: "bg-tooltopia-soft-blue",
      link: "/tools/image"
    },
    {
      icon: RefreshCw,
      title: "Online Converter Tools",
      description: "Free unit converter, currency converter, and file converter tools. Convert units (length, weight, temperature), currencies with real-time rates, base64 encoding/decoding, binary to hex, timestamp converter, and more. Fast, accurate, and easy to use conversion tools.",
      color: "bg-tooltopia-soft-yellow",
      link: "/tools/conversion"
    },
    {
      icon: Calculator,
      title: "Free Online Calculators",
      description: "Basic calculator, scientific calculator, BMI calculator, age calculator, and specialized calculators. Perform complex calculations, check your body mass index, calculate your exact age, and more - all free and accessible from any device.",
      color: "bg-tooltopia-soft-green",
      link: "/tools/calculator"
    },
    {
      icon: QrCode,
      title: "QR Code Generator Free",
      description: "Create custom QR codes for free. Generate QR codes for URLs, text, WiFi, contact cards, and more. Also includes barcode generator and QR code scanner. Download QR codes in various formats - perfect for business cards, marketing materials, and digital sharing.",
      color: "bg-tooltopia-soft-orange",
      link: "/tools/qr"
    },
    {
      icon: Shield,
      title: "Password & Security Tools",
      description: "Strong password generator, hash generators (MD5, SHA-256, SHA-512), encryption/decryption tools, and security utilities. Generate secure random passwords with custom options, create hashes for data verification, and protect sensitive information online.",
      color: "bg-tooltopia-soft-purple",
      link: "/tools/password"
    }
  ];

  const keyFeatures = [
    { icon: CheckCircle2, title: "100% Free Forever", desc: "All tools completely free with no hidden fees, subscriptions, or premium tiers. Full access to every feature." },
    { icon: Sparkles, title: "No Registration Required", desc: "Instant access to all tools. No sign-up, no email, no account needed. Just open and start using." },
    { icon: Lock, title: "Privacy & Security First", desc: "Files processed locally in your browser. Your data never touches our servers. Complete privacy guaranteed." },
    { icon: Zap, title: "Lightning Fast Performance", desc: "Optimized for speed with instant results. No waiting, no loading screens, just immediate tool access." },
    { icon: Users, title: "Used by Millions", desc: "Trusted by developers, designers, students, and professionals worldwide for daily productivity tasks." },
    { icon: Globe, title: "Works Everywhere", desc: "Fully responsive design works on desktop, tablet, and mobile. Use SnapTools on any device, anywhere." }
  ];

  const stats = [
    { icon: Download, value: "100+", label: "Free Online Tools" },
    { icon: Users, value: "1M+", label: "Monthly Users" },
    { icon: Code, value: "50+", label: "Tool Categories" },
    { icon: Award, value: "4.8/5", label: "User Rating" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Graphic Designer",
      content: "Best free image compressor I've found! Compressed my portfolio images by 70% without any visible quality loss. SnapTools saves me hours every week.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Web Developer",
      content: "The PDF merger and JSON formatter are lifesavers. No more switching between multiple websites. Everything I need in one place, and it's completely free!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Digital Marketer",
      content: "QR code generator is perfect for campaigns. Created hundreds of QR codes for our marketing materials. Fast, reliable, and no watermarks!",
      rating: 5
    },
    {
      name: "David Kumar",
      role: "Software Engineer",
      content: "The base64 encoder and code formatter tools are incredibly useful. I use them daily for API testing and debugging. Fast, accurate, and always accessible!",
      rating: 5
    },
    {
      name: "Lisa Anderson",
      role: "Content Writer",
      content: "Word counter and character counter tools are essential for my work. Helps me meet word limits perfectly. The interface is clean and super easy to use.",
      rating: 5
    },
    {
      name: "James Taylor",
      role: "IT Security Specialist",
      content: "Password generator creates strong, secure passwords instantly. The hash generator is also fantastic for verification tasks. Reliable security tools!",
      rating: 5
    },
    {
      name: "Maria Garcia",
      role: "E-commerce Manager",
      content: "PDF splitter and compressor saved me so much time preparing product catalogs. Reduced file sizes by 80% making uploads super fast. Amazing tools!",
      rating: 5
    },
    {
      name: "Alex Wong",
      role: "UI/UX Designer",
      content: "Color picker and hex to RGB converter are my go-to tools. Perfect for design work. No more searching for multiple tools, everything's right here!",
      rating: 5
    },
    {
      name: "Rachel Green",
      role: "Student",
      content: "The calculators and unit converters help me with homework and projects. BMI calculator is also great. All free with no annoying ads or popups!",
      rating: 5
    },
    {
      name: "Tom Parker",
      role: "Freelance Developer",
      content: "Image format converter and timestamp converter are brilliant. Convert PNG to WebP in seconds. These free tools rival expensive paid alternatives!",
      rating: 5
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Choose Your Tool",
      description: "Browse 100+ free tools or search for what you need. No registration required."
    },
    {
      step: "2",
      title: "Upload or Input Data",
      description: "Drag and drop files or paste your data. All processing happens in your browser."
    },
    {
      step: "3",
      title: "Get Instant Results",
      description: "Download your processed files or copy results. Fast, secure, and completely free."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-accent/10 via-accent/20 to-background">
      <div className="container px-4 sm:px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="text-center mb-16">
          <AnimatedElement animation="fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <Star size={16} className="text-primary fill-primary" />
              <span className="text-sm font-medium text-primary">Trusted by Millions Worldwide</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-tooltopia-purple-vivid to-primary">
              Why Choose SnapTools for Your<br className="hidden sm:block" /> Free Online Tool Needs?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
              <strong>SnapTools</strong> is the most comprehensive free online tools platform. Whether you need to <strong>merge PDFs</strong>, 
              <strong> compress images</strong>, <strong>generate QR codes</strong>, or use any of our <strong>100+ free tools</strong>, 
              SnapTools provides everything in one powerful, easy-to-use platform. No downloads, no registration, completely free.
            </p>
          </AnimatedElement>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <AnimatedElement key={index} delay={index * 0.1} animation="slideUp">
              <div className="text-center p-6 rounded-xl bg-card border hover:border-primary/30 transition-all">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon size={24} className="text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </AnimatedElement>
          ))}
        </div>

        {/* Tool Categories */}
        <div className="mb-16">
          <AnimatedElement animation="fadeIn">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-center">
              Comprehensive Free Online Tools Collection
            </h3>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              Professional-grade tools for every need. Click any category to explore all available tools.
            </p>
          </AnimatedElement>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolCategories.map((category, index) => (
              <AnimatedElement 
                key={index} 
                delay={index * 0.1} 
                animation="slideUp"
              >
                <Link 
                  to={category.link}
                  className="block p-6 rounded-xl bg-card border hover:border-primary/30 hover:shadow-lg transition-all h-full group"
                >
                  <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", category.color)}>
                    <category.icon size={28} className="text-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{category.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore tools
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </AnimatedElement>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl -z-10"></div>
          <div className="py-12">
            <AnimatedElement animation="fadeIn">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-center">
                What Makes SnapTools the Best Free Online Tools Platform?
              </h3>
              <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
                Built for speed, privacy, and ease of use. No compromise on quality or features.
              </p>
            </AnimatedElement>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {keyFeatures.map((feature, index) => (
                <AnimatedElement key={index} delay={index * 0.1}>
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-card border hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-base">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <AnimatedElement animation="fadeIn">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-center">
              How to Use SnapTools - Simple & Fast
            </h3>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              Get started in seconds. No downloads, no sign-ups, just instant access to professional tools.
            </p>
          </AnimatedElement>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <AnimatedElement key={index} delay={index * 0.1} animation="slideUp">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {step.step}
                  </div>
                  <h4 className="text-xl font-semibold mb-3">{step.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
          <div className="relative">
            <AnimatedElement animation="fadeIn">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
                  <Quote size={16} className="text-primary" />
                  <span className="text-sm font-medium text-primary">User Testimonials</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                  Loved by Professionals Worldwide
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  See what our users say about SnapTools free online tools platform.
                </p>
              </div>
            </AnimatedElement>
            
            {/* Horizontal Scrolling Container */}
            <div className="relative">
              <div className="overflow-hidden">
                <div className="flex gap-6 animate-scroll-horizontal hover:pause-animation">
                  {/* Duplicate testimonials for seamless loop */}
                  {[...testimonials, ...testimonials].map((testimonial, index) => (
                    <div 
                      key={index}
                      className="flex-shrink-0 w-[350px] p-6 rounded-xl bg-card border hover:border-primary/30 hover:shadow-lg transition-all flex flex-col"
                    >
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <Quote size={24} className="text-primary/20 mb-3" />
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow italic">
                        "{testimonial.content}"
                      </p>
                      <div className="pt-4 border-t">
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Gradient overlays for fade effect */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-accent/20 to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-accent/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Comparison/Alternative Keywords Section */}
        <AnimatedElement animation="fadeIn">
          <div className="mb-16 p-8 rounded-2xl bg-accent/10 border max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                Free Alternative to Expensive Software
              </h3>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Why pay for expensive software when SnapTools offers professional-grade tools completely free? 
                Perfect <strong>alternative to Adobe Acrobat</strong> for PDF tools, <strong>alternative to Photoshop</strong> for basic image editing, 
                and <strong>alternative to premium converter tools</strong>. Get the same results without the cost.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-card text-center">
                <TrendingUp size={20} className="mx-auto mb-2 text-primary" />
                <div className="font-medium">vs Adobe Acrobat</div>
                <div className="text-xs text-muted-foreground mt-1">Free PDF Tools</div>
              </div>
              <div className="p-4 rounded-lg bg-card text-center">
                <MousePointerClick size={20} className="mx-auto mb-2 text-primary" />
                <div className="font-medium">vs Smallpdf</div>
                <div className="text-xs text-muted-foreground mt-1">No Limits</div>
              </div>
              <div className="p-4 rounded-lg bg-card text-center">
                <Image size={20} className="mx-auto mb-2 text-primary" />
                <div className="font-medium">vs TinyPNG</div>
                <div className="text-xs text-muted-foreground mt-1">Unlimited Compression</div>
              </div>
              <div className="p-4 rounded-lg bg-card text-center">
                <QrCode size={20} className="mx-auto mb-2 text-primary" />
                <div className="font-medium">vs Paid QR Tools</div>
                <div className="text-xs text-muted-foreground mt-1">No Watermarks</div>
              </div>
            </div>
          </div>
        </AnimatedElement>

        {/* Popular Tools & CTA */}
        <AnimatedElement animation="fadeIn">
          <div className="max-w-4xl mx-auto text-center p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/30 to-background border">
            <h3 className="text-2xl sm:text-3xl font-bold mb-6">
              Most Popular Free Tools on SnapTools
            </h3>
            <p className="text-muted-foreground mb-4 text-base leading-relaxed">
              Our most used tools include <strong>PDF merger online</strong> for combining PDF files, 
              <strong> image compressor free</strong> for optimizing photos, <strong>QR code generator</strong> for creating scannable codes, 
              <strong> password generator</strong> for secure passwords, <strong>base64 encoder</strong> for data encoding, 
              <strong> JSON formatter</strong> for code formatting, and <strong>unit converter</strong> for measurements.
              These tools are trusted by thousands of users daily for personal and professional tasks.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              Whether you're a <strong>web developer</strong>, <strong>graphic designer</strong>, <strong>student</strong>, 
              <strong> digital marketer</strong>, or <strong>business professional</strong>, SnapTools provides all the 
              <strong> free online tools</strong> you need. From <strong>PDF manipulation</strong> and <strong>image editing</strong> to 
              <strong> file converters</strong>, <strong>calculators</strong>, and <strong>code formatters</strong> - everything is 
              available for free with no limitations.
            </p>
            <Link 
              to="/tools"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
            >
              Explore All 100+ Free Tools
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </AnimatedElement>

        {/* Open Source Section */}
        <AnimatedElement animation="fadeIn" delay={0.2}>
          <div className="max-w-5xl mx-auto mt-16 p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-card via-accent/20 to-card border-2 border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Github size={40} className="text-primary" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-3">
                  <Code size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-primary">FREE & OPEN SOURCE</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                  SnapTools is Open Source Software (FOSS)
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  SnapTools is completely <strong>free and open source</strong>. Built by the community, for the community. 
                  View the source code, contribute features, report bugs, or fork the project on GitHub. 
                  Your support helps us keep all tools free forever!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <a 
                    href="https://github.com/iam-sandipmaity/snaptools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#24292e] hover:bg-[#1b1f23] text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    <Github size={20} />
                    View on GitHub
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a 
                    href="https://github.com/iam-sandipmaity/snaptools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium border border-primary/20 hover:border-primary/40"
                  >
                    <Star size={20} className="fill-current" />
                    Star on GitHub
                  </a>
                </div>
              </div>
              <div className="flex-shrink-0 hidden lg:block">
                <div className="text-center p-6 rounded-xl bg-card/50 border">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">Show your support</div>
                  <div className="text-xs text-muted-foreground">Star us on GitHub</div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};

export default SEOContentSection;
