import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toolCategories } from '../src/data/tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://snaptools.xyz';
const DIST_DIR = path.join(__dirname, '../dist');

interface MetaTags {
    title: string;
    description: string;
    image: string;
    url: string;
}

function getMetaTagsForRoute(pathname: string): MetaTags {
    // Default meta tags for home page
    let metaTags: MetaTags = {
        title: 'SnapTools - Free Online PDF, Image & Converter Tools | 100+ Free Tools',
        description: 'Free online tools for PDF (merge, split, compress), image processing (compress, convert, edit), converters, calculators, QR codes & more. No registration required. Fast, secure & privacy-focused. Try SnapTools now!',
        image: `${BASE_URL}/og-image.jpg`,
        url: BASE_URL,
    };

    // Parse the pathname to determine the route
    const pathParts = pathname.split('/').filter(Boolean);

    if (pathParts[0] === 'tools' && pathParts.length >= 2) {
        const categoryId = pathParts[1];
        const toolId = pathParts[2];

        const category = toolCategories.find((cat) => cat.id === categoryId);

        if (category) {
            const iconName = category.iconName || 'wrench';
            if (toolId) {
                // Tool page
                const tool = category.subTools?.find((t) => t.id === toolId);
                if (tool) {
                    const desc = tool.description || `Free online ${tool.title} tool by SnapTools. Use our ${tool.title.toLowerCase()} tool online for free. No registration required, fast, secure, and privacy-focused.`;
                    const ogImageUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(tool.title)}&description=${encodeURIComponent(desc)}&category=${categoryId}`;

                    metaTags = {
                        title: `${tool.title} - Free Online Tool | SnapTools`,
                        description: desc,
                        image: ogImageUrl,
                        url: `${BASE_URL}/tools/${categoryId}/${toolId}`,
                    };
                }
            } else {
                // Category page
                const desc = `Explore ${category.title} tools on SnapTools. Free online ${category.title.toLowerCase()} tools with no ads, no registration required. Fast, secure, and privacy-focused.`;
                const ogImageUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(category.title)}&description=${encodeURIComponent(desc)}&category=${categoryId}`;

                metaTags = {
                    title: `${category.title} Tools - Free Online ${category.title} Tools | SnapTools`,
                    description: desc,
                    image: ogImageUrl,
                    url: `${BASE_URL}/tools/${categoryId}`,
                };
            }
        }
    }

    return metaTags;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateHTML(metaTags: MetaTags, originalHTML: string): string {
    let html = originalHTML;

    // Escape meta tag values
    const title = escapeHtml(metaTags.title);
    const description = escapeHtml(metaTags.description);
    const url = escapeHtml(metaTags.url);
    const image = escapeHtml(metaTags.image);

    // Replace title
    html = html.replace(
        /<title>([\s\S]*?)<\/title>/i,
        `<title>${title}</title>`
    );

    // Replace meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/is,
        `<meta name="description" content="${description}" />`
    );

    // Replace canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
        `<link rel="canonical" href="${url}" />`
    );

    // Replace Open Graph tags
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/is,
        `<meta property="og:title" content="${title}" />`
    );

    html = html.replace(
        /<meta\s+property="og:description"[\s\S]*?content="[^"]*"\s*\/?>/is,
        `<meta property="og:description" content="${description}" />`
    );

    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/is,
        `<meta property="og:url" content="${url}" />`
    );

    html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/is,
        `<meta property="og:image" content="${image}" />`
    );

    // Update image type and alt based on source
    const isDynamicImage = image.includes('/api/og');
    const imageType = isDynamicImage ? 'image/png' : 'image/jpeg';

    html = html.replace(
        /<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/?>/is,
        `<meta property="og:image:type" content="${imageType}" />`
    );

    html = html.replace(
        /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/is,
        `<meta property="og:image:alt" content="${escapeHtml(metaTags.title)}" />`
    );

    // Replace Twitter Card tags
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/is,
        `<meta name="twitter:title" content="${title}" />`
    );

    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/is,
        `<meta name="twitter:description" content="${description}" />`
    );

    html = html.replace(
        /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/is,
        `<meta name="twitter:image" content="${image}" />`
    );

    return html;
}

async function generateStaticPages() {
    console.log('🚀 Generating static pages with dynamic meta tags...');

    // Read the base index.html
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) {
        console.error('❌ index.html not found in dist directory. Please run build first.');
        process.exit(1);
    }

    const baseHTML = fs.readFileSync(indexPath, 'utf-8');
    let pagesGenerated = 0;

    // Generate pages for each category
    for (const category of toolCategories) {
        const categoryPath = `/tools/${category.id}`;
        const categoryMetaTags = getMetaTagsForRoute(categoryPath);
        const categoryHTML = generateHTML(categoryMetaTags, baseHTML);

        // Create directory
        const categoryDir = path.join(DIST_DIR, 'tools', category.id);
        fs.mkdirSync(categoryDir, { recursive: true });

        // Write index.html for category
        fs.writeFileSync(path.join(categoryDir, 'index.html'), categoryHTML);
        pagesGenerated++;
        console.log(`✅ Generated: ${categoryPath}`);

        // Generate pages for each tool in the category
        if (category.subTools) {
            for (const tool of category.subTools) {
                const toolPath = `/tools/${category.id}/${tool.id}`;
                const toolMetaTags = getMetaTagsForRoute(toolPath);
                const toolHTML = generateHTML(toolMetaTags, baseHTML);

                // Create directory
                const toolDir = path.join(DIST_DIR, 'tools', category.id, tool.id);
                fs.mkdirSync(toolDir, { recursive: true });

                // Write index.html for tool
                fs.writeFileSync(path.join(toolDir, 'index.html'), toolHTML);
                pagesGenerated++;
                console.log(`✅ Generated: ${toolPath}`);
            }
        }
    }

    console.log(`\n🎉 Successfully generated ${pagesGenerated} static pages!`);
}

generateStaticPages().catch((error) => {
    console.error('❌ Error generating static pages:', error);
    process.exit(1);
});
