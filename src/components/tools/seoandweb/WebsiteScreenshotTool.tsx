import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function WebsiteScreenshotTool() {
  const [url, setUrl] = useState('');
  const [deviceType, setDeviceType] = useState('desktop');
  const [loading, setLoading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [error, setError] = useState('');

  const deviceViewports = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  };

  const takeScreenshot = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Using APIFlash service for screenshots
      const apiUrl = 'https://api.apiflash.com/v1/urltoimage';
      const apiKey = import.meta.env.VITE_APIFLASH_API_KEY || '';
      
      if (!apiKey) {
        setError('API key not configured. Please set VITE_APIFLASH_API_KEY in your environment variables.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        'access_key': apiKey,
        'url': url,
        'width': deviceViewports[deviceType].width.toString(),
        'height': deviceViewports[deviceType].height.toString(),
        'wait_until': 'page_loaded',
        'format': 'jpeg',
        'quality': '100',
        'response_type': 'image'
      });

      const screenshotUrl = `${apiUrl}?${params.toString()}`;
      setScreenshotUrl(screenshotUrl);
    } catch (err) {
      setError('Failed to generate screenshot URL. Please try again.');
      console.error('Screenshot error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError('');
  };

  const handleDeviceChange = (value: string) => {
    setDeviceType(value);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(screenshotUrl);
      if (!response.ok) throw new Error('Failed to download image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `screenshot-${new Date().getTime()}.jpg`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download screenshot. Please try again.');
      console.error('Download error:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Website Screenshot Tool</h1>

      <Card className="p-4 space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter website URL (e.g., https://example.com)"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Device Type</Label>
            <Select value={deviceType} onValueChange={handleDeviceChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <Button
            onClick={takeScreenshot}
            disabled={loading || !url}
            className="w-full"
          >
            {loading ? 'Capturing...' : 'Take Screenshot'}
          </Button>
        </div>
      </Card>

      {screenshotUrl && (
        <Card className="p-4 space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Screenshot Preview</h2>
            <div className="border rounded-lg overflow-hidden">
              <img
                src={screenshotUrl}
                alt="Website Screenshot"
                className="w-full h-auto"
                onError={() => setError('Failed to load screenshot. Please try again.')}
              />
            </div>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              Download Screenshot
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="text-sm text-gray-500">
          <h3 className="font-semibold mb-2">Note:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure to enter the complete URL including http:// or https://</li>
            <li>Some websites may block screenshot capture due to their security settings</li>
            <li>The screenshot quality may vary based on the website's content and chosen device type</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}