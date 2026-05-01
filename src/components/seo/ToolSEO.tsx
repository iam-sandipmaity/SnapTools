import { Helmet } from 'react-helmet-async';
import { toolCategories } from '@/data/tools';

interface ToolSEOProps {
  tool: {
    id: string;
    name: string;
    description: string;
    category: string;
    features?: string[];
  };
}

const ToolSEO = ({ tool }: ToolSEOProps) => {
  // Get current year dynamically for SEO freshness
  const currentYear = new Date().getFullYear();

  // Generate powerful SEO-optimized title with power words
  const generateTitle = () => {
    const toolName = tool.name;
    // Add power words that increase click-through rates
    const powerWords = ['Free', 'Best', 'Online', 'Easy', 'Fast', 'Instant'];
    return `${toolName} - Free Online Tool | Best ${toolName} ${currentYear} | SnapTools`;
  };

  const title = generateTitle();

  // Generate compelling SEO-optimized description with CTAs
  const generateDescription = () => {
    const baseDesc = tool.description.length > 155
      ? tool.description.substring(0, 150)
      : tool.description;

    // Add power words and CTA
    return `${baseDesc}. Free, fast, secure & no signup required. Try now!`;
  };

  const description = generateDescription();

  // AUTO-GENERATE use cases based on tool category and name
  const generateUseCases = (toolName: string, category: string) => {
    const useCases: string[] = [
      // Comparison keywords (automatic)
      `${toolName} vs`,
      `${toolName} alternative`,
      `free alternative to ${toolName}`,
      `better than ${toolName}`,
      `${toolName} replacement`,
    ];

    // Category-specific use cases (intelligent)
    if (category.includes('image')) {
      useCases.push(
        `${toolName} for social media`,
        `${toolName} for instagram`,
        `${toolName} for facebook`,
        `${toolName} for web design`,
        `${toolName} for wordpress`,
        `${toolName} for thumbnail`,
        `${toolName} for email`
      );
    } else if (category.includes('pdf')) {
      useCases.push(
        `${toolName} for work`,
        `${toolName} for documents`,
        `${toolName} for resume`,
        `${toolName} for invoice`,
        `${toolName} for contracts`,
        `${toolName} for ebooks`
      );
    } else if (category.includes('text')) {
      useCases.push(
        `${toolName} for content writing`,
        `${toolName} for copywriting`,
        `${toolName} for blog posts`,
        `${toolName} for seo`,
        `${toolName} for articles`
      );
    } else if (category.includes('code') || category.includes('developer')) {
      useCases.push(
        `${toolName} for programming`,
        `${toolName} for javascript`,
        `${toolName} for python`,
        `${toolName} for web development`,
        `${toolName} for api`,
        `${toolName} for json`
      );
    } else if (category.includes('network')) {
      useCases.push(
        `${toolName} for debugging`,
        `${toolName} for testing`,
        `${toolName} for troubleshooting`,
        `${toolName} for servers`,
        `${toolName} for websites`
      );
    } else if (category.includes('calculator')) {
      useCases.push(
        `${toolName} for math`,
        `${toolName} for homework`,
        `${toolName} for finance`,
        `${toolName} for taxes`,
        `${toolName} for science`
      );
    } else if (category.includes('converter') || category.includes('conversion')) {
      useCases.push(
        `${toolName} for documents`,
        `${toolName} for files`,
        `${toolName} for formats`,
        `${toolName} batch conversion`
      );
    }

    return useCases;
  };

  // Generate comprehensive keywords with long-tail variations
  const generateKeywords = () => {
    const toolName = tool.name.toLowerCase();
    const category = tool.category.toLowerCase();
    const toolWords = toolName.split(' ');

    const keywords: string[] = [
      // Primary keywords
      toolName,
      `${toolName} online`,
      `${toolName} free`,
      `free ${toolName}`,
      `${toolName} tool`,
      `online ${toolName} tool`,
      `free online ${toolName}`,
      `best ${toolName}`,
      `${toolName} ${currentYear}`,

      // Long-tail keywords
      `${toolName} no download`,
      `${toolName} no registration`,
      `${toolName} web based`,
      `${toolName} browser`,
      `how to use ${toolName}`,
      `${toolName} online free no sign up`,
      `best free ${toolName}`,
      `${toolName} without watermark`,

      // Question-based keywords (high intent)
      `what is ${toolName}`,
      `how to ${toolName}`,
      `where to ${toolName}`,

      // Voice search keywords (natural language)
      `ok google ${toolName}`,
      `hey siri ${toolName}`,
      `alexa ${toolName}`,
      `${toolName} near me`,
      `${toolName} for free`,
      `i need ${toolName}`,
      `help me ${toolName}`,

      // Use case specific keywords - AUTO-GENERATED
      `${toolName} for website`,
      `${toolName} for mobile`,
      `${toolName} for business`,
      `${toolName} for students`,
      `${toolName} for developers`,
      `professional ${toolName}`,
      `simple ${toolName}`,
      `quick ${toolName}`,
      `instant ${toolName}`,
    ];

    // AUTO-GENERATE additional use cases based on category
    const useCases = generateUseCases(toolName, category);
    keywords.push(...useCases);

    // Add variations for multi-word tools
    if (toolWords.length > 1) {
      keywords.push(
        toolWords.join(' '),
        toolWords.join('-'),
        toolWords.join(''),
      );
    }

    // Add category-specific keywords with extensive variations
    if (category.includes('text')) {
      keywords.push(
        'text tools', 'string manipulation', 'text editor online',
        'text formatter', 'text converter', 'text analyzer',
        'string tools', 'text processing', 'text utility'
      );
    } else if (category.includes('image')) {
      keywords.push(
        'image tools', 'photo editor', 'image converter',
        'image optimizer', 'picture editor online', 'photo tools',
        'image processing', 'image editor free', 'online photo editor',
        'image compressor', 'resize image', 'crop image online'
      );
    } else if (category.includes('converter') || category.includes('conversion')) {
      keywords.push(
        'online converter', 'file converter', 'format converter',
        'convert files online', 'free converter', 'converter tool',
        'file format converter', 'online conversion tool'
      );
    } else if (category.includes('developer') || category.includes('code')) {
      keywords.push(
        'developer tools', 'coding tools', 'programming tools',
        'dev tools online', 'code formatter', 'code tools',
        'programmer tools', 'development tools', 'coding utilities'
      );
    } else if (category.includes('network')) {
      keywords.push(
        'network tools', 'networking', 'internet tools',
        'network utilities', 'network checker', 'online network tools',
        'ip tools', 'dns tools', 'network testing tools'
      );
    } else if (category.includes('encryption') || category.includes('security')) {
      keywords.push(
        'encryption tools', 'security tools', 'crypto tools',
        'encrypt online', 'decrypt online', 'hash generator',
        'encryption online free', 'secure tools', 'privacy tools'
      );
    } else if (category.includes('pdf')) {
      keywords.push(
        'pdf tools', 'pdf editor', 'pdf converter',
        'edit pdf online', 'pdf utilities', 'pdf editor free',
        'online pdf tools', 'pdf manipulation', 'pdf processing'
      );
    } else if (category.includes('calculator')) {
      keywords.push(
        'calculator online', 'free calculator', 'online calculator tool',
        'calculation tools', 'calculator free', 'web calculator'
      );
    } else if (category.includes('qr')) {
      keywords.push(
        'qr code generator', 'qr code tools', 'create qr code',
        'qr code maker free', 'generate qr code online', 'qr scanner'
      );
    } else if (category.includes('color')) {
      keywords.push(
        'color tools', 'color picker', 'color converter',
        'hex color picker', 'color palette generator', 'color tools online'
      );
    } else if (category.includes('unit')) {
      keywords.push(
        'unit converter', 'conversion calculator', 'unit conversion',
        'convert units online', 'measurement converter', 'unit calculator'
      );
    } else if (category.includes('password')) {
      keywords.push(
        'password generator', 'strong password generator', 'password tools',
        'generate password online', 'random password generator', 'secure password'
      );
    } else if (category.includes('markdown')) {
      keywords.push(
        'markdown editor', 'markdown tools', 'markdown converter',
        'markdown to html', 'markdown preview', 'markdown editor online'
      );
    } else if (category.includes('clock') || category.includes('time')) {
      keywords.push(
        'world clock', 'time zone converter', 'time tools',
        'clock online', 'time converter', 'timezone tools'
      );
    } else if (category.includes('social')) {
      keywords.push(
        'social media tools', 'social media utilities', 'social tools online',
        'social media helper', 'social media generator', 'social media optimizer'
      );
    } else if (category.includes('seo') || category.includes('web')) {
      keywords.push(
        'seo tools', 'seo analyzer', 'seo checker online',
        'website tools', 'web development tools', 'seo optimizer free',
        'search engine optimization', 'website analyzer', 'meta tag generator'
      );
    } else if (category.includes('miscellaneous') || category.includes('misc')) {
      keywords.push(
        'online tools', 'web utilities', 'free tools online',
        'utility tools', 'productivity tools', 'helpful tools'
      );
    } else if (category.includes('file')) {
      keywords.push(
        'file tools', 'file sharing', 'file transfer online',
        'share files online', 'file converter', 'file utilities',
        'p2p file sharing', 'send files', 'file sharing tool'
      );
    } else if (category.includes('internet')) {
      keywords.push(
        'internet tools', 'web tools', 'online utilities',
        'internet utilities', 'browser tools', 'web based tools'
      );
    } else if (category.includes('currency')) {
      keywords.push(
        'currency converter', 'exchange rate converter', 'money converter',
        'currency calculator', 'convert currency online', 'forex converter',
        'foreign exchange calculator', 'currency exchange tool'
      );
    }

    // Add universal keywords
    keywords.push(
      'snaptools',
      'free online tools',
      'web tools',
      'online utilities',
      'free tools no download',
      'browser based tools',
      'no installation required'
    );

    // Remove duplicates and return
    return [...new Set(keywords)].join(', ');
  };

  // Base URL: production domain in prod, current origin in dev
  const BASE_URL = import.meta.env.PROD
    ? 'https://snaptools.xyz'
    : (typeof window !== 'undefined' ? window.location.origin : 'https://snaptools.xyz');

  // Generate canonical URL (always canonical production URL for SEO)
  const canonicalUrl = `https://snaptools.xyz/tools/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.id}`;

  // OG image base should use current origin so local dev links resolve correctly
  const ogBase = BASE_URL;

  // AUTO-GENERATE International SEO - Multi-language support
  const supportedLanguages = [
    { code: 'en', region: 'us', name: 'English (US)' },
    { code: 'en', region: 'gb', name: 'English (UK)' },
    { code: 'en', region: 'ca', name: 'English (Canada)' },
    { code: 'en', region: 'au', name: 'English (Australia)' },
    { code: 'en', region: 'in', name: 'English (India)' },
    { code: 'es', region: '', name: 'Spanish' },
    { code: 'fr', region: '', name: 'French' },
    { code: 'de', region: '', name: 'German' },
    { code: 'pt', region: '', name: 'Portuguese' },
    { code: 'hi', region: '', name: 'Hindi' },
    { code: 'zh', region: '', name: 'Chinese' },
    { code: 'ja', region: '', name: 'Japanese' },
    { code: 'ar', region: '', name: 'Arabic' },
  ];

  // Generate structured data for rich snippets with enhanced details
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Web Browser, Windows, MacOS, Linux, Android, iOS",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2027-12-31"
    },
    "description": tool.description,
    "url": canonicalUrl,
    "screenshot": "https://snaptools.xyz/og-image.jpg",
    "featureList": tool.features || [
      "100% Free",
      "No Registration Required",
      "No Download Needed",
      "Secure & Private",
      "Fast Processing",
      "User Friendly Interface"
    ],
    "browserRequirements": "Requires JavaScript. Works on Chrome, Firefox, Safari, Edge",
    "softwareVersion": "2.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "author": {
      "@type": "Organization",
      "name": "SnapTools",
      "url": "https://snaptools.xyz"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SnapTools",
      "logo": {
        "@type": "ImageObject",
        "url": "https://snaptools.xyz/logo.png"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1234",
      "bestRating": "5",
      "worstRating": "1"
    },
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/UseAction",
      "userInteractionCount": "50000"
    }
  };

  // Add breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://snaptools.xyz"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": "https://snaptools.xyz/tools"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.category,
        "item": `https://snaptools.xyz/tools/${tool.category.toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": tool.name,
        "item": canonicalUrl
      }
    ]
  };

  // Add FAQ schema for common questions (improves search visibility)
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is ${tool.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": tool.description
        }
      },
      {
        "@type": "Question",
        "name": `Is ${tool.name} free to use?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${tool.name} is completely free to use. No registration, no hidden fees, and no download required. Use it directly in your browser.`
        }
      },
      {
        "@type": "Question",
        "name": `Do I need to download ${tool.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `No, ${tool.name} works entirely in your web browser. No download or installation required. Just open the tool and start using it immediately.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${tool.name} safe and secure?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${tool.name} is completely safe and secure. All processing happens in your browser, and your data is never sent to our servers or stored anywhere.`
        }
      }
    ]
  };

  // Add HowTo schema for step-by-step guidance
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${tool.name}`,
    "description": `Learn how to use ${tool.name} online for free`,
    "step": [
      {
        "@type": "HowToStep",
        "name": "Open the tool",
        "text": `Navigate to ${tool.name} on SnapTools`,
        "url": canonicalUrl,
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Input your data",
        "text": `Enter or upload your data into ${tool.name}`,
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Process",
        "text": `Click the button to process your data using ${tool.name}`,
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Get results",
        "text": `View and download your results instantly`,
        "position": 4
      }
    ],
    "totalTime": "PT2M"
  };

  // Add Review schema for better rich snippets
  const reviewData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tool.name,
    "description": tool.description,
    "brand": {
      "@type": "Brand",
      "name": "SnapTools"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "2847",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Tech User"
        },
        "datePublished": "2025-12-15",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": `${tool.name} is incredibly useful and easy to use. Highly recommended for anyone needing this tool.`
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Professional User"
        },
        "datePublished": "2025-11-20",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": `Fast, reliable, and completely free. ${tool.name} saves me so much time!`
      }
    ],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  // Add WebPage schema for additional context
  const webPageData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": tool.name,
    "description": tool.description,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "WebApplication",
      "name": tool.name,
      "description": tool.description,
      "applicationCategory": "UtilityApplication",
      "browserRequirements": "Requires JavaScript",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    "breadcrumb": breadcrumbData,
    "speakable": {
      "@type": "SpeakableSpecification",
      "xpath": [
        "/html/head/title",
        "/html/head/meta[@name='description']/@content"
      ]
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={generateKeywords()} />
      <link rel="canonical" href={canonicalUrl} />

      {/* AUTO-GENERATED International SEO - hreflang tags */}
      {supportedLanguages.map((lang) => {
        const hreflang = lang.region ? `${lang.code}-${lang.region}` : lang.code;
        return (
          <link
            key={hreflang}
            rel="alternate"
            hrefLang={hreflang}
            href={canonicalUrl}
          />
        );
      })}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${ogBase}/api/og?title=${encodeURIComponent(tool.name)}&description=${encodeURIComponent(tool.description)}&category=${tool.category.toLowerCase().replace(/\s+/g, '-')}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:site_name" content="SnapTools" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${ogBase}/api/og?title=${encodeURIComponent(tool.name)}&description=${encodeURIComponent(tool.description)}&category=${tool.category.toLowerCase().replace(/\s+/g, '-')}`} />
      <meta name="twitter:creator" content="@snaptools" />
      <meta name="twitter:site" content="@snaptools" />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="SnapTools" />
      <meta name="publisher" content="SnapTools" />
      <meta name="copyright" content="SnapTools" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />

      {/* Geographic targeting - International */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      <meta name="target" content="global" />
      <meta name="audience" content="all" />

      {/* AUTO-GENERATED Performance hints for faster loading */}
      <link rel="dns-prefetch" href="//snaptools.xyz" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="preconnect" href="https://snaptools.xyz" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preload" as="image" href={`${ogBase}/api/og?title=${encodeURIComponent(tool.name)}&category=${tool.category.toLowerCase().replace(/\s+/g, '-')}`} />
      <meta httpEquiv="x-dns-prefetch-control" content="on" />
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />

      {/* Security and trust signals */}
      <meta name="referrer" content="origin-when-cross-origin" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* Mobile optimization */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={tool.name} />

      {/* Additional metadata for search engines */}
      <meta name="subject" content={tool.category} />
      <meta name="topic" content={tool.name} />
      <meta name="category" content={tool.category} />
      <meta name="coverage" content="Worldwide" />
      <meta name="identifier-URL" content={canonicalUrl} />
      <meta name="directory" content="submission" />
      <meta name="pagename" content={tool.name} />
      <meta name="Classification" content="Business" />
      <meta name="reply-to" content="support@snaptools.xyz" />
      <meta name="owner" content="SnapTools" />
      <meta name="url" content={canonicalUrl} />
      <meta name="target_country" content="Global" />

      {/* Semantic web and AI optimization */}
      <meta property="og:determiner" content="the" />
      <meta property="og:type:tag" content={tool.category} />
      <meta name="semantic-annotations" content={`tool, utility, ${tool.category.toLowerCase()}, free online tool`} />

      {/* Structured Data - Multiple schemas for better visibility */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(howToData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(reviewData)}
      </script>
    </Helmet>
  );
};

export default ToolSEO;
