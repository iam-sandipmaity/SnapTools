'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { AlertTriangle, Copy, Download, FileWarning, Shield, Info } from 'lucide-react';

const DisclaimerGenerator = () => {
  const [formData, setFormData] = useState({
    websiteName: '',
    websiteUrl: '',
    companyName: '',
    contactEmail: '',
    disclaimerType: 'general',
    hasAds: true,
    hasAffiliate: true,
    hasUserContent: false,
    isEducational: false,
  });

  const generateDisclaimer = () => {
    if (!formData.websiteName || !formData.websiteUrl) {
      toast.error('Please fill in required fields');
      return null;
    }

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const adsSection = formData.hasAds ? `
## Advertising Disclosure

Our website displays advertisements from third-party ad networks. ${formData.companyName || 'We'} are not responsible for the content of these advertisements or the practices of the advertisers.

Advertisers are responsible for ensuring that their advertisements comply with all applicable laws and regulations. Clicking on any advertisement on ${formData.websiteName} will take you to the advertiser's website.
` : '';

    const affiliateSection = formData.hasAffiliate ? `
## Affiliate Disclosure

${formData.websiteName} participates in various affiliate marketing programs. This means we may earn commissions on products or services purchased through our links to affiliate sites.

We recommend only products or services that we genuinely believe will add value to our users. The commission we receive helps support our website and continue providing free content.
` : '';

    const userContentSection = formData.hasUserContent ? `
## User-Generated Content

Users may submit comments, reviews, or other content to ${formData.websiteName}. We are not responsible for any user-generated content posted on our website.

Users are solely responsible for ensuring their submissions do not violate any third-party rights or applicable laws. We reserve the right to remove any content at our sole discretion.
` : '';

    const educationalSection = formData.isEducational ? `
## Educational/Informational Purpose

The content provided on ${formData.websiteName} is for educational and informational purposes only. We strive to provide accurate and up-to-date information, but we cannot guarantee the completeness or accuracy of all content.

The information on this website should not be construed as professional advice. Always consult with qualified professionals for specific advice related to your situation.
` : '';

    const disclaimer = `# Disclaimer for ${formData.websiteName}

Last Updated: ${currentDate}

## 1. General Disclaimer

${formData.websiteName} (accessible at ${formData.websiteUrl}) is provided by ${formData.companyName || 'us'}. By using this website, you acknowledge and agree to the terms of this disclaimer.

The information provided on this website is for general informational and educational purposes only. We strive to keep the information accurate and up to date, but we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained on the website.

${educationalSection}

## 2. No Professional Advice

Nothing on this website constitutes professional advice. The content is for general information purposes only.

If you require professional advice (legal, medical, financial, etc.), you should consult with a qualified professional in the relevant field.

## 3. Limitation of Liability

In no event will ${formData.companyName || 'we'} be liable for any loss or damage, including without limitation, indirect or consequential loss or damage, arising out of or in connection with the use of this website.

${formData.hasAds || formData.hasAffiliate ? `
## 4. External Links

Our website may contain links to external websites that are not provided or maintained by ${formData.companyName || 'us'}. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
` : ''}

${adsSection}

${affiliateSection}

${userContentSection}

## 5. Consent

By using our website, you hereby consent to our disclaimer and agree to its terms.

## 6. Changes to This Disclaimer

We may update this disclaimer from time to time. We will notify you of any changes by posting the new disclaimer on this page.

## 7. Contact Us

If you have any questions about this disclaimer, please contact us:
- Website: ${formData.websiteUrl}
- Email: ${formData.contactEmail || 'contact@example.com'}
`;

    return disclaimer;
  };

  const handleCopy = () => {
    const disclaimer = generateDisclaimer();
    if (disclaimer) {
      navigator.clipboard.writeText(disclaimer);
      toast.success('Disclaimer copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const disclaimer = generateDisclaimer();
    if (disclaimer) {
      const blob = new Blob([disclaimer], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'disclaimer.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Disclaimer downloaded!');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-primary" />
          Disclaimer Generator
        </h1>
        <p className="text-muted-foreground">
          Generate a legal disclaimer for your website
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter your website details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="websiteName">Website Name *</Label>
                <Input
                  id="websiteName"
                  placeholder="My Awesome Website"
                  value={formData.websiteName}
                  onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="websiteUrl">Website URL *</Label>
                <Input
                  id="websiteUrl"
                  placeholder="https://example.com"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company/Owner Name</Label>
                <Input
                  id="companyName"
                  placeholder="My Company Inc."
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Disclaimer Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAds"
                  checked={formData.hasAds}
                  onCheckedChange={(c) => setFormData({ ...formData, hasAds: !!c })}
                />
                <Label htmlFor="hasAds">Shows Ads</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAffiliate"
                  checked={formData.hasAffiliate}
                  onCheckedChange={(c) => setFormData({ ...formData, hasAffiliate: !!c })}
                />
                <Label htmlFor="hasAffiliate">Has Affiliate Links</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasUserContent"
                  checked={formData.hasUserContent}
                  onCheckedChange={(c) => setFormData({ ...formData, hasUserContent: !!c })}
                />
                <Label htmlFor="hasUserContent">User-Generated Content</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEducational"
                  checked={formData.isEducational}
                  onCheckedChange={(c) => setFormData({ ...formData, isEducational: !!c })}
                />
                <Label htmlFor="isEducational">Educational Content</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleCopy} className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copy to Clipboard
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Markdown
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerGenerator;
