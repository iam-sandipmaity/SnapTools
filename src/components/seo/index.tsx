import { Helmet } from "react-helmet";
import { toolCategories } from "@/data/tools";

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

  const pageTitle = title || 
    (type === "tool" && tool ? `${tool.title} - Free Online Tool` : 
    type === "category" && category ? `${category.title} - Free Online Tools` : 
    "Free Online Tools");

  const pageDescription = description || 
    (type === "tool" && tool ? 
      `Use our free online ${tool.title.toLowerCase()} tool. ${tool.description || ""}` :
    type === "category" && category ? 
      `Explore our collection of free ${category.title.toLowerCase()} tools. No ads, no registration required.` :
    "Free online tools for developers and professionals. No ads, no registration required.");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": pageTitle,
    "description": pageDescription,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    },
    "url": canonical || `${BASE_URL}${window.location.pathname}`,
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "license": "https://creativecommons.org/licenses/by/4.0/"
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

  return (
    <Helmet>
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonical || `${BASE_URL}${window.location.pathname}`} />

      {/* OpenGraph tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="SnapTools" />
      <meta property="og:url" content={canonical || `${BASE_URL}${window.location.pathname}`} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:site" content="@snaptools" />
      <meta name="twitter:creator" content="@snaptools" />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {imageUrl && <meta name="twitter:image:alt" content={pageTitle} />}

      {/* Additional Meta Tags */}
      <meta name="author" content="SnapTools" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="SnapTools" />
      <meta name="apple-mobile-web-app-title" content="SnapTools" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="language" content="English" />
      
      {/* Additional SEO Meta Tags */}
      {category && <meta name="category" content={category.title} />}
      {tool && <meta name="keywords" content={`${tool.title}, free online tool, ${category?.title}, web tools, developer tools, productivity tools`} />}

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