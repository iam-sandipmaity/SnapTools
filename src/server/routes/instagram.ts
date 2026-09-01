import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const MEDIA_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const rateBuckets = new Map<string, number[]>();

function isRateLimited(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (rateBuckets.get(key) || []).filter((ts) => now - ts < windowMs);
  if (recent.length >= limit) {
    rateBuckets.set(key, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(key, recent);
  return false;
}

function isAllowedImageHost(imageUrl: string): boolean {
  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== 'https:') return false;
    return /(^|\.)(cdninstagram\.com|fbcdn\.net|instagram\.com)$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

router.get('/photo/:mediaId', async (req, res) => {
  try {
    const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(`ig:${clientKey}`)) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const { mediaId } = req.params;
    if (!MEDIA_ID_PATTERN.test(mediaId)) {
      return res.status(400).json({ error: 'Invalid media id' });
    }

    const response = await fetch(`https://www.instagram.com/p/${mediaId}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch photo data');
    }

    const html = await response.text();
    const match = html.match(/"display_url":"([^"]+)"/);
    const imageUrl = match ? match[1].replace(/\\u0026/g, '&') : null;

    if (!imageUrl || !isAllowedImageHost(imageUrl)) {
      throw new Error('Photo not found');
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const contentType = imageResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('Invalid content type received from Instagram');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    await new Promise((resolve, reject) => {
      imageResponse.body.pipe(res)
        .on('finish', resolve)
        .on('error', reject);
    });

  } catch (error) {
    console.error('Instagram API error:', error);
    res.status(500).json({ error: 'Failed to fetch Instagram photo' });
  }
});

export default router;
