import { Helmet } from "react-helmet-async";
import { toolCategories } from "@/data/tools";

export { default as ToolSEO } from './ToolSEO';

const BASE_URL = "https://snaptools.xyz";

interface SEOProps {
  title?: string;
  description?: string;
  categoryId?: string;
  toolId?: string;
  type?: "category" | "tool";
  imageUrl?: string;
  canonical?: string;
}

const SEO = ({ title, description, categoryId, toolId, type, imageUrl, canonical }: SEOProps) => {
  const category = categoryId ? toolCategories.find((cat) => cat.id === categoryId) : null;
  const tool = category?.subTools?.find((t) => t.id === toolId);

  // Enhanced keyword targeting
  const getKeywords = () => {
    if (type === "tool" && tool) {
      const toolName = tool.title.toLowerCase();
      return `${tool.title}, ${toolName} online, ${toolName} free, free ${toolName}, ${category?.title} tools, snaptools, snaptool, online tools, web tools, free tools`;
    }
    if (type === "category" && category) {
      return `${category.title} tools, free ${category.title.toLowerCase()} tools, online ${category.title.toLowerCase()}, snaptools, snaptool, web tools, productivity tools`;
    }
    return "snaptools, snaptool, free online tools, pdf tools, image tools, converter tools, calculator tools, web tools";
  };

  const pageTitle = title ||
    (type === "tool" && tool ? `${tool.title} - Free Online Tool | SnapTools` :
      type === "category" && category ? `${category.title} Tools - Free Online ${category.title} Tools | SnapTools` :
        "SnapTools - Free Online Tools for PDF, Image, Converter & More");

  const pageDescription = description ||
    (type === "tool" && tool ?
      `Free online ${tool.title} tool by SnapTools. ${tool.description || `Use our ${tool.title.toLowerCase()} tool online for free. No registration required, fast, secure, and privacy-focused.`}` :
      type === "category" && category ?
        `Explore ${category.title} tools on SnapTools. Free online ${category.title.toLowerCase()} tools with no ads, no registration required. Fast, secure, and privacy-focused.` :
        "SnapTools offers 200+ free online tools for PDF, images, converters, calculators, and more. No registration, no ads. Fast, secure, and privacy-focused.");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": pageTitle,
    "alternateName": type === "tool" && tool ? [tool.title, `${tool.title} Online`, `Free ${tool.title}`] : ["SnapTools", "SnapTool", "Snap Tools"],
    "description": pageDescription,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1524",
      "bestRating": "5",
      "worstRating": "1"
    },
    "url": canonical || `${BASE_URL}${window.location.pathname}`,
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "keywords": getKeywords()
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL
      },
      ...(category ? [
        {
          "@type": "ListItem",
          "position": 2,
          "name": category.title,
          "item": `${BASE_URL}/tools/${category.id}`
        }
      ] : []),
      ...(tool ? [
        {
          "@type": "ListItem",
          "position": 3,
          "name": tool.title,
          "item": `${BASE_URL}/tools/${category?.id}/${tool.id}`
        }
      ] : [])
    ]
  };

  const defaultImage = imageUrl || `${BASE_URL}/og-image.jpg`;

  return (
    <Helmet>
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <link rel="canonical" href={canonical || `${BASE_URL}${window.location.pathname}`} />

      {/* OpenGraph tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="SnapTools" />
      <meta property="og:url" content={canonical || `${BASE_URL}${window.location.pathname}`} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:site" content="@snaptools" />
      <meta name="twitter:creator" content="@snaptools" />
      <meta name="twitter:image" content={defaultImage} />
      <meta name="twitter:image:alt" content={pageTitle} />

      {/* Additional Meta Tags */}
      <meta name="author" content="SnapTools" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="SnapTools" />
      <meta name="apple-mobile-web-app-title" content="SnapTools" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="language" content="English" />
      <meta httpEquiv="content-language" content="en-US" />

      {/* Enhanced SEO Meta Tags */}
      <meta name="keywords" content={getKeywords()} />
      {category && <meta name="category" content={category.title} />}
      <meta name="rating" content="General" />
      <meta name="distribution" content="global" />
      <meta name="revisit-after" content="7 days" />
      <meta name="coverage" content="Worldwide" />
      <meta name="target" content="all" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
    </Helmet>
  );
};

export default SEO;
