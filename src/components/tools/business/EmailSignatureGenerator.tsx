'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AnimatedElement from '@/components/animated-element';
import {
    Mail,
    Phone,
    Globe,
    MapPin,
    Linkedin,
    Twitter,
    Facebook,
    Instagram,
    Copy,
    Download,
    Upload,
    User,
    Palette,
    Image as ImageIcon,
    Youtube,
    Github,
    MessageSquare,
    Calendar,
    Award,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Eye,
    Code
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SignatureData {
    fullName: string;
    jobTitle: string;
    department: string;
    company: string;
    email: string;
    phone: string;
    mobile: string;
    website: string;
    address: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
    github: string;
    whatsapp: string;
    calendly: string;
    profileImage: string;
    companyLogo: string;
    bannerImage: string;
    tagline: string;
    disclaimer: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: string;
    showDivider: boolean;
    showIcons: boolean;
    iconStyle: 'color' | 'monochrome' | 'rounded';
    layout: 'horizontal' | 'vertical';
}

const presetExamples = {
    tech: {
        fullName: 'Sarah Johnson',
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        company: 'TechCorp Solutions',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1 (555) 123-4567',
        mobile: '+1 (555) 987-6543',
        website: 'https://techcorp.com',
        address: '123 Innovation Drive, San Francisco, CA 94105',
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        github: 'https://github.com/sarahjohnson',
        twitter: 'https://twitter.com/sarahj_tech',
        calendly: 'https://calendly.com/sarahjohnson',
        tagline: 'Building innovative solutions that matter',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
    },
    business: {
        fullName: 'Michael Chen',
        jobTitle: 'Chief Marketing Officer',
        department: 'Marketing & Sales',
        company: 'Global Innovations Ltd.',
        email: 'michael.chen@globalinnovations.com',
        phone: '+1 (212) 555-0123',
        mobile: '+1 (917) 555-0456',
        website: 'https://globalinnovations.com',
        address: '456 Business Plaza, New York, NY 10001',
        linkedin: 'https://linkedin.com/in/michaelchen',
        twitter: 'https://twitter.com/mchen_business',
        facebook: 'https://facebook.com/michaelchenbiz',
        tagline: 'Transforming brands through strategic innovation',
        disclaimer: 'This email and any attachments are confidential and may be privileged.',
        primaryColor: '#059669',
        secondaryColor: '#047857',
    },
    creative: {
        fullName: 'Emma Martinez',
        jobTitle: 'Creative Director',
        department: 'Design & Branding',
        company: 'Studio Pixel',
        email: 'emma@studiopixel.design',
        phone: '+1 (310) 555-7890',
        website: 'https://studiopixel.design',
        address: 'Los Angeles, CA',
        linkedin: 'https://linkedin.com/in/emmamartinez',
        instagram: 'https://instagram.com/emmamartinez.design',
        youtube: 'https://youtube.com/@studiopixel',
        tagline: 'Crafting visual stories that inspire',
        primaryColor: '#ec4899',
        secondaryColor: '#db2777',
    },
    consultant: {
        fullName: 'David Anderson',
        jobTitle: 'Senior Management Consultant',
        department: 'Strategic Advisory',
        company: 'Anderson Consulting Group',
        email: 'd.anderson@andersoncg.com',
        phone: '+44 20 7123 4567',
        mobile: '+44 7700 900123',
        website: 'https://andersoncg.com',
        address: 'London, United Kingdom',
        linkedin: 'https://linkedin.com/in/davidanderson',
        calendly: 'https://calendly.com/davidanderson',
        tagline: 'Driving business excellence through strategic insights',
        disclaimer: 'Confidential and legally privileged information.',
        primaryColor: '#1e40af',
        secondaryColor: '#1e3a8a',
    }
};

const EmailSignatureGenerator: React.FC = () => {
    const [data, setData] = useState<SignatureData>({
        fullName: '',
        jobTitle: '',
        department: '',
        company: '',
        email: '',
        phone: '',
        mobile: '',
        website: '',
        address: '',
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: '',
        youtube: '',
        github: '',
        whatsapp: '',
        calendly: '',
        profileImage: '',
        companyLogo: '',
        bannerImage: '',
        tagline: '',
        disclaimer: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        showDivider: true,
        showIcons: true,
        iconStyle: 'color',
        layout: 'horizontal',
    });

    const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'minimal' | 'corporate' | 'creative' | 'elegant'>('modern');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showSocial, setShowSocial] = useState(false);
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

    const profileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: keyof SignatureData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const loadPreset = (preset: keyof typeof presetExamples) => {
        const presetData = presetExamples[preset];
        setData(prev => ({ ...prev, ...presetData }));
        toast.success(`Loaded ${preset} example`);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'profileImage' | 'companyLogo' | 'bannerImage') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1000000) {
                toast.error('Image must be less than 1MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({ ...prev, [field]: reader.result as string }));
                toast.success('Image uploaded');
            };
            reader.readAsDataURL(file);
        }
    };

    const getSocialIcon = (platform: string) => {
        const icons: Record<string, string> = {
            linkedin: '💼',
            twitter: '🐦',
            facebook: '👥',
            instagram: '📷',
            youtube: '📺',
            github: '💻',
            whatsapp: '💬',
            calendly: '📅',
        };
        return icons[platform] || '🔗';
    };

    const generateSignatureHTML = () => {
        const socialLinks = [
            { name: 'linkedin', url: data.linkedin, color: '#0077b5', icon: 'in' },
            { name: 'twitter', url: data.twitter, color: '#1da1f2', icon: '𝕏' },
            { name: 'facebook', url: data.facebook, color: '#1877f2', icon: 'f' },
            { name: 'instagram', url: data.instagram, color: '#e4405f', icon: '📷' },
            { name: 'youtube', url: data.youtube, color: '#ff0000', icon: '▶' },
            { name: 'github', url: data.github, color: '#333333', icon: 'gh' },
            { name: 'whatsapp', url: data.whatsapp, color: '#25d366', icon: '💬' },
            { name: 'calendly', url: data.calendly, color: '#006bff', icon: '📅' },
        ].filter(link => link.url);

        const templates = {
            modern: `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${data.fontFamily}; font-size: ${data.fontSize}; color: #333333; max-width: 600px;">
  ${data.bannerImage ? `
  <tr>
    <td colspan="2" style="padding-bottom: 15px;">
      <img src="${data.bannerImage}" alt="Banner" style="width: 100%; max-width: 600px; height: auto; display: block; border-radius: 8px 8px 0 0;">
    </td>
  </tr>
  ` : ''}
  <tr>
    <td style="padding: 20px; border-left: 4px solid ${data.primaryColor}; background-color: #f9fafb;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${data.profileImage ? `
          <td style="padding-right: 20px; vertical-align: top;">
            <img src="${data.profileImage}" alt="${data.fullName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid ${data.primaryColor};">
          </td>
          ` : ''}
          <td style="vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <h2 style="margin: 0; font-size: 20px; color: ${data.primaryColor}; font-weight: 700;">${data.fullName}</h2>
                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280; font-weight: 600;">${data.jobTitle}</p>
                  ${data.department ? `<p style="margin: 3px 0 0 0; font-size: 13px; color: #9ca3af;">${data.department}</p>` : ''}
                  ${data.company ? `<p style="margin: 3px 0 0 0; font-size: 14px; color: ${data.secondaryColor}; font-weight: 600;">${data.company}</p>` : ''}
                  ${data.tagline ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280; font-style: italic;">"${data.tagline}"</p>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      
      ${data.showDivider ? `<div style="border-top: 1px solid #e5e7eb; margin: 15px 0;"></div>` : '<div style="height: 15px;"></div>'}
      
      <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
        ${data.email ? `
        <tr>
          <td style="padding: 3px 0;">
            <span style="color: ${data.primaryColor}; font-weight: bold;">✉</span>
            <a href="mailto:${data.email}" style="color: #4b5563; text-decoration: none; margin-left: 8px;">${data.email}</a>
          </td>
        </tr>
        ` : ''}
        ${data.phone ? `
        <tr>
          <td style="padding: 3px 0;">
            <span style="color: ${data.primaryColor}; font-weight: bold;">📞</span>
            <span style="color: #4b5563; margin-left: 8px;">${data.phone}</span>
          </td>
        </tr>
        ` : ''}
        ${data.mobile ? `
        <tr>
          <td style="padding: 3px 0;">
            <span style="color: ${data.primaryColor}; font-weight: bold;">📱</span>
            <span style="color: #4b5563; margin-left: 8px;">${data.mobile}</span>
          </td>
        </tr>
        ` : ''}
        ${data.website ? `
        <tr>
          <td style="padding: 3px 0;">
            <span style="color: ${data.primaryColor}; font-weight: bold;">🌐</span>
            <a href="${data.website}" style="color: ${data.primaryColor}; text-decoration: none; margin-left: 8px;">${data.website.replace('https://', '').replace('http://', '')}</a>
          </td>
        </tr>
        ` : ''}
        ${data.address ? `
        <tr>
          <td style="padding: 3px 0;">
            <span style="color: ${data.primaryColor}; font-weight: bold;">📍</span>
            <span style="color: #4b5563; margin-left: 8px;">${data.address}</span>
          </td>
        </tr>
        ` : ''}
      </table>
      
      ${socialLinks.length > 0 ? `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            ${socialLinks.map(link => `
            <td style="padding-right: 10px;">
              <a href="${link.url}" style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 50%; background-color: ${data.iconStyle === 'color' ? link.color : '#6b7280'}; color: white; text-decoration: none; font-size: 12px; font-weight: bold;">${link.icon}</a>
            </td>
            `).join('')}
          </tr>
        </table>
      </div>
      ` : ''}
      
      ${data.companyLogo ? `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <img src="${data.companyLogo}" alt="Company Logo" style="max-width: 120px; height: auto;">
      </div>
      ` : ''}
      
      ${data.disclaimer ? `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 10px; color: #9ca3af; line-height: 1.5;">${data.disclaimer}</p>
      </div>
      ` : ''}
    </td>
  </tr>
</table>`,

            classic: `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Georgia, 'Times New Roman', serif; max-width: 550px; border-collapse: collapse;">
  <tr>
    <td style="padding: 25px; background-color: #ffffff; border: 2px solid ${data.primaryColor};">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${data.profileImage ? `
        <tr>
          <td style="text-align: center; padding-bottom: 20px;">
            <img src="${data.profileImage}" alt="${data.fullName}" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid ${data.primaryColor};">
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="text-align: center;">
            <h2 style="margin: 0; font-size: 24px; color: ${data.primaryColor}; font-weight: bold;">${data.fullName}</h2>
            <p style="margin: 8px 0 0 0; font-size: 16px; color: #555555; font-style: italic;">${data.jobTitle}</p>
            ${data.department ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #666666;">${data.department}</p>` : ''}
            ${data.company ? `<p style="margin: 5px 0 0 0; font-size: 16px; color: ${data.secondaryColor}; font-weight: bold;">${data.company}</p>` : ''}
            ${data.tagline ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: #666666; font-style: italic; border-top: 1px solid #dddddd; padding-top: 12px;">${data.tagline}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding-top: 20px;">
            <hr style="border: none; border-top: 2px solid ${data.primaryColor}; margin: 15px 0;">
          </td>
        </tr>
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size: 13px;">
              ${data.email ? `
              <tr>
                <td style="padding: 5px 0;">
                  <strong style="color: ${data.primaryColor};">Email:</strong>
                  <a href="mailto:${data.email}" style="color: #333333; text-decoration: none; margin-left: 8px;">${data.email}</a>
                </td>
              </tr>
              ` : ''}
              ${data.phone ? `
              <tr>
                <td style="padding: 5px 0;">
                  <strong style="color: ${data.primaryColor};">Phone:</strong>
                  <span style="color: #333333; margin-left: 8px;">${data.phone}</span>
                </td>
              </tr>
              ` : ''}
              ${data.mobile ? `
              <tr>
                <td style="padding: 5px 0;">
                  <strong style="color: ${data.primaryColor};">Mobile:</strong>
                  <span style="color: #333333; margin-left: 8px;">${data.mobile}</span>
                </td>
              </tr>
              ` : ''}
              ${data.website ? `
              <tr>
                <td style="padding: 5px 0;">
                  <strong style="color: ${data.primaryColor};">Website:</strong>
                  <a href="${data.website}" style="color: #333333; text-decoration: none; margin-left: 8px;">${data.website.replace('https://', '').replace('http://', '')}</a>
                </td>
              </tr>
              ` : ''}
              ${data.address ? `
              <tr>
                <td style="padding: 5px 0;">
                  <strong style="color: ${data.primaryColor};">Address:</strong>
                  <span style="color: #333333; margin-left: 8px;">${data.address}</span>
                </td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
        ${socialLinks.length > 0 ? `
        <tr>
          <td style="padding-top: 20px; text-align: center; border-top: 1px solid #dddddd;">
            ${socialLinks.map(link => `<a href="${link.url}" style="margin: 0 5px; color: ${link.color}; text-decoration: none; font-size: 13px;">${link.name.charAt(0).toUpperCase() + link.name.slice(1)}</a>`).join(' | ')}
          </td>
        </tr>
        ` : ''}
        ${data.companyLogo ? `
        <tr>
          <td style="padding-top: 20px; text-align: center; border-top: 1px solid #dddddd;">
            <img src="${data.companyLogo}" alt="Company Logo" style="max-width: 150px; height: auto; margin-top: 10px;">
          </td>
        </tr>
        ` : ''}
      </table>
    </td>
  </tr>
</table>`,

            minimal: `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 450px;">
  <tr>
    <td style="padding: 15px 0;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${data.profileImage ? `
          <td style="padding-right: 15px; vertical-align: top;">
            <img src="${data.profileImage}" alt="${data.fullName}" style="width: 60px; height: 60px; border-radius: 8px;">
          </td>
          ` : ''}
          <td style="vertical-align: top;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #000000;">${data.fullName}</p>
            <p style="margin: 3px 0 0 0; font-size: 13px; color: #666666;">${data.jobTitle}${data.company ? ` • ${data.company}` : ''}</p>
            ${data.tagline ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #999999;">${data.tagline}</p>` : ''}
            <div style="margin-top: 10px; font-size: 12px; line-height: 1.8;">
              ${data.email ? `<div><a href="mailto:${data.email}" style="color: #000000; text-decoration: none; border-bottom: 1px solid #000000;">${data.email}</a></div>` : ''}
              ${data.phone ? `<div style="color: #333333;">${data.phone}</div>` : ''}
              ${data.website ? `<div><a href="${data.website}" style="color: #000000; text-decoration: none; border-bottom: 1px solid #000000;">${data.website.replace('https://', '').replace('http://', '')}</a></div>` : ''}
            </div>
            ${socialLinks.length > 0 ? `
            <div style="margin-top: 10px;">
              ${socialLinks.map(link => `<a href="${link.url}" style="margin-right: 8px; color: #666666; text-decoration: none; font-size: 11px;">${link.name}</a>`).join('')}
            </div>
            ` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`,

            corporate: `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 650px; background-color: #ffffff;">
  <tr>
    <td style="background: linear-gradient(135deg, ${data.primaryColor} 0%, ${data.secondaryColor} 100%); padding: 3px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff;">
        <tr>
          <td style="padding: 25px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${data.profileImage ? `
                <td style="width: 100px; vertical-align: top; padding-right: 20px;">
                  <img src="${data.profileImage}" alt="${data.fullName}" style="width: 100px; height: 100px; border-radius: 4px; object-fit: cover;">
                </td>
                ` : ''}
                <td style="vertical-align: top;">
                  <h2 style="margin: 0; font-size: 22px; color: ${data.primaryColor}; font-weight: 700; letter-spacing: -0.5px;">${data.fullName}</h2>
                  <p style="margin: 5px 0 0 0; font-size: 15px; color: #666666; font-weight: 600;">${data.jobTitle}</p>
                  ${data.department ? `<p style="margin: 3px 0 0 0; font-size: 13px; color: #888888;">${data.department}</p>` : ''}
                  ${data.company ? `<p style="margin: 8px 0 0 0; font-size: 16px; color: ${data.secondaryColor}; font-weight: 700;">${data.company}</p>` : ''}
                </td>
                ${data.companyLogo ? `
                <td style="vertical-align: top; text-align: right; width: 120px;">
                  <img src="${data.companyLogo}" alt="Logo" style="max-width: 120px; height: auto;">
                </td>
                ` : ''}
              </tr>
            </table>
            
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 20px; border-top: 2px solid #f0f0f0; padding-top: 15px;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 15px;">
                  <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 1.8;">
                    ${data.email ? `
                    <tr>
                      <td style="color: ${data.primaryColor}; font-weight: bold; width: 24px;">✉</td>
                      <td><a href="mailto:${data.email}" style="color: #333333; text-decoration: none;">${data.email}</a></td>
                    </tr>
                    ` : ''}
                    ${data.phone ? `
                    <tr>
                      <td style="color: ${data.primaryColor}; font-weight: bold;">☎</td>
                      <td style="color: #333333;">${data.phone}</td>
                    </tr>
                    ` : ''}
                    ${data.mobile ? `
                    <tr>
                      <td style="color: ${data.primaryColor}; font-weight: bold;">📱</td>
                      <td style="color: #333333;">${data.mobile}</td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
                <td style="width: 50%; vertical-align: top;">
                  <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 1.8;">
                    ${data.website ? `
                    <tr>
                      <td style="color: ${data.primaryColor}; font-weight: bold; width: 24px;">🌐</td>
                      <td><a href="${data.website}" style="color: ${data.primaryColor}; text-decoration: none;">${data.website.replace('https://', '').replace('http://', '')}</a></td>
                    </tr>
                    ` : ''}
                    ${data.address ? `
                    <tr>
                      <td style="color: ${data.primaryColor}; font-weight: bold;">📍</td>
                      <td style="color: #333333;">${data.address}</td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
              </tr>
            </table>
            
            ${socialLinks.length > 0 ? `
            <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; border-top: 2px solid #f0f0f0; padding-top: 15px;">
              <tr>
                ${socialLinks.map(link => `
                <td style="padding-right: 8px;">
                  <a href="${link.url}" style="display: inline-block; width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 6px; background-color: ${link.color}; color: white; text-decoration: none; font-size: 11px; font-weight: bold;">${link.icon}</a>
                </td>
                `).join('')}
              </tr>
            </table>
            ` : ''}
            
            ${data.disclaimer ? `
            <p style="margin: 20px 0 0 0; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #999999; line-height: 1.5;">${data.disclaimer}</p>
            ` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`,

            creative: `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Montserrat', 'Arial', sans-serif; max-width: 550px;">
  <tr>
    <td style="background: linear-gradient(135deg, ${data.primaryColor} 0%, ${data.secondaryColor} 100%); padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${data.profileImage ? `
        <tr>
          <td style="text-align: center; padding-bottom: 20px;">
            <img src="${data.profileImage}" alt="${data.fullName}" style="width: 90px; height: 90px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); object-fit: cover;">
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="text-align: center;">
            <h2 style="margin: 0; font-size: 26px; color: #ffffff; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${data.fullName}</h2>
            <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.95); font-weight: 600;">${data.jobTitle}</p>
            ${data.company ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">${data.company}</p>` : ''}
            ${data.tagline ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.85); font-style: italic; padding: 10px 20px; background-color: rgba(255,255,255,0.1); border-radius: 20px; display: inline-block;">${data.tagline}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding-top: 25px;">
            <div style="background-color: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px; backdrop-filter: blur(10px);">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size: 13px; color: #ffffff;">
                ${data.email ? `
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="font-size: 16px;">✉</span>
                    <a href="mailto:${data.email}" style="color: #ffffff; text-decoration: none; margin-left: 10px;">${data.email}</a>
                  </td>
                </tr>
                ` : ''}
                ${data.phone ? `
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="font-size: 16px;">📞</span>
                    <span style="margin-left: 10px;">${data.phone}</span>
                  </td>
                </tr>
                ` : ''}
                ${data.website ? `
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="font-size: 16px;">🌐</span>
                    <a href="${data.website}" style="color: #ffffff; text-decoration: none; margin-left: 10px;">${data.website.replace('https://', '').replace('http://', '')}</a>
                  </td>
                </tr>
                ` : ''}
                ${data.address ? `
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="font-size: 16px;">📍</span>
                    <span style="margin-left: 10px;">${data.address}</span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </div>
          </td>
        </tr>
        ${socialLinks.length > 0 ? `
        <tr>
          <td style="padding-top: 20px; text-align: center;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
              <tr>
                ${socialLinks.map(link => `
                <td style="padding: 0 5px;">
                  <a href="${link.url}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 50%; background-color: rgba(255,255,255,0.2); color: white; text-decoration: none; font-size: 12px; font-weight: bold; transition: all 0.3s;">${link.icon}</a>
                </td>
                `).join('')}
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}
      </table>
    </td>
  </tr>
</table>`,

            elegant: `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Playfair Display', Georgia, serif; max-width: 500px;">
  <tr>
    <td style="padding: 30px; background-color: #fafafa; border: 1px solid #e0e0e0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="text-align: center; border-bottom: 3px double ${data.primaryColor}; padding-bottom: 20px;">
            ${data.profileImage ? `<img src="${data.profileImage}" alt="${data.fullName}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; border: 2px solid ${data.primaryColor};">` : ''}
            <h2 style="margin: 0; font-size: 28px; color: ${data.primaryColor}; font-weight: 400; letter-spacing: 1px;">${data.fullName}</h2>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #666666; letter-spacing: 2px; text-transform: uppercase;">${data.jobTitle}</p>
            ${data.company ? `<p style="margin: 5px 0 0 0; font-size: 16px; color: ${data.secondaryColor}; font-weight: 600;">${data.company}</p>` : ''}
            ${data.tagline ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: #888888; font-style: italic; font-family: Georgia, serif;">${data.tagline}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding-top: 25px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size: 13px; font-family: Arial, sans-serif;">
              ${data.email ? `
              <tr>
                <td style="padding: 6px 0; color: #555555;">
                  <span style="color: ${data.primaryColor}; display: inline-block; width: 100px; font-weight: 600;">Email</span>
                  <a href="mailto:${data.email}" style="color: #333333; text-decoration: none;">${data.email}</a>
                </td>
              </tr>
              ` : ''}
              ${data.phone ? `
              <tr>
                <td style="padding: 6px 0; color: #555555;">
                  <span style="color: ${data.primaryColor}; display: inline-block; width: 100px; font-weight: 600;">Office</span>
                  <span style="color: #333333;">${data.phone}</span>
                </td>
              </tr>
              ` : ''}
              ${data.mobile ? `
              <tr>
                <td style="padding: 6px 0; color: #555555;">
                  <span style="color: ${data.primaryColor}; display: inline-block; width: 100px; font-weight: 600;">Mobile</span>
                  <span style="color: #333333;">${data.mobile}</span>
                </td>
              </tr>
              ` : ''}
              ${data.website ? `
              <tr>
                <td style="padding: 6px 0; color: #555555;">
                  <span style="color: ${data.primaryColor}; display: inline-block; width: 100px; font-weight: 600;">Website</span>
                  <a href="${data.website}" style="color: ${data.primaryColor}; text-decoration: none;">${data.website.replace('https://', '').replace('http://', '')}</a>
                </td>
              </tr>
              ` : ''}
              ${data.address ? `
              <tr>
                <td style="padding: 6px 0; color: #555555;">
                  <span style="color: ${data.primaryColor}; display: inline-block; width: 100px; font-weight: 600;">Address</span>
                  <span style="color: #333333;">${data.address}</span>
                </td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
        ${socialLinks.length > 0 ? `
        <tr>
          <td style="padding-top: 25px; border-top: 1px solid #e0e0e0; text-align: center;">
            ${socialLinks.map(link => `<a href="${link.url}" style="margin: 0 8px; color: ${link.color}; text-decoration: none; font-size: 12px; font-family: Arial, sans-serif;">${link.name.toUpperCase()}</a>`).join(' • ')}
          </td>
        </tr>
        ` : ''}
        ${data.companyLogo ? `
        <tr>
          <td style="padding-top: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <img src="${data.companyLogo}" alt="Logo" style="max-width: 140px; height: auto; margin-top: 10px;">
          </td>
        </tr>
        ` : ''}
      </table>
    </td>
  </tr>
</table>`
        };

        return templates[selectedTemplate];
    };

    const copyToClipboard = () => {
        const html = generateSignatureHTML();
        navigator.clipboard.writeText(html).then(() => {
            toast.success('Signature HTML copied to clipboard!');
        });
    };

    const downloadAsHTML = () => {
        const html = generateSignatureHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.fullName.replace(/\s+/g, '-').toLowerCase() || 'email'}-signature.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Signature downloaded!');
    };

    const clearAll = () => {
        setData({
            fullName: '',
            jobTitle: '',
            department: '',
            company: '',
            email: '',
            phone: '',
            mobile: '',
            website: '',
            address: '',
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: '',
            youtube: '',
            github: '',
            whatsapp: '',
            calendly: '',
            profileImage: '',
            companyLogo: '',
            bannerImage: '',
            tagline: '',
            disclaimer: '',
            primaryColor: '#3b82f6',
            secondaryColor: '#1e40af',
            fontFamily: 'Arial, sans-serif',
            fontSize: '13px',
            showDivider: true,
            showIcons: true,
            iconStyle: 'color',
            layout: 'horizontal',
        });
        toast.success('All fields cleared');
    };

    return (
        <AnimatedElement>
            <div className="max-w-7xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-6 w-6" />
                                    Professional Email Signature Generator
                                </CardTitle>
                                <CardDescription>
                                    Create stunning, professional email signatures with advanced customization
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={clearAll} variant="outline" size="sm">
                                    Clear All
                                </Button>
                            </div>
                        </div>

                        {/* Preset Examples */}
                        <div className="flex gap-2 mt-4 flex-wrap">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Quick Start:
                            </span>
                            {Object.keys(presetExamples).map((preset) => (
                                <Button
                                    key={preset}
                                    onClick={() => loadPreset(preset as keyof typeof presetExamples)}
                                    variant="outline"
                                    size="sm"
                                >
                                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input Form */}
                            <div className="space-y-4 overflow-y-auto max-h-[700px] pr-2">
                                {/* Basic Info */}
                                <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Basic Information
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name *</Label>
                                        <Input
                                            id="fullName"
                                            placeholder="Sarah Johnson"
                                            value={data.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">Job Title *</Label>
                                        <Input
                                            id="jobTitle"
                                            placeholder="Senior Software Engineer"
                                            value={data.jobTitle}
                                            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input
                                                id="department"
                                                placeholder="Engineering"
                                                value={data.department}
                                                onChange={(e) => handleInputChange('department', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company</Label>
                                            <Input
                                                id="company"
                                                placeholder="TechCorp Inc."
                                                value={data.company}
                                                onChange={(e) => handleInputChange('company', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tagline">Tagline / Motto</Label>
                                        <Input
                                            id="tagline"
                                            placeholder="Building innovative solutions"
                                            value={data.tagline}
                                            onChange={(e) => handleInputChange('tagline', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Contact Information
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="sarah@techcorp.com"
                                            value={data.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Office Phone</Label>
                                            <Input
                                                id="phone"
                                                placeholder="+1 (555) 123-4567"
                                                value={data.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mobile">Mobile Phone</Label>
                                            <Input
                                                id="mobile"
                                                placeholder="+1 (555) 987-6543"
                                                value={data.mobile}
                                                onChange={(e) => handleInputChange('mobile', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            placeholder="https://techcorp.com"
                                            value={data.website}
                                            onChange={(e) => handleInputChange('website', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            placeholder="123 Innovation Drive, San Francisco, CA"
                                            value={data.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Images & Branding
                                    </h3>

                                    <div className="space-y-3">
                                        <div>
                                            <Label>Profile Photo</Label>
                                            <input
                                                type="file"
                                                ref={profileInputRef}
                                                onChange={(e) => handleImageUpload(e, 'profileImage')}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <Button
                                                onClick={() => profileInputRef.current?.click()}
                                                variant="outline"
                                                className="w-full mt-1"
                                                size="sm"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {data.profileImage ? 'Change Photo' : 'Upload Photo'}
                                            </Button>
                                            {data.profileImage && (
                                                <div className="mt-2 text-center">
                                                    <img src={data.profileImage} alt="Profile" className="max-h-20 mx-auto rounded" />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Company Logo</Label>
                                            <input
                                                type="file"
                                                ref={logoInputRef}
                                                onChange={(e) => handleImageUpload(e, 'companyLogo')}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <Button
                                                onClick={() => logoInputRef.current?.click()}
                                                variant="outline"
                                                className="w-full mt-1"
                                                size="sm"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {data.companyLogo ? 'Change Logo' : 'Upload Logo'}
                                            </Button>
                                            {data.companyLogo && (
                                                <div className="mt-2 text-center">
                                                    <img src={data.companyLogo} alt="Logo" className="max-h-16 mx-auto" />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Banner Image (optional)</Label>
                                            <input
                                                type="file"
                                                ref={bannerInputRef}
                                                onChange={(e) => handleImageUpload(e, 'bannerImage')}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <Button
                                                onClick={() => bannerInputRef.current?.click()}
                                                variant="outline"
                                                className="w-full mt-1"
                                                size="sm"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {data.bannerImage ? 'Change Banner' : 'Upload Banner'}
                                            </Button>
                                            {data.bannerImage && (
                                                <div className="mt-2">
                                                    <img src={data.bannerImage} alt="Banner" className="w-full rounded" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Social Media */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Linkedin className="h-4 w-4" />
                                            Social Media Links
                                        </h3>
                                        <Button
                                            onClick={() => setShowSocial(!showSocial)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            {showSocial ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                    </div>

                                    {showSocial && (
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="linkedin">LinkedIn</Label>
                                                <Input
                                                    id="linkedin"
                                                    placeholder="https://linkedin.com/in/username"
                                                    value={data.linkedin}
                                                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="twitter">Twitter / X</Label>
                                                <Input
                                                    id="twitter"
                                                    placeholder="https://twitter.com/username"
                                                    value={data.twitter}
                                                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="facebook">Facebook</Label>
                                                    <Input
                                                        id="facebook"
                                                        placeholder="facebook.com/username"
                                                        value={data.facebook}
                                                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="instagram">Instagram</Label>
                                                    <Input
                                                        id="instagram"
                                                        placeholder="instagram.com/username"
                                                        value={data.instagram}
                                                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="youtube">YouTube</Label>
                                                    <Input
                                                        id="youtube"
                                                        placeholder="youtube.com/@channel"
                                                        value={data.youtube}
                                                        onChange={(e) => handleInputChange('youtube', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="github">GitHub</Label>
                                                    <Input
                                                        id="github"
                                                        placeholder="github.com/username"
                                                        value={data.github}
                                                        onChange={(e) => handleInputChange('github', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                                    <Input
                                                        id="whatsapp"
                                                        placeholder="wa.me/1234567890"
                                                        value={data.whatsapp}
                                                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="calendly">Calendly</Label>
                                                    <Input
                                                        id="calendly"
                                                        placeholder="calendly.com/username"
                                                        value={data.calendly}
                                                        onChange={(e) => handleInputChange('calendly', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Advanced Customization */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Palette className="h-4 w-4" />
                                            Customization
                                        </h3>
                                        <Button
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                    </div>

                                    {showAdvanced && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="primaryColor">Primary Color</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="primaryColor"
                                                            type="color"
                                                            value={data.primaryColor}
                                                            onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                                            className="w-16 h-10"
                                                        />
                                                        <Input
                                                            value={data.primaryColor}
                                                            onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                                            placeholder="#3b82f6"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="secondaryColor"
                                                            type="color"
                                                            value={data.secondaryColor}
                                                            onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                                            className="w-16 h-10"
                                                        />
                                                        <Input
                                                            value={data.secondaryColor}
                                                            onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                                            placeholder="#1e40af"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="fontFamily">Font Family</Label>
                                                <select
                                                    id="fontFamily"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={data.fontFamily}
                                                    onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                                                >
                                                    <option value="Arial, sans-serif">Arial</option>
                                                    <option value="'Helvetica Neue', sans-serif">Helvetica</option>
                                                    <option value="Georgia, serif">Georgia</option>
                                                    <option value="'Times New Roman', serif">Times New Roman</option>
                                                    <option value="'Segoe UI', sans-serif">Segoe UI</option>
                                                    <option value="Verdana, sans-serif">Verdana</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="iconStyle">Icon Style</Label>
                                                <select
                                                    id="iconStyle"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={data.iconStyle}
                                                    onChange={(e) => handleInputChange('iconStyle', e.target.value)}
                                                >
                                                    <option value="color">Colorful</option>
                                                    <option value="monochrome">Monochrome</option>
                                                    <option value="rounded">Rounded</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Disclaimer */}
                                <div className="space-y-2">
                                    <Label htmlFor="disclaimer">Legal Disclaimer (optional)</Label>
                                    <Textarea
                                        id="disclaimer"
                                        placeholder="This email and any attachments are confidential..."
                                        value={data.disclaimer}
                                        onChange={(e) => handleInputChange('disclaimer', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Eye className="h-5 w-5" />
                                        Live Preview
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setViewMode('preview')}
                                            variant={viewMode === 'preview' ? 'default' : 'outline'}
                                            size="sm"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Preview
                                        </Button>
                                        <Button
                                            onClick={() => setViewMode('code')}
                                            variant={viewMode === 'code' ? 'default' : 'outline'}
                                            size="sm"
                                        >
                                            <Code className="h-4 w-4 mr-1" />
                                            Code
                                        </Button>
                                    </div>
                                </div>

                                <Tabs value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as any)}>
                                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                                        <TabsTrigger value="modern">Modern</TabsTrigger>
                                        <TabsTrigger value="classic">Classic</TabsTrigger>
                                        <TabsTrigger value="minimal">Minimal</TabsTrigger>
                                        <TabsTrigger value="corporate">Corporate</TabsTrigger>
                                        <TabsTrigger value="creative">Creative</TabsTrigger>
                                        <TabsTrigger value="elegant">Elegant</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value={selectedTemplate} className="mt-4">
                                        {viewMode === 'preview' ? (
                                            <div className="border rounded-lg p-6 bg-white min-h-[500px] overflow-auto">
                                                <div dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} />
                                            </div>
                                        ) : (
                                            <div className="border rounded-lg p-4 bg-gray-50 min-h-[500px] overflow-auto">
                                                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                                                    {generateSignatureHTML()}
                                                </pre>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={copyToClipboard} className="w-full">
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy HTML
                                    </Button>
                                    <Button onClick={downloadAsHTML} variant="outline" className="w-full">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>

                                <div className="text-sm text-muted-foreground space-y-2 border-t pt-4">
                                    <p className="font-semibold">📧 How to install in your email client:</p>
                                    <div className="space-y-3 text-xs">
                                        <div>
                                            <p className="font-medium">Gmail:</p>
                                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                                <li>Settings → See all settings → Signature</li>
                                                <li>Click "Create new"</li>
                                                <li>Paste the HTML (Ctrl/Cmd + V)</li>
                                                <li>Save changes</li>
                                            </ol>
                                        </div>
                                        <div>
                                            <p className="font-medium">Outlook:</p>
                                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                                <li>File → Options → Mail → Signatures</li>
                                                <li>New → Paste HTML code</li>
                                                <li>Set as default signature</li>
                                            </ol>
                                        </div>
                                        <div>
                                            <p className="font-medium">Apple Mail:</p>
                                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                                <li>Preferences → Signatures</li>
                                                <li>Create new signature</li>
                                                <li>Paste HTML content</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default EmailSignatureGenerator;