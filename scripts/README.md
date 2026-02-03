# Scripts Documentation

## Sitemap Generation

### Overview
The sitemap is automatically generated from the tools data structure, ensuring all tools are included without manual updates.

### How It Works
The `generate-sitemap.ts` script:
1. Reads tool categories and sub-tools from `src/data/tools.ts`
2. Includes all static pages (home, about, blog, etc.)
3. Generates category pages for each tool category
4. Generates individual pages for each tool
5. Includes blog posts
6. Outputs to `public/sitemap.xml`

### Usage

#### Generate Sitemap Manually
```bash
npm run generate:sitemap
```

#### Automatic Generation on Build
The sitemap is automatically generated before each production build:
```bash
npm run build
```

---

## RSS Feed Generation

### Overview
The RSS feed is automatically generated from blog posts and recent tool categories, allowing users to subscribe to SnapTools updates.

### How It Works
The `generate-rss.ts` script:
1. Includes all blog posts with titles and descriptions
2. Features the latest 3 tool categories added
3. Generates proper RSS 2.0 XML format
4. Includes channel metadata and images
5. Outputs to `public/rss.xml`

### Usage

#### Generate RSS Feed Manually
```bash
npm run generate:rss
```

#### Automatic Generation on Build
The RSS feed is automatically generated before each production build:
```bash
npm run build
```

### Feed URL
- **Production**: https://snaptools.xyz/rss.xml
- **Local**: http://localhost:5173/rss.xml

### Content Included
- ✅ All blog posts
- ✅ Latest tool categories
- ✅ Tool descriptions
- ✅ Publication dates
- ✅ Unique GUIDs

---

## Adding New Content

#### New Tools
1. Add tools to `src/data/tools.ts` in the appropriate category
2. The sitemap will automatically include them on next generation

#### New Categories
1. Add category to `toolCategories` array in `src/data/tools.ts`
2. The category page and all its tools will be included automatically

#### New Static Pages
1. Edit `scripts/generate-sitemap.ts`
2. Add page to the `staticPages` array with appropriate priority and changefreq

#### New Blog Posts
1. Edit `scripts/generate-sitemap.ts`
2. Add post to the `blogPosts` array
3. Also add to `scripts/generate-rss.ts` with title and description

### Configuration

#### Priority Values
- `1.0` - Homepage and primary pages
- `0.9` - Tool categories and main sections
- `0.8` - Individual tools and blog posts
- `0.7` - Secondary pages
- `0.5` - Legal pages

#### Change Frequency
- `weekly` - Tools, categories, and frequently updated content
- `monthly` - About, features, documentation
- `yearly` - Terms, privacy policy

### Output
- **Sitemap Location**: `public/sitemap.xml`
- **RSS Feed Location**: `public/rss.xml`
- **Format**: XML (Sitemap Protocol 0.9 / RSS 2.0)
- **Base URL**: https://snaptools.xyz
- **Last Modified**: Automatically set to current date

### Benefits
✅ No manual maintenance
✅ Always up-to-date with tool additions
✅ Consistent URL structure
✅ SEO-friendly with proper priorities
✅ Automatic inclusion in builds
✅ RSS feed for user subscriptions
✅ Content syndication ready
