# Dynamic Open Graph Meta Tags Solution

## Problem
Social media platforms (Facebook, Twitter, LinkedIn, WhatsApp, etc.) were showing the same preview for all pages because:
1. The app is a Single Page Application (SPA) built with Vite + React
2. Social media crawlers don't execute JavaScript
3. They only see the static HTML in `index.html` with default meta tags
4. React Helmet updates meta tags client-side, which crawlers don't see

## Solution
We implemented a **static page generation** approach that creates individual HTML files for each route with the correct meta tags during build time.

### How It Works

1. **Build Script** (`scripts/generate-static-pages.ts`):
   - Runs automatically after `npm run build`
   - Reads the base `index.html` from the `dist` folder
   - Generates a unique HTML file for each route with proper meta tags
   - Creates the following structure:
     ```
     dist/
     ├── index.html (home page)
     └── tools/
         ├── pdf/
         │   ├── index.html (PDF category page)
         │   ├── pdf-merger/
         │   │   └── index.html (PDF Merger tool page)
         │   └── ...
         └── ...
     ```

2. **Meta Tags Updated**:
   - `<title>`
   - `<meta name="description">`
   - `<link rel="canonical">`
   - `<meta property="og:title">`
   - `<meta property="og:description">`
   - `<meta property="og:url">`
   - `<meta property="og:image">`
   - `<meta name="twitter:title">`
   - `<meta name="twitter:description">`
   - `<meta name="twitter:image">`

3. **Vercel Configuration** (`vercel.json`):
   - Already configured with rewrites to serve the correct HTML file
   - When a user visits `/tools/pdf/pdf-merger`, Vercel serves `/tools/pdf/pdf-merger/index.html`
   - This HTML file has the correct meta tags for social media crawlers

### Benefits

✅ **Works with all social media platforms**: Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Discord, etc.
✅ **No server-side rendering needed**: Pure static files
✅ **Fast**: No runtime overhead
✅ **SEO-friendly**: Each page has unique meta tags
✅ **Automatic**: Runs on every build
✅ **Scalable**: Generates pages for all tools automatically

### Generated Pages

The script generates **223 static pages** including:
- 1 home page
- 30+ category pages
- 190+ tool pages

### Testing

To test if the meta tags are working:

1. **Local Testing**:
   ```bash
   npm run build
   npm run preview
   ```
   Then check the source code of any page (View Page Source)

2. **Online Testing** (after deployment):
   - Facebook Debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
   - Open Graph Debugger: https://www.opengraph.xyz/

### Maintenance

**Adding New Tools**:
No additional work needed! The script automatically reads from `src/data/tools.ts` and generates pages for all tools.

**Updating Meta Tags**:
1. Update the meta tag logic in `scripts/generate-static-pages.ts`
2. Run `npm run build` to regenerate all pages

**Custom OG Images** (Future Enhancement):
To add custom OG images for each tool:
1. Generate images and save them in `public/og-images/`
2. Update the `getMetaTagsForRoute` function to return the correct image path

### Build Process

```bash
npm run build
```

This runs:
1. `generate:sitemap` - Generate sitemap.xml
2. `generate:rss` - Generate RSS feed
3. `generate:timezones` - Generate timezone data
4. `vite build` - Build the React app
5. `generate:static-pages` - Generate static pages with meta tags ✨

### Deployment

The solution works automatically on Vercel:
1. Push to GitHub
2. Vercel builds the project
3. Static pages are generated
4. Social media crawlers see the correct meta tags

### Notes

- The React app still works normally for users (client-side routing)
- Only crawlers see the static HTML
- Users get the full interactive React experience
- No performance impact on the app

## Files Modified

1. `scripts/generate-static-pages.ts` - New script to generate static pages
2. `package.json` - Updated build script to run the generator
3. `vercel.json` - Already configured correctly (no changes needed)

## Troubleshooting

**Issue**: Meta tags not updating
- **Solution**: Clear cache and rebuild: `npm run build`

**Issue**: Social media still showing old preview
- **Solution**: Use the platform's debugger tool to refresh the cache

**Issue**: Script fails during build
- **Solution**: Ensure `dist/index.html` exists before running the script
