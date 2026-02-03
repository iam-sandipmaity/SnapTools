import { writeFileSync } from 'fs';
import { join } from 'path';
import { toolCategories } from '../src/data/tools';

const baseUrl = 'https://snaptools.xyz';
const currentDate = new Date().toISOString();

// Blog posts configuration with descriptions
const blogPosts = [
  {
    title: 'Complete Guide to Image Optimization',
    path: '/blog/posts/image-optimization-guide',
    description: 'Learn professional techniques for optimizing images for web, reducing file sizes while maintaining quality, and improving website performance.',
    pubDate: '2024-12-09T10:00:00Z'
  },
  {
    title: 'PDF Manipulation Techniques',
    path: '/blog/posts/pdf-manipulation-techniques',
    description: 'Master PDF manipulation with comprehensive techniques for merging, splitting, compressing, and securing PDF documents.',
    pubDate: '2024-12-09T10:00:00Z'
  },
  {
    title: 'Secure Password Guide',
    path: '/blog/posts/secure-password-guide',
    description: 'Essential guide to creating and managing secure passwords, understanding password strength, and implementing best security practices.',
    pubDate: '2024-12-09T10:00:00Z'
  },
  {
    title: 'QR Code Best Practices',
    path: '/blog/posts/qr-code-best-practices',
    description: 'Learn QR code best practices including optimal sizes, error correction levels, design considerations, and effective usage scenarios.',
    pubDate: '2024-12-09T10:00:00Z'
  },
  {
    title: 'Unit Conversion Guide',
    path: '/blog/posts/unit-conversion-guide',
    description: 'Comprehensive guide to unit conversions covering length, weight, temperature, speed, and other common measurement systems.',
    pubDate: '2024-12-09T10:00:00Z'
  },
  {
    title: 'Developer Toolkit Guide',
    path: '/blog/posts/developer-tool-kit-guide',
    description: 'Essential developer toolkit guide featuring code formatters, converters, debugging tools, and productivity enhancers for modern development.',
    pubDate: '2024-12-09T10:00:00Z'
  }
];

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRssItem(item: {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}): string {
  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${item.guid}</guid>
    </item>`;
}

function generateRssFeed(): string {
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SnapTools - Free Online Developer Tools</title>
    <link>${baseUrl}</link>
    <description>Discover 100+ free online tools for developers, designers, and content creators. Image converters, PDF tools, code formatters, calculators, and more.</description>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>SnapTools</title>
      <link>${baseUrl}</link>
    </image>

`;

  // Add blog posts
  blogPosts.forEach(post => {
    rss += generateRssItem({
      title: post.title,
      link: `${baseUrl}${post.path}`,
      description: post.description,
      pubDate: post.pubDate,
      guid: `${baseUrl}${post.path}`
    }) + '\n';
  });

  // Add all tool categories
  toolCategories.forEach(category => {
    if (category.subTools && category.subTools.length > 0) {
      rss += generateRssItem({
        title: `${category.title} - ${category.subTools.length} Tools Available`,
        link: `${baseUrl}/tools/${category.id}`,
        description: category.description || `Discover ${category.subTools.length} powerful ${category.title.toLowerCase()} including: ${category.subTools.slice(0, 5).map(t => t.title).join(', ')}${category.subTools.length > 5 ? ', and more' : ''}.`,
        pubDate: currentDate,
        guid: `${baseUrl}/tools/${category.id}`
      }) + '\n';
      
      // Add individual tools from each category (first 3 from each)
      category.subTools.slice(0, 3).forEach(tool => {
        rss += generateRssItem({
          title: `${tool.title} - ${category.title}`,
          link: `${baseUrl}/tools/${category.id}/${tool.id}`,
          description: tool.description || `Use our free ${tool.title} tool. Part of our ${category.title} collection with ${category.subTools!.length} powerful utilities.`,
          pubDate: currentDate,
          guid: `${baseUrl}/tools/${category.id}/${tool.id}`
        }) + '\n';
      });
    }
  });

  rss += `  </channel>
</rss>`;

  return rss;
}

function main() {
  try {
    const rss = generateRssFeed();
    const outputPath = join(process.cwd(), 'public', 'rss.xml');
    
    writeFileSync(outputPath, rss, 'utf-8');
    
    const totalTools = toolCategories.reduce((acc, cat) => acc + (cat.subTools?.length || 0), 0);
    const toolsInFeed = toolCategories.reduce((acc, cat) => acc + Math.min(3, cat.subTools?.length || 0), 0);
    
    console.log('✅ RSS feed generated successfully!');
    console.log(`📰 Blog posts: ${blogPosts.length}`);
    console.log(`📂 Tool categories: ${toolCategories.length}`);
    console.log(`🔧 Featured tools: ${toolsInFeed} (3 per category)`);
    console.log(`📊 Total tools available: ${totalTools}`);
    console.log(`📍 Output: ${outputPath}`);
    console.log(`🌐 Available at: ${baseUrl}/rss.xml`);
  } catch (error) {
    console.error('❌ Error generating RSS feed:', error);
    process.exit(1);
  }
}

main();
