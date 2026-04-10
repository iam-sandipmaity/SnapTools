'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Copy, Download, Shield, CheckCircle, Globe, Database, Eye, Mail, Server } from 'lucide-react';

const PrivacyPolicyGenerator = () => {
  const [formData, setFormData] = useState({
    websiteName: '',
    websiteUrl: '',
    companyName: '',
    contactEmail: '',
    country: 'India',
    collectsData: [] as string[],
    thirdParty: [] as string[],
    userAge: '13',
    dataRetention: '12',
    cookies: 'yes',
    gdpr: 'yes',
    ccpa: 'no',
  });

  const dataTypes = [
    { id: 'email', label: 'Email Address' },
    { id: 'name', label: 'Name' },
    { id: 'phone', label: 'Phone Number' },
    { id: 'address', label: 'Physical Address' },
    { id: 'payment', label: 'Payment Information' },
    { id: 'cookies', label: 'Cookies & Tracking' },
    { id: 'device', label: 'Device Information' },
    { id: 'ip', label: 'IP Address' },
  ];

  const thirdPartyServices = [
    { id: 'google_analytics', label: 'Google Analytics' },
    { id: 'facebook_pixel', label: 'Facebook Pixel' },
    { id: 'stripe', label: 'Stripe Payments' },
    { id: 'razorpay', label: 'Razorpay Payments' },
    { id: 'aws', label: 'AWS' },
    { id: 'firebase', label: 'Firebase' },
  ];

  const generatePolicy = () => {
    if (!formData.websiteName || !formData.websiteUrl || !formData.contactEmail) {
      toast.error('Please fill in all required fields');
      return null;
    }

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const dataCollectionSection = formData.collectsData.length > 0 
      ? formData.collectsData.map(id => {
          const item = dataTypes.find(d => d.id === id);
          return item ? `      - ${item.label}` : null;
        }).filter(Boolean).join('\n')
      : '      - No personal data collected';

    const thirdPartySection = formData.thirdParty.length > 0
      ? formData.thirdParty.map(id => {
          const service = thirdPartyServices.find(s => s.id === id);
          return service ? `      - ${service.label}` : null;
        }).filter(Boolean).join('\n')
      : '      - No third-party services used';

    const policy = `# Privacy Policy for ${formData.websiteName}

Last Updated: ${currentDate}

## 1. Introduction

Welcome to ${formData.websiteName} ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website: ${formData.websiteUrl}

By accessing or using our Website, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.

## 2. Information We Collect

We may collect personal information that you voluntarily provide to us when you:

- Register on the Website
- Express an interest in obtaining information about us or our products and services
- Participate in activities on the Website
- Contact us

### Personal Information We Collect:

${dataCollectionSection}

## 3. How We Use Your Information

We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.

- To facilitate account creation and logon functionality
- To send administrative information to you
- To fulfill and manage your orders
- To post testimonials
- To request feedback
- To protect our Services

## 4. Sharing Your Information

We may share your information with the following third parties:

${thirdPartySection}

## 5. Cookies and Tracking Technologies

${formData.cookies === 'yes' ? 'We use cookies and similar tracking technologies to track the activity on our Website and store certain information.' : 'We do not use cookies or tracking technologies.'}

## 6. Data Retention

We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, specifically for ${formData.dataRetention} months, or as longer if required by law.

## 7. Your Rights

### GDPR Rights (European Union)
${formData.gdpr === 'yes' ? 'If you are located in the EU, you have certain rights under GDPR:' : 'GDPR rights are not applicable to this website.'}
${formData.gdpr === 'yes' ? '- The right to access your personal data' : ''}
${formData.gdpr === 'yes' ? '- The right to rectification of your personal data' : ''}
${formData.gdpr === 'yes' ? '- The right to erasure of your personal data' : ''}
${formData.gdpr === 'yes' ? '- The right to restrict processing' : ''}
${formData.gdpr === 'yes' ? '- The right to data portability' : ''}
${formData.gdpr === 'yes' ? '- The right to object to processing' : ''}

### CCPA Rights (California)
${formData.ccpa === 'yes' ? 'If you are a California resident, you have certain rights under CCPA:' : 'CCPA rights are not applicable to this website.'}

## 8. Children's Privacy

Our Website is not intended for children under ${formData.userAge} years of age. We do not knowingly collect personal information from children under ${formData.userAge}.

## 9. Contact Us

If you have questions or comments about this Privacy Policy, please contact us:

- Website: ${formData.websiteUrl}
- Email: ${formData.contactEmail}
- Country: ${formData.country}
`;

    return policy;
  };

  const handleCopy = () => {
    const policy = generatePolicy();
    if (policy) {
      navigator.clipboard.writeText(policy);
      toast.success('Privacy Policy copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const policy = generatePolicy();
    if (policy) {
      const blob = new Blob([policy], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'privacy-policy.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Privacy Policy downloaded!');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Privacy Policy Generator
        </h1>
        <p className="text-muted-foreground">
          Generate a GDPR-compliant privacy policy for your website
        </p>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
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
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="My Company Inc."
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Collection
            </CardTitle>
            <CardDescription>Select what data you collect from users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dataTypes.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={formData.collectsData.includes(item.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({ ...formData, collectsData: [...formData.collectsData, item.id] });
                      } else {
                        setFormData({ ...formData, collectsData: formData.collectsData.filter(d => d !== item.id) });
                      }
                    }}
                  />
                  <Label htmlFor={item.id} className="text-sm">{item.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Third Party Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Third-Party Services
            </CardTitle>
            <CardDescription>Select any third-party services you use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {thirdPartyServices.map((service) => (
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

        {/* Compliance Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Compliance Options
            </CardTitle>
            <CardDescription>Select applicable privacy regulations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Minimum User Age</Label>
                <Select value={formData.userAge} onValueChange={(v) => setFormData({ ...formData, userAge: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="13">13 years</SelectItem>
                    <SelectItem value="16">16 years</SelectItem>
                    <SelectItem value="18">18 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data Retention Period</Label>
                <Select value={formData.dataRetention} onValueChange={(v) => setFormData({ ...formData, dataRetention: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Use Cookies?</Label>
                <Select value={formData.cookies} onValueChange={(v) => setFormData({ ...formData, cookies: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gdpr"
                  checked={formData.gdpr === 'yes'}
                  onCheckedChange={(checked) => setFormData({ ...formData, gdpr: checked ? 'yes' : 'no' })}
                />
                <Label htmlFor="gdpr">Include GDPR Compliance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ccpa"
                  checked={formData.ccpa === 'yes'}
                  onCheckedChange={(checked) => setFormData({ ...formData, ccpa: checked ? 'yes' : 'no' })}
                />
                <Label htmlFor="ccpa">Include CCPA Compliance</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
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

export default PrivacyPolicyGenerator;
