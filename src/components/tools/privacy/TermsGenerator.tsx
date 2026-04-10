'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { FileText, Copy, Download, Scale, Globe, CreditCard, Shield, Users } from 'lucide-react';

const TermsGenerator = () => {
  const [formData, setFormData] = useState({
    websiteName: '',
    websiteUrl: '',
    companyName: '',
    contactEmail: '',
    country: 'India',
    businessType: 'ecommerce',
    hasPayments: true,
    hasUserAccounts: true,
    hasNewsletter: true,
    allowsRefund: true,
    refundDays: '30',
    governingLaw: 'India',
  });

  const generateTerms = () => {
    if (!formData.websiteName || !formData.websiteUrl || !formData.contactEmail) {
      toast.error('Please fill in all required fields');
      return null;
    }

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const refundSection = formData.allowsRefund ? `
## Refund Policy

${formData.companyName || 'We'} offers a ${formData.refundDays}-day money-back guarantee for all our products and services. If you are not satisfied with your purchase, you may request a refund within ${formData.refundDays} days of the original purchase date.

To request a refund, please contact us at ${formData.contactEmail} with your order details.

Refunds will be processed within 5-7 business days after approval. The refund will be credited to the original payment method used during purchase.
` : '';

    const paymentSection = formData.hasPayments ? `
## Payment Terms

All payments are processed securely through our payment partners. We accept major credit cards, debit cards, and digital payment methods.

When you make a purchase, you agree to provide accurate payment information. You authorize us to charge the specified amount to your payment method.

Prices for our products are subject to change without notice. We reserve the right to modify or discontinue any product at any time.
` : '';

    const accountSection = formData.hasUserAccounts ? `
## Account Responsibilities

When you create an account on ${formData.websiteName}, you agree to:

- Provide accurate and complete information
- Maintain the security of your account credentials
- Notify us immediately of any unauthorized access
- Accept responsibility for all activities under your account

We reserve the right to suspend or terminate accounts that violate these terms.
` : '';

    const newsletterSection = formData.hasNewsletter ? `
## Newsletter & Communications

By subscribing to our newsletter, you consent to receive promotional emails from ${formData.websiteName}. You can unsubscribe at any time by clicking the "unsubscribe" link in any newsletter email.

We will never share your email with third parties for marketing purposes without your consent.
` : '';

    const terms = `# Terms and Conditions for ${formData.websiteName}

Last Updated: ${currentDate}

## 1. Introduction

Welcome to ${formData.websiteName} ("we," "our," or "us"). By accessing and using our website at ${formData.websiteUrl} (the "Website"), you agree to be bound by these Terms and Conditions ("Terms").

If you do not agree to these Terms, please do not use our Website.

## 2. Use License

Permission is granted to temporarily use ${formData.websiteName} for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

- Modify or copy the materials
- Use the materials for any commercial purpose or public display
- Attempt to reverse engineer any software contained on the Website
- Transfer the materials to another person or "mirror" the materials on any other server

This license shall automatically terminate if you violate any of these restrictions and may be terminated by ${formData.companyName || 'us'} at any time.

## 3. User Conduct

When using our Website, you agree to:

- Not use the Website in any way that may damage, disable, overburden, or impair the Website
- Not use any device, software, or routine to interfere with the proper working of the Website
- Not attempt to gain unauthorized access to any parts of the Website

${accountSection}

${paymentSection}

${newsletterSection}

${refundSection}

## Intellectual Property Rights

The content on ${formData.websiteName}, including but not limited to text, graphics, logos, images, and software, is the property of ${formData.companyName || 'us'} and is protected by copyright and other intellectual property laws.

## Limitation of Liability

In no event shall ${formData.companyName || 'we'} be liable for any damages arising out of the use or inability to use the materials on our Website, even if we have been notified of the possibility of such damages.

## Governing Law

These Terms and Conditions are governed by and construed in accordance with the laws of ${formData.governingLaw}, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.

## Contact Us

If you have any questions about these Terms, please contact us:

- Website: ${formData.websiteUrl}
- Email: ${formData.contactEmail}
`;

    return terms;
  };

  const handleCopy = () => {
    const terms = generateTerms();
    if (terms) {
      navigator.clipboard.writeText(terms);
      toast.success('Terms & Conditions copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const terms = generateTerms();
    if (terms) {
      const blob = new Blob([terms], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'terms-and-conditions.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Terms & Conditions downloaded!');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Scale className="h-8 w-8 text-primary" />
          Terms & Conditions Generator
        </h1>
        <p className="text-muted-foreground">
          Generate legal terms and conditions for your website
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
                  placeholder="legal@example.com"
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
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="governingLaw">Governing Law</Label>
                <Select value={formData.governingLaw} onValueChange={(v) => setFormData({ ...formData, governingLaw: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="California, USA">California, USA</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Business Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasUserAccounts"
                checked={formData.hasUserAccounts}
                onCheckedChange={(c) => setFormData({ ...formData, hasUserAccounts: !!c })}
              />
              <Label htmlFor="hasUserAccounts">Users can create accounts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPayments"
                checked={formData.hasPayments}
                onCheckedChange={(c) => setFormData({ ...formData, hasPayments: !!c })}
              />
              <Label htmlFor="hasPayments">Website accepts payments</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasNewsletter"
                checked={formData.hasNewsletter}
                onCheckedChange={(c) => setFormData({ ...formData, hasNewsletter: !!c })}
              />
              <Label htmlFor="hasNewsletter">Has newsletter subscription</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowsRefund"
                checked={formData.allowsRefund}
                onCheckedChange={(c) => setFormData({ ...formData, allowsRefund: !!c })}
              />
              <Label htmlFor="allowsRefund">Allow refunds</Label>
            </div>
            {formData.allowsRefund && (
              <div className="ml-6">
                <Label>Refund Period</Label>
                <Select value={formData.refundDays} onValueChange={(v) => setFormData({ ...formData, refundDays: v })}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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

export default TermsGenerator;
