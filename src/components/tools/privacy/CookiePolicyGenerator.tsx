'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Cookie, Copy, Download, Shield, Eye, Settings } from 'lucide-react';

const CookiePolicyGenerator = () => {
  const [formData, setFormData] = useState({
    websiteName: '',
    websiteUrl: '',
    contactEmail: '',
    cookiesUsed: [] as string[],
    thirdParty: [] as string[],
    consentType: 'explicit',
  });

  const cookieTypes = [
    { id: 'essential', label: 'Essential Cookies', description: 'Necessary for the website to function' },
    { id: 'analytics', label: 'Analytics Cookies', description: 'Help us understand how visitors use our site' },
    { id: 'marketing', label: 'Marketing Cookies', description: 'Used to deliver relevant advertisements' },
    { id: 'functional', label: 'Functional Cookies', description: 'Enable enhanced functionality' },
    { id: 'social', label: 'Social Media Cookies', description: 'Allow sharing on social media platforms' },
  ];

  const thirdPartyCookies = [
    { id: 'google_analytics', label: 'Google Analytics' },
    { id: 'facebook_pixel', label: 'Facebook Pixel' },
    { id: 'google_ads', label: 'Google Ads' },
    { id: 'hotjar', label: 'Hotjar' },
    { id: 'intercom', label: 'Intercom' },
    { id: 'stripe', label: 'Stripe' },
  ];

  const generatePolicy = () => {
    if (!formData.websiteName || !formData.websiteUrl || !formData.contactEmail) {
      toast.error('Please fill in all required fields');
      return null;
    }

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const cookieDetails = formData.cookiesUsed.map(id => {
      const cookie = cookieTypes.find(c => c.id === id);
      return cookie ? `### ${cookie.label}\n${cookie.description}` : null;
    }).filter(Boolean).join('\n\n');

    const thirdPartyDetails = formData.thirdParty.map(id => {
      const service = thirdPartyCookies.find(t => t.id === id);
      return service ? `- ${service.label}` : null;
    }).filter(Boolean).join('\n');

    const policy = `# Cookie Policy for ${formData.websiteName}

Last Updated: ${currentDate}

## 1. Introduction

This Cookie Policy explains what Cookies are and how ${formData.websiteName} ("we," "our," or "us") uses them on our website at ${formData.websiteUrl}.

By using our Website, you consent to the use of cookies as described in this policy.

## 2. What Are Cookies?

Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.

## 3. How We Use Cookies

We use the following types of cookies:

${cookieDetails || 'We do not use cookies on our website.'}

## 4. Third-Party Cookies

The following third-party services may set cookies on our website:

${thirdPartyDetails || 'We do not use any third-party cookies.'}

## 5. Managing Your Cookie Preferences

You can control and manage cookies in various ways:

### Browser Settings
Most web browsers allow you to control cookies through their settings. You can:
- View what cookies are stored on your device
- Delete all or specific cookies
- Block all or certain types of cookies
- Set preferences for certain websites

### Opt-Out Links
You can opt out of specific third-party cookies:
- Google Analytics: https://tools.google.com/dlpage/gaoptout
- Facebook: https://www.facebook.com/settings/?tab=ads

## 6. Cookie Consent

${formData.consentType === 'explicit' 
  ? 'We use explicit cookie consent. Users must actively accept our cookie policy before non-essential cookies are placed on their device.' 
  : 'We use implied consent. By continuing to use our website, you consent to our use of cookies.'}

## 7. Updates to This Policy

We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.

## 8. Contact Us

If you have questions about our Cookie Policy, please contact us at:
- Email: ${formData.contactEmail}
- Website: ${formData.websiteUrl}
`;

    return policy;
  };

  const handleCopy = () => {
    const policy = generatePolicy();
    if (policy) {
      navigator.clipboard.writeText(policy);
      toast.success('Cookie Policy copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const policy = generatePolicy();
    if (policy) {
      const blob = new Blob([policy], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cookie-policy.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Cookie Policy downloaded!');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Cookie className="h-8 w-8 text-primary" />
          Cookie Policy Generator
        </h1>
        <p className="text-muted-foreground">
          Generate a cookie consent policy for your website
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
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="privacy@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="consentType">Consent Type</Label>
                <Select value={formData.consentType} onValueChange={(v) => setFormData({ ...formData, consentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="explicit">Explicit Consent (GDPR)</SelectItem>
                    <SelectItem value="implied">Implied Consent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Cookies You Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {cookieTypes.map((cookie) => (
                <div key={cookie.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={cookie.id}
                    checked={formData.cookiesUsed.includes(cookie.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({ ...formData, cookiesUsed: [...formData.cookiesUsed, cookie.id] });
                      } else {
                        setFormData({ ...formData, cookiesUsed: formData.cookiesUsed.filter(c => c !== cookie.id) });
                      }
                    }}
                  />
                  <div>
                    <Label htmlFor={cookie.id} className="font-medium">{cookie.label}</Label>
                    <p className="text-sm text-muted-foreground">{cookie.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Third-Party Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {thirdPartyCookies.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={service.id}
                    checked={formData.thirdParty.includes(service.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({ ...formData, thirdParty: [...formData.thirdParty, service.id] });
                      } else {
                        setFormData({ ...formData, thirdParty: formData.thirdParty.filter(t => t !== service.id) });
                      }
                    }}
                  />
                  <Label htmlFor={service.id} className="text-sm">{service.label}</Label>
                </div>
              ))}
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

export default CookiePolicyGenerator;
