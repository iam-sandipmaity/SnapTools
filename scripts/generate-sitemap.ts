import { writeFileSync } from 'fs';
import { join } from 'path';
import { toolCategories } from '../src/data/tools';

const baseUrl = 'https://snaptools.xyz';
const currentDate = new Date().toISOString().split('T')[0];

// Static pages configuration
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/blog', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools', priority: '0.9', changefreq: 'weekly' },
  { path: '/features', priority: '0.8', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/donate', priority: '0.7', changefreq: 'monthly' },
  { path: '/documentation', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { path: '/terms', priority: '0.5', changefreq: 'yearly' },
];

// Blog posts configuration
const blogPosts = [
  { path: '/blog/posts/', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/posts/image-optimization-guide', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/posts/pdf-manipulation-techniques', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/posts/secure-password-guide', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/posts/qr-code-best-practices', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/posts/unit-conversion-guide', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/posts/developer-tool-kit-guide', priority: '0.8', changefreq: 'weekly' },
];

function generateUrlEntry(path: string, priority: string, changefreq: string): string {
  return `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSitemap(): string {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add static pages
  staticPages.forEach(page => {
    sitemap += generateUrlEntry(page.path, page.priority, page.changefreq) + '\n';
  });

  sitemap += '\n  <!-- Tool Categories -->\n';
  
  // Add tool category pages
  toolCategories.forEach(category => {
    sitemap += generateUrlEntry(`/tools/${category.id}`, '0.9', 'weekly') + '\n';
  });

  sitemap += '\n  <!-- Individual Tools -->\n';
  
  // Add individual tool pages
  toolCategories.forEach(category => {
    if (category.subTools && category.subTools.length > 0) {
      sitemap += `\n  <!-- ${category.title} Tools -->\n`;
      category.subTools.forEach(tool => {
        sitemap += generateUrlEntry(`/tools/${category.id}/${tool.id}`, '0.8', 'weekly') + '\n';
      });
    }
  });

  sitemap += '\n  <!-- Blog Posts -->\n';
  
  // Add blog posts
  blogPosts.forEach(post => {
    sitemap += generateUrlEntry(post.path, post.priority, post.changefreq) + '\n';
  });

  sitemap += '\n</urlset>';

  return sitemap;
}

function main() {
  try {
    const sitemap = generateSitemap();
    const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
    
    writeFileSync(outputPath, sitemap, 'utf-8');
    
    console.log('✅ Sitemap generated successfully!');
    console.log(`📝 Total tool categories: ${toolCategories.length}`);
    
    const totalTools = toolCategories.reduce((acc, cat) => acc + (cat.subTools?.length || 0), 0);
    console.log(`🔧 Total tools: ${totalTools}`);
    console.log(`📍 Output: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

main();
