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
    Download, Plus, Trash2, FileText, Save, Upload, Eye, EyeOff,
    Wand2, Copy, Check, Linkedin, Github, Globe, Mail, Phone,
    MapPin, Briefcase, GraduationCap, Award, Code, Languages,
    Palette, Sparkles, FileDown, Printer, Share2, Star, Settings
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
}

interface Education {
    id: string;
    degree: string;
    field: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
    achievements: string[];
}

interface Project {
    id: string;
    name: string;
    description: string;
    technologies: string;
    link: string;
}

interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialId: string;
}

interface ResumeData {
    // Personal Info
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;

    // Sections
    summary: string;
    experience: Experience[];
    education: Education[];
    projects: Project[];
    certifications: Certification[];
    skills: string[];
    languages: { language: string; proficiency: string }[];

    // Settings
    showPhoto: boolean;
    photoUrl: string;
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
}

const EnhancedResumeBuilder: React.FC = () => {
    const [resume, setResume] = useState<ResumeData>({
        fullName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: '',
        summary: '',
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        skills: [],
        languages: [],
        showPhoto: false,
        photoUrl: '',
        accentColor: '#667eea',
        fontSize: 'medium',
    });

    const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal' | 'creative' | 'executive'>('modern');
    const [activeSection, setActiveSection] = useState('personal');
    const [previewMode, setPreviewMode] = useState(true);
    const [copied, setCopied] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateField = (field: keyof ResumeData, value: any) => {
        setResume(prev => ({ ...prev, [field]: value }));
    };

    // Experience Functions
    const addExperience = () => {
        const newExp: Experience = {
            id: Date.now().toString(),
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            achievements: [],
        };
        setResume(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
    };

    const removeExperience = (id: string) => {
        setResume(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
    };

    const updateExperience = (id: string, field: keyof Experience, value: any) => {
        setResume(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            ),
        }));
    };

    const addAchievement = (id: string) => {
        setResume(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, achievements: [...exp.achievements, ''] } : exp
            ),
        }));
    };

    // Education Functions
    const addEducation = () => {
        const newEdu: Education = {
            id: Date.now().toString(),
            degree: '',
            field: '',
            school: '',
            location: '',
            startDate: '',
            endDate: '',
            gpa: '',
            achievements: [],
        };
        setResume(prev => ({ ...prev, education: [...prev.education, newEdu] }));
    };

    const removeEducation = (id: string) => {
        setResume(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
    };

    const updateEducation = (id: string, field: keyof Education, value: any) => {
        setResume(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            ),
        }));
    };

    // Project Functions
    const addProject = () => {
        const newProj: Project = {
            id: Date.now().toString(),
            name: '',
            description: '',
            technologies: '',
            link: '',
        };
        setResume(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
    };

    const removeProject = (id: string) => {
        setResume(prev => ({ ...prev, projects: prev.projects.filter(proj => proj.id !== id) }));
    };

    const updateProject = (id: string, field: keyof Project, value: string) => {
        setResume(prev => ({
            ...prev,
            projects: prev.projects.map(proj =>
                proj.id === id ? { ...proj, [field]: value } : proj
            ),
        }));
    };

    // Certification Functions
    const addCertification = () => {
        const newCert: Certification = {
            id: Date.now().toString(),
            name: '',
            issuer: '',
            date: '',
            credentialId: '',
        };
        setResume(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
    };

    const removeCertification = (id: string) => {
        setResume(prev => ({ ...prev, certifications: prev.certifications.filter(cert => cert.id !== id) }));
    };

    const updateCertification = (id: string, field: keyof Certification, value: string) => {
        setResume(prev => ({
            ...prev,
            certifications: prev.certifications.map(cert =>
                cert.id === id ? { ...cert, [field]: value } : cert
            ),
        }));
    };

    // Skills Functions
    const addSkill = () => {
        if (newSkill.trim() && !resume.skills.includes(newSkill.trim())) {
            setResume(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setResume(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    // Language Functions
    const addLanguage = () => {
        setResume(prev => ({
            ...prev,
            languages: [...prev.languages, { language: '', proficiency: 'Native' }]
        }));
    };

    const removeLanguage = (index: number) => {
        setResume(prev => ({
            ...prev,
            languages: prev.languages.filter((_, i) => i !== index)
        }));
    };

    const updateLanguage = (index: number, field: 'language' | 'proficiency', value: string) => {
        setResume(prev => ({
            ...prev,
            languages: prev.languages.map((lang, i) =>
                i === index ? { ...lang, [field]: value } : lang
            ),
        }));
    };

    // AI Enhancement Function
    const enhanceWithAI = async (text: string, type: 'summary' | 'achievement' | 'description') => {
        const prompts = {
            summary: `Enhance this professional summary to be more impactful and ATS-friendly: ${text}`,
            achievement: `Rewrite this achievement to be more quantifiable and impressive: ${text}`,
            description: `Improve this job description to highlight key accomplishments: ${text}`,
        };

        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    messages: [
                        {
                            role: "user",
                            content: `${prompts[type]}. Return only the enhanced text, no preamble or explanation. Keep it professional and concise.`
                        }
                    ],
                })
            });

            const data = await response.json();
            const enhancedText = data.content.find((c: any) => c.type === 'text')?.text || text;
            return enhancedText.trim();
        } catch (error) {
            toast.error('AI enhancement failed. Please try again.');
            return text;
        }
    };

    const generateResumeHTML = () => {
        const fontSizes = {
            small: { base: '13px', title: '24px', section: '16px', subtitle: '14px' },
            medium: { base: '14px', title: '28px', section: '18px', subtitle: '15px' },
            large: { base: '15px', title: '32px', section: '20px', subtitle: '16px' },
        };

        const fs = fontSizes[resume.fontSize];

        const templates = {
            modern: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 850px; margin: 0 auto; padding: 48px; color: #1f2937; line-height: 1.6; font-size: ${fs.base}; }
    .header { background: linear-gradient(135deg, ${resume.accentColor} 0%, ${resume.accentColor}dd 100%); color: white; padding: 48px; margin: -48px -48px 32px -48px; border-radius: 0 0 24px 24px; position: relative; }
    ${resume.showPhoto && resume.photoUrl ? `
    .photo { width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; position: absolute; top: 48px; right: 48px; object-fit: cover; }
    ` : ''}
    .name { font-size: ${fs.title}; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
    .job-title { font-size: ${fs.subtitle}; opacity: 0.95; margin-bottom: 16px; font-weight: 500; }
    .contact { font-size: ${fs.base}; opacity: 0.9; display: flex; flex-wrap: wrap; gap: 16px; }
    .contact-item { display: flex; align-items: center; gap: 6px; }
    .section { margin: 32px 0; page-break-inside: avoid; }
    .section-title { font-size: ${fs.section}; font-weight: 700; color: ${resume.accentColor}; border-bottom: 3px solid ${resume.accentColor}; padding-bottom: 10px; margin-bottom: 20px; letter-spacing: -0.3px; }
    .summary { font-size: ${fs.base}; color: #4b5563; line-height: 1.7; }
    .item { margin-bottom: 24px; page-break-inside: avoid; }
    .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .item-title { font-size: ${fs.subtitle}; font-weight: 700; color: #1f2937; }
    .item-subtitle { font-size: ${fs.base}; color: ${resume.accentColor}; font-weight: 600; margin-bottom: 4px; }
    .item-meta { font-size: ${fs.base}; color: #6b7280; }
    .description { font-size: ${fs.base}; color: #4b5563; margin-top: 8px; line-height: 1.6; }
    .achievements { margin-top: 8px; }
    .achievement { font-size: ${fs.base}; color: #4b5563; margin-bottom: 6px; padding-left: 20px; position: relative; }
    .achievement:before { content: "▸"; position: absolute; left: 0; color: ${resume.accentColor}; font-weight: bold; }
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
    .skill { background-color: ${resume.accentColor}15; color: ${resume.accentColor}; padding: 10px 16px; border-radius: 8px; font-size: ${fs.base}; font-weight: 600; text-align: center; border: 1.5px solid ${resume.accentColor}30; }
    .projects-grid { display: grid; gap: 16px; }
    .project { border: 2px solid ${resume.accentColor}20; border-radius: 12px; padding: 20px; background: ${resume.accentColor}05; }
    .project-name { font-size: ${fs.subtitle}; font-weight: 700; color: ${resume.accentColor}; margin-bottom: 8px; }
    .technologies { font-size: ${fs.base}; color: #6b7280; margin-top: 8px; font-style: italic; }
    .languages { display: flex; flex-wrap: wrap; gap: 16px; }
    .language { background: white; border: 2px solid ${resume.accentColor}; padding: 12px 20px; border-radius: 8px; font-size: ${fs.base}; }
    .language-name { font-weight: 700; color: ${resume.accentColor}; }
    .proficiency { color: #6b7280; font-size: ${fs.base}; }
    @media print { body { padding: 20px; } .header { margin: -20px -20px 20px -20px; padding: 30px; } }
  </style>
</head>
<body>
  <div class="header">
    ${resume.showPhoto && resume.photoUrl ? `<img src="${resume.photoUrl}" class="photo" alt="${resume.fullName}">` : ''}
    <div class="name">${resume.fullName || 'Your Name'}</div>
    ${resume.title ? `<div class="job-title">${resume.title}</div>` : ''}
    <div class="contact">
      ${resume.email ? `<div class="contact-item">📧 ${resume.email}</div>` : ''}
      ${resume.phone ? `<div class="contact-item">📱 ${resume.phone}</div>` : ''}
      ${resume.location ? `<div class="contact-item">📍 ${resume.location}</div>` : ''}
      ${resume.linkedin ? `<div class="contact-item">🔗 ${resume.linkedin}</div>` : ''}
      ${resume.github ? `<div class="contact-item">💻 ${resume.github}</div>` : ''}
      ${resume.website ? `<div class="contact-item">🌐 ${resume.website}</div>` : ''}
    </div>
  </div>

  ${resume.summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary">${resume.summary}</div>
  </div>
  ` : ''}

  ${resume.experience.length > 0 ? `
  <div class="section">
    <div class="section-title">Work Experience</div>
    ${resume.experience.map(exp => `
      <div class="item">
        <div class="item-header">
          <div>
            <div class="item-title">${exp.title || 'Job Title'}</div>
            <div class="item-subtitle">${exp.company || 'Company Name'}${exp.location ? ` • ${exp.location}` : ''}</div>
          </div>
          <div class="item-meta">${exp.startDate || 'Start'} - ${exp.current ? 'Present' : exp.endDate || 'End'}</div>
        </div>
        ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
        ${exp.achievements.length > 0 ? `
          <div class="achievements">
            ${exp.achievements.map(ach => `<div class="achievement">${ach}</div>`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${resume.education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${resume.education.map(edu => `
      <div class="item">
        <div class="item-header">
          <div>
            <div class="item-title">${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}</div>
            <div class="item-subtitle">${edu.school || 'School'}${edu.location ? ` • ${edu.location}` : ''}</div>
          </div>
          <div class="item-meta">${edu.startDate || 'Start'} - ${edu.endDate || 'End'}</div>
        </div>
        ${edu.gpa ? `<div class="description">GPA: ${edu.gpa}</div>` : ''}
        ${edu.achievements.length > 0 ? `
          <div class="achievements">
            ${edu.achievements.map(ach => `<div class="achievement">${ach}</div>`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${resume.projects.length > 0 ? `
  <div class="section">
    <div class="section-title">Projects</div>
    <div class="projects-grid">
      ${resume.projects.map(proj => `
        <div class="project">
          <div class="project-name">${proj.name || 'Project Name'}${proj.link ? ` <a href="${proj.link}" style="font-size: 12px; color: #6b7280;">🔗</a>` : ''}</div>
          ${proj.description ? `<div class="description">${proj.description}</div>` : ''}
          ${proj.technologies ? `<div class="technologies">Technologies: ${proj.technologies}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${resume.certifications.length > 0 ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    ${resume.certifications.map(cert => `
      <div class="item">
        <div class="item-title">${cert.name || 'Certification Name'}</div>
        <div class="item-subtitle">${cert.issuer || 'Issuer'}</div>
        <div class="item-meta">${cert.date || 'Date'}${cert.credentialId ? ` • ID: ${cert.credentialId}` : ''}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${resume.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      ${resume.skills.map(skill => `<div class="skill">${skill}</div>`).join('')}
    </div>
  </div>
  ` : ''}

  ${resume.languages.length > 0 ? `
  <div class="section">
    <div class="section-title">Languages</div>
    <div class="languages">
      ${resume.languages.map(lang => `
        <div class="language">
          <span class="language-name">${lang.language}</span>
          <span class="proficiency"> - ${lang.proficiency}</span>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}
</body>
</html>`,

            classic: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #000; font-size: ${fs.base}; }
    .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 30px; }
    .name { font-size: ${fs.title}; font-weight: bold; margin-bottom: 8px; }
    .job-title { font-size: ${fs.subtitle}; font-style: italic; margin-bottom: 12px; }
    .contact { font-size: ${fs.base}; line-height: 1.8; }
    .section { margin: 28px 0; page-break-inside: avoid; }
    .section-title { font-size: ${fs.section}; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px; letter-spacing: 1px; }
    .item { margin-bottom: 20px; }
    .item-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .item-title { font-size: ${fs.subtitle}; font-weight: bold; }
    .item-subtitle { font-size: ${fs.base}; font-style: italic; color: #333; }
    .item-meta { font-size: ${fs.base}; color: #555; }
    .description { font-size: ${fs.base}; margin-top: 6px; line-height: 1.6; }
    .achievement { font-size: ${fs.base}; margin: 4px 0 4px 20px; }
    .skills { column-count: 3; column-gap: 20px; }
    .skill { font-size: ${fs.base}; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resume.fullName || 'YOUR NAME'}</div>
    ${resume.title ? `<div class="job-title">${resume.title}</div>` : ''}
    <div class="contact">
      ${[resume.email, resume.phone, resume.location, resume.linkedin, resume.github, resume.website].filter(Boolean).join(' | ')}
    </div>
  </div>

  ${resume.summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="description">${resume.summary}</div>
  </div>
  ` : ''}

  ${resume.experience.length > 0 ? `
  <div class="section">
    <div class="section-title">Professional Experience</div>
    ${resume.experience.map(exp => `
      <div class="item">
        <div class="item-header">
          <div>
            <div class="item-title">${exp.title || 'Job Title'}</div>
            <div class="item-subtitle">${exp.company || 'Company'}${exp.location ? `, ${exp.location}` : ''}</div>
          </div>
          <div class="item-meta">${exp.startDate || 'Start'} - ${exp.current ? 'Present' : exp.endDate || 'End'}</div>
        </div>
        ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
        ${exp.achievements.map(ach => `<div class="achievement">• ${ach}</div>`).join('')}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${resume.education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${resume.education.map(edu => `
      <div class="item">
        <div class="item-header">
          <div>
            <div class="item-title">${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}</div>
            <div class="item-subtitle">${edu.school || 'School'}${edu.location ? `, ${edu.location}` : ''}</div>
          </div>
          <div class="item-meta">${edu.startDate || 'Start'} - ${edu.endDate || 'End'}</div>
        </div>
        ${edu.gpa ? `<div class="description">GPA: ${edu.gpa}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${resume.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills">
      ${resume.skills.map(skill => `<div class="skill">• ${skill}</div>`).join('')}
    </div>
  </div>
  ` : ''}
</body>
</html>`,

            minimal: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 750px; margin: 0 auto; padding: 40px; color: #000; font-size: ${fs.base}; }
    .name { font-size: ${fs.title}; font-weight: 300; margin-bottom: 6px; letter-spacing: -1px; }
    .job-title { font-size: ${fs.subtitle}; color: #666; margin-bottom: 12px; font-weight: 400; }
    .contact { font-size: ${fs.base}; color: #666; margin-bottom: 40px; }
    .section { margin: 35px 0; }
    .section-title { font-size: ${fs.base}; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
    .item { margin-bottom: 20px; }
    .item-title { font-size: ${fs.subtitle}; font-weight: 600; }
    .item-subtitle { font-size: ${fs.base}; color: #333; margin-top: 2px; }
    .item-meta { font-size: ${fs.base}; color: #666; margin-top: 2px; }
    .description { font-size: ${fs.base}; margin-top: 6px; color: #333; line-height: 1.6; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill { font-size: ${fs.base}; color: #333; padding: 4px 0; }
    .skill:after { content: " •"; color: #ccc; margin-left: 8px; }
    .skill:last-child:after { content: ""; }
  </style>
</head>
<body>
  <div class="name">${resume.fullName || 'Your Name'}</div>
  ${resume.title ? `<div class="job-title">${resume.title}</div>` : ''}
  <div class="contact">${[resume.email, resume.phone, resume.location].filter(Boolean).join(' • ')}</div>

  ${resume.summary ? `
  <div class="section">
    <div class="section-title">Summary</div>
    <div class="description">${resume.summary}</div>
  </div>
  ` : ''}

  ${resume.experience.length > 0 ? `
  <div class="section">
    <div class="section-title">Experience</div>
    ${resume.experience.map(exp => `
      <div class="item">
        <div class="item-title">${exp.title || 'Job Title'}</div>
        <div class="item-subtitle">${exp.company || 'Company'}</div>
        <div class="item-meta">${exp.startDate || 'Start'} - ${exp.current ? 'Present' : exp.endDate || 'End'}</div>
        ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${resume.education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${resume.education.map(edu => `
      <div class="item">
        <div class="item-title">${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}</div>
        <div class="item-subtitle">${edu.school || 'School'}</div>
        <div class="item-meta">${edu.endDate || 'Year'}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${resume.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills">
      ${resume.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
    </div>
  </div>
  ` : ''}
</body>
</html>`,

            creative: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Poppins', 'Arial', sans-serif; max-width: 900px; margin: 0 auto; padding: 0; color: #2d3748; font-size: ${fs.base}; }
    .container { display: grid; grid-template-columns: 300px 1fr; min-height: 100vh; }
    .sidebar { background: linear-gradient(180deg, ${resume.accentColor} 0%, ${resume.accentColor}cc 100%); color: white; padding: 48px 32px; }
    .main { padding: 48px 40px; }
    .name { font-size: ${fs.title}; font-weight: 700; margin-bottom: 8px; line-height: 1.2; }
    .job-title { font-size: ${fs.subtitle}; opacity: 0.95; margin-bottom: 24px; }
    .sidebar-section { margin-bottom: 32px; }
    .sidebar-title { font-size: ${fs.section}; font-weight: 700; margin-bottom: 16px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 8px; }
    .contact-item { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-size: ${fs.base}; }
    .skill-item { background: rgba(255,255,255,0.2); padding: 8px 14px; border-radius: 6px; margin-bottom: 8px; font-size: ${fs.base}; }
    .section { margin-bottom: 36px; }
    .section-title { font-size: ${fs.section}; font-weight: 700; color: ${resume.accentColor}; margin-bottom: 20px; position: relative; padding-bottom: 10px; }
    .section-title:after { content: ''; position: absolute; bottom: 0; left: 0; width: 60px; height: 3px; background: ${resume.accentColor}; }
    .item { margin-bottom: 24px; position: relative; padding-left: 24px; }
    .item:before { content: ''; position: absolute; left: 0; top: 6px; width: 12px; height: 12px; background: ${resume.accentColor}; border-radius: 50%; }
    .item-title { font-size: ${fs.subtitle}; font-weight: 700; color: #1a202c; }
    .item-subtitle { font-size: ${fs.base}; color: ${resume.accentColor}; font-weight: 600; margin-top: 4px; }
    .item-meta { font-size: ${fs.base}; color: #718096; margin-top: 4px; }
    .description { font-size: ${fs.base}; color: #4a5568; margin-top: 8px; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="name">${resume.fullName || 'Your Name'}</div>
      ${resume.title ? `<div class="job-title">${resume.title}</div>` : ''}
      
      <div class="sidebar-section">
        <div class="sidebar-title">Contact</div>
        ${resume.email ? `<div class="contact-item">📧 ${resume.email}</div>` : ''}
        ${resume.phone ? `<div class="contact-item">📱 ${resume.phone}</div>` : ''}
        ${resume.location ? `<div class="contact-item">📍 ${resume.location}</div>` : ''}
        ${resume.linkedin ? `<div class="contact-item">🔗 LinkedIn</div>` : ''}
        ${resume.github ? `<div class="contact-item">💻 GitHub</div>` : ''}
      </div>
      
      ${resume.skills.length > 0 ? `
      <div class="sidebar-section">
        <div class="sidebar-title">Skills</div>
        ${resume.skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
      </div>
      ` : ''}
      
      ${resume.languages.length > 0 ? `
      <div class="sidebar-section">
        <div class="sidebar-title">Languages</div>
        ${resume.languages.map(lang => `<div class="skill-item">${lang.language} - ${lang.proficiency}</div>`).join('')}
      </div>
      ` : ''}
    </div>
    
    <div class="main">
      ${resume.summary ? `
      <div class="section">
        <div class="section-title">About Me</div>
        <div class="description">${resume.summary}</div>
      </div>
      ` : ''}
      
      ${resume.experience.length > 0 ? `
      <div class="section">
        <div class="section-title">Experience</div>
        ${resume.experience.map(exp => `
          <div class="item">
            <div class="item-title">${exp.title || 'Job Title'}</div>
            <div class="item-subtitle">${exp.company || 'Company'}</div>
            <div class="item-meta">${exp.startDate || 'Start'} - ${exp.current ? 'Present' : exp.endDate || 'End'}</div>
            ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${resume.education.length > 0 ? `
      <div class="section">
        <div class="section-title">Education</div>
        ${resume.education.map(edu => `
          <div class="item">
            <div class="item-title">${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}</div>
            <div class="item-subtitle">${edu.school || 'School'}</div>
            <div class="item-meta">${edu.endDate || 'Year'}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`,

            executive: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Palatino', 'Georgia', serif; max-width: 850px; margin: 0 auto; padding: 48px; color: #1a1a1a; font-size: ${fs.base}; background: #fff; }
    .header { border-left: 6px solid ${resume.accentColor}; padding-left: 24px; margin-bottom: 40px; }
    .name { font-size: ${fs.title}; font-weight: 700; margin-bottom: 6px; color: #000; }
    .job-title { font-size: ${fs.subtitle}; color: #555; margin-bottom: 16px; font-weight: 400; }
    .contact { font-size: ${fs.base}; color: #666; line-height: 1.8; }
    .section { margin: 36px 0; }
    .section-title { font-size: ${fs.section}; font-weight: 700; color: ${resume.accentColor}; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
    .item { margin-bottom: 28px; border-left: 2px solid #e0e0e0; padding-left: 20px; }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .item-title { font-size: ${fs.subtitle}; font-weight: 700; color: #000; }
    .item-subtitle { font-size: ${fs.base}; color: ${resume.accentColor}; font-weight: 600; margin-top: 4px; }
    .item-meta { font-size: ${fs.base}; color: #888; font-style: italic; }
    .description { font-size: ${fs.base}; color: #333; margin-top: 10px; line-height: 1.8; }
    .achievement { font-size: ${fs.base}; color: #444; margin: 8px 0; padding-left: 20px; position: relative; }
    .achievement:before { content: '✓'; position: absolute; left: 0; color: ${resume.accentColor}; font-weight: bold; }
    .skills-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .skill { font-size: ${fs.base}; color: #333; padding: 10px; background: #f8f8f8; border-left: 3px solid ${resume.accentColor}; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resume.fullName || 'Your Name'}</div>
    ${resume.title ? `<div class="job-title">${resume.title}</div>` : ''}
    <div class="contact">
      ${[resume.email, resume.phone, resume.location, resume.linkedin].filter(Boolean).join(' | ')}
    </div>
  </div>

  ${resume.summary ? `
  <div class="section">
    <div class="section-title">Executive Summary</div>
    <div class="description">${resume.summary}</div>
  </div>
  ` : ''}

  ${resume.experience.length > 0 ? `
  <div class="section">
    <div class="section-title">Professional Experience</div>
    ${resume.experience.map(exp => `
      <div class="item">
        <div class="item-header">
          <div>
            <div class="item-title">${exp.title || 'Job Title'}</div>
            <div class="item-subtitle">${exp.company || 'Company'}${exp.location ? ` • ${exp.location}` : ''}</div>
          </div>
          <div class="item-meta">${exp.startDate || 'Start'} - ${exp.current ? 'Present' : exp.endDate || 'End'}</div>
        </div>
        ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
        ${exp.achievements.map(ach => `<div class="achievement">${ach}</div>`).join('')}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${resume.education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education & Credentials</div>
    ${resume.education.map(edu => `
      <div class="item">
        <div class="item-title">${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}</div>
        <div class="item-subtitle">${edu.school || 'School'}</div>
        <div class="item-meta">${edu.endDate || 'Year'}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${resume.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Core Competencies</div>
    <div class="skills-container">
      ${resume.skills.map(skill => `<div class="skill">${skill}</div>`).join('')}
    </div>
  </div>
  ` : ''}
</body>
</html>`
        };

        return templates[template];
    };

    const downloadResume = () => {
        const html = generateResumeHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.fullName.replace(/\s+/g, '-').toLowerCase() || 'resume'}-${template}.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Resume downloaded successfully!');
    };

    const printResume = () => {
        const html = generateResumeHTML();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }
    };

    const saveData = () => {
        const json = JSON.stringify(resume, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Resume data saved!');
    };

    const loadData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    setResume(data);
                    toast.success('Resume data loaded!');
                } catch (error) {
                    toast.error('Failed to load resume data');
                }
            };
            reader.readAsText(file);
        }
    };

    const copyToClipboard = () => {
        const html = generateResumeHTML();
        navigator.clipboard.writeText(html).then(() => {
            setCopied(true);
            toast.success('HTML copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <AnimatedElement>
            <div className="max-w-[1800px] mx-auto">
                <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                                    <Sparkles className="h-8 w-8 text-blue-600" />
                                    Professional Resume Builder
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Create ATS-friendly resumes with AI assistance and professional templates
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={saveData} variant="outline" size="sm">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Data
                                </Button>
                                <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Load Data
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={loadData}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                            {/* Sidebar Navigation */}
                            <div className="xl:col-span-1">
                                <div className="sticky top-4 space-y-2">
                                    <h3 className="font-semibold text-sm text-gray-500 mb-3">SECTIONS</h3>
                                    {[
                                        { id: 'personal', label: 'Personal Info', icon: Mail },
                                        { id: 'summary', label: 'Summary', icon: FileText },
                                        { id: 'experience', label: 'Experience', icon: Briefcase },
                                        { id: 'education', label: 'Education', icon: GraduationCap },
                                        { id: 'projects', label: 'Projects', icon: Code },
                                        { id: 'certifications', label: 'Certifications', icon: Award },
                                        { id: 'skills', label: 'Skills', icon: Star },
                                        { id: 'languages', label: 'Languages', icon: Languages },
                                        { id: 'settings', label: 'Settings', icon: Settings },
                                    ].map(({ id, label, icon: Icon }) => (
                                        <Button
                                            key={id}
                                            variant={activeSection === id ? 'default' : 'ghost'}
                                            className="w-full justify-start"
                                            size="sm"
                                            onClick={() => setActiveSection(id)}
                                        >
                                            <Icon className="h-4 w-4 mr-2" />
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Form */}
                            <div className="xl:col-span-2 space-y-6 max-h-[900px] overflow-y-auto pr-4">
                                {/* Personal Information */}
                                {activeSection === 'personal' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <h3 className="font-bold text-xl flex items-center gap-2">
                                            <Mail className="h-5 w-5" />
                                            Personal Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <Label>Full Name *</Label>
                                                <Input
                                                    placeholder="John Doe"
                                                    value={resume.fullName}
                                                    onChange={(e) => updateField('fullName', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label>Professional Title</Label>
                                                <Input
                                                    placeholder="Senior Software Engineer"
                                                    value={resume.title}
                                                    onChange={(e) => updateField('title', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label>Email *</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={resume.email}
                                                    onChange={(e) => updateField('email', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label>Phone</Label>
                                                <Input
                                                    placeholder="+1 (555) 123-4567"
                                                    value={resume.phone}
                                                    onChange={(e) => updateField('phone', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label>Location</Label>
                                                <Input
                                                    placeholder="San Francisco, CA"
                                                    value={resume.location}
                                                    onChange={(e) => updateField('location', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label>LinkedIn</Label>
                                                <Input
                                                    placeholder="linkedin.com/in/johndoe"
                                                    value={resume.linkedin}
                                                    onChange={(e) => updateField('linkedin', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label>GitHub</Label>
                                                <Input
                                                    placeholder="github.com/johndoe"
                                                    value={resume.github}
                                                    onChange={(e) => updateField('github', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label>Website</Label>
                                                <Input
                                                    placeholder="johndoe.com"
                                                    value={resume.website}
                                                    onChange={(e) => updateField('website', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Professional Summary */}
                                {activeSection === 'summary' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xl flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Professional Summary
                                            </h3>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={async () => {
                                                    if (resume.summary) {
                                                        const enhanced = await enhanceWithAI(resume.summary, 'summary');
                                                        updateField('summary', enhanced);
                                                        toast.success('Summary enhanced with AI!');
                                                    }
                                                }}
                                            >
                                                <Wand2 className="h-4 w-4 mr-2" />
                                                Enhance with AI
                                            </Button>
                                        </div>
                                        <Textarea
                                            placeholder="Write a compelling professional summary that highlights your key achievements, skills, and career objectives..."
                                            value={resume.summary}
                                            onChange={(e) => updateField('summary', e.target.value)}
                                            rows={6}
                                        />
                                        <p className="text-sm text-gray-500">
                                            Tip: Include 3-4 sentences highlighting your expertise, achievements, and career goals.
                                        </p>
                                    </div>
                                )}

                                {/* Work Experience */}
                                {activeSection === 'experience' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xl flex items-center gap-2">
                                                <Briefcase className="h-5 w-5" />
                                                Work Experience
                                            </h3>
                                            <Button onClick={addExperience} size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Experience
                                            </Button>
                                        </div>

                                        {resume.experience.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-500">No experience added yet</p>
                                                <Button onClick={addExperience} variant="outline" size="sm" className="mt-2">
                                                    Add Your First Experience
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {resume.experience.map((exp, index) => (
                                                    <Card key={exp.id} className="p-4 border-2">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-sm font-semibold text-blue-600">
                                                                    Experience {index + 1}
                                                                </span>
                                                                <Button
                                                                    onClick={() => removeExperience(exp.id)}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="col-span-2">
                                                                    <Label>Job Title *</Label>
                                                                    <Input
                                                                        placeholder="Software Engineer"
                                                                        value={exp.title}
                                                                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Company *</Label>
                                                                    <Input
                                                                        placeholder="Google"
                                                                        value={exp.company}
                                                                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Location</Label>
                                                                    <Input
                                                                        placeholder="San Francisco, CA"
                                                                        value={exp.location}
                                                                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Start Date</Label>
                                                                    <Input
                                                                        placeholder="Jan 2020"
                                                                        value={exp.startDate}
                                                                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>End Date</Label>
                                                                    <Input
                                                                        placeholder="Dec 2023"
                                                                        value={exp.endDate}
                                                                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                                        disabled={exp.current}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={exp.current}
                                                                    onCheckedChange={(checked) => updateExperience(exp.id, 'current', checked)}
                                                                />
                                                                <Label className="cursor-pointer">I currently work here</Label>
                                                            </div>

                                                            <div>
                                                                <Label>Description</Label>
                                                                <Textarea
                                                                    placeholder="Brief overview of your role and responsibilities..."
                                                                    value={exp.description}
                                                                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                                                    rows={3}
                                                                    className="mt-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <Label>Key Achievements</Label>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => addAchievement(exp.id)}
                                                                    >
                                                                        <Plus className="h-3 w-3 mr-1" />
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                                {exp.achievements.map((ach, achIndex) => (
                                                                    <div key={achIndex} className="flex gap-2 mb-2">
                                                                        <Input
                                                                            placeholder="Increased sales by 150% through strategic initiatives"
                                                                            value={ach}
                                                                            onChange={(e) => {
                                                                                const newAchievements = [...exp.achievements];
                                                                                newAchievements[achIndex] = e.target.value;
                                                                                updateExperience(exp.id, 'achievements', newAchievements);
                                                                            }}
                                                                        />
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => {
                                                                                const newAchievements = exp.achievements.filter((_, i) => i !== achIndex);
                                                                                updateExperience(exp.id, 'achievements', newAchievements);
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Education */}
                                {activeSection === 'education' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xl flex items-center gap-2">
                                                <GraduationCap className="h-5 w-5" />
                                                Education
                                            </h3>
                                            <Button onClick={addEducation} size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Education
                                            </Button>
                                        </div>

                                        {resume.education.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-500">No education added yet</p>
                                                <Button onClick={addEducation} variant="outline" size="sm" className="mt-2">
                                                    Add Your Education
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {resume.education.map((edu, index) => (
                                                    <Card key={edu.id} className="p-4 border-2">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-sm font-semibold text-blue-600">
                                                                    Education {index + 1}
                                                                </span>
                                                                <Button
                                                                    onClick={() => removeEducation(edu.id)}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <Label>Degree *</Label>
                                                                    <Input
                                                                        placeholder="Bachelor of Science"
                                                                        value={edu.degree}
                                                                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Field of Study</Label>
                                                                    <Input
                                                                        placeholder="Computer Science"
                                                                        value={edu.field}
                                                                        onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>School/University *</Label>
                                                                    <Input
                                                                        placeholder="Stanford University"
                                                                        value={edu.school}
                                                                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Location</Label>
                                                                    <Input
                                                                        placeholder="Stanford, CA"
                                                                        value={edu.location}
                                                                        onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Start Date</Label>
                                                                    <Input
                                                                        placeholder="2016"
                                                                        value={edu.startDate}
                                                                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>End Date</Label>
                                                                    <Input
                                                                        placeholder="2020"
                                                                        value={edu.endDate}
                                                                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <Label>GPA (Optional)</Label>
                                                                    <Input
                                                                        placeholder="3.8/4.0"
                                                                        value={edu.gpa}
                                                                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Projects */}
                                {activeSection === 'projects' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xl flex items-center gap-2">
                                                <Code className="h-5 w-5" />
                                                Projects
                                            </h3>
                                            <Button onClick={addProject} size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Project
                                            </Button>
                                        </div>

                                        {resume.projects.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <Code className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-500">No projects added yet</p>
                                                <Button onClick={addProject} variant="outline" size="sm" className="mt-2">
                                                    Add Your First Project
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {resume.projects.map((proj, index) => (
                                                    <Card key={proj.id} className="p-4 border-2">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-sm font-semibold text-blue-600">
                                                                    Project {index + 1}
                                                                </span>
                                                                <Button
                                                                    onClick={() => removeProject(proj.id)}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </div>

                                                            <div>
                                                                <Label>Project Name *</Label>
                                                                <Input
                                                                    placeholder="E-commerce Platform"
                                                                    value={proj.name}
                                                                    onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                                                                    className="mt-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label>Description</Label>
                                                                <Textarea
                                                                    placeholder="Built a full-stack e-commerce platform with real-time inventory management..."
                                                                    value={proj.description}
                                                                    onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                                                                    rows={3}
                                                                    className="mt-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label>Technologies Used</Label>
                                                                <Input
                                                                    placeholder="React, Node.js, MongoDB, AWS"
                                                                    value={proj.technologies}
                                                                    onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                                                                    className="mt-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label>Project Link</Label>
                                                                <Input
                                                                    placeholder="https://github.com/username/project"
                                                                    value={proj.link}
                                                                    onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Certifications */}
                                {activeSection === 'certifications' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xl flex items-center gap-2">
                                                <Award className="h-5 w-5" />
                                                Certifications
                                            </h3>
                                            <Button onClick={addCertification} size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Certification
                                            </Button>
                                        </div>

                                        {resume.certifications.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <Award className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-500">No certifications added yet</p>
                                                <Button onClick={addCertification} variant="outline" size="sm" className="mt-2">
                                                    Add Your First Certification
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {resume.certifications.map((cert, index) => (
                                                    <Card key={cert.id} className="p-4 border-2">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-sm font-semibold text-blue-600">
                                                                    Certification {index + 1}
                                                                </span>
                                                                <Button
                                                                    onClick={() => removeCertification(cert.id)}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="col-span-2">
                                                                    <Label>Certification Name *</Label>
                                                                    <Input
                                                                        placeholder="AWS Certified Solutions Architect"
                                                                        value={cert.name}
                                                                        onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Issuing Organization</Label>
                                                                    <Input
                                                                        placeholder="Amazon Web Services"
                                                                        value={cert.issuer}
                                                                        onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Date Earned</Label>
                                                                    <Input
                                                                        placeholder="Jan 2024"
                                                                        value={cert.date}
                                                                        onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <Label>Credential ID (Optional)</Label>
                                                                    <Input
                                                                        placeholder="ABC123XYZ"
                                                                        value={cert.credentialId}
                                                                        onChange={(e) => updateCertification(cert.id, 'credentialId', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Skills */}
                                {activeSection === 'skills' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <h3 className="font-bold text-xl flex items-center gap-2">
                                            <Star className="h-5 w-5" />
                                            Skills
                                        </h3>

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add a skill (e.g., JavaScript, Project Management)"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                            />
                                            <Button onClick={addSkill}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {resume.skills.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <Star className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-500">No skills added yet</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {resume.skills.map((skill, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full flex items-center gap-2 group"
                                                    >
                                                        <span>{skill}</span>
                                                        <button
                                                            onClick={() => removeSkill(skill)}
                                                            className="hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-900">
                                                <strong>Pro Tip:</strong> Include both technical and soft skills. Be specific and include proficiency levels when relevant.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Languages */}
                                {activeSection === 'languages' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xl flex items-center gap-2">
                                                <Languages className="h-5 w-5" />
                                                Languages
                                            </h3>
                                            <Button onClick={addLanguage} size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Language
                                            </Button>
                                        </div>

                                        {resume.languages.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <Languages className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-500">No languages added yet</p>
                                                <Button onClick={addLanguage} variant="outline" size="sm" className="mt-2">
                                                    Add a Language
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {resume.languages.map((lang, index) => (
                                                    <div key={index} className="flex gap-2 items-start">
                                                        <Input
                                                            placeholder="Language (e.g., English)"
                                                            value={lang.language}
                                                            onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                                                        />
                                                        <Select
                                                            value={lang.proficiency}
                                                            onValueChange={(value) => updateLanguage(index, 'proficiency', value)}
                                                        >
                                                            <SelectTrigger className="w-[180px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Native">Native</SelectItem>
                                                                <SelectItem value="Fluent">Fluent</SelectItem>
                                                                <SelectItem value="Professional">Professional</SelectItem>
                                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                                <SelectItem value="Basic">Basic</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            onClick={() => removeLanguage(index)}
                                                            size="sm"
                                                            variant="ghost"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Settings */}
                                {activeSection === 'settings' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <h3 className="font-bold text-xl flex items-center gap-2">
                                            <Settings className="h-5 w-5" />
                                            Resume Settings
                                        </h3>

                                        <Card className="p-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-base font-semibold">Accent Color</Label>
                                                    <p className="text-sm text-gray-500 mb-3">Choose your resume's accent color</p>
                                                    <div className="flex gap-3 flex-wrap">
                                                        {['#667eea', '#f56565', '#48bb78', '#ed8936', '#9f7aea', '#38b2ac'].map((color) => (
                                                            <button
                                                                key={color}
                                                                onClick={() => updateField('accentColor', color)}
                                                                className={`w-12 h-12 rounded-lg border-2 ${resume.accentColor === color ? 'border-black scale-110' : 'border-gray-300'} transition-all`}
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                        <input
                                                            type="color"
                                                            value={resume.accentColor}
                                                            onChange={(e) => updateField('accentColor', e.target.value)}
                                                            className="w-12 h-12 rounded-lg border-2 border-gray-300"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="text-base font-semibold">Font Size</Label>
                                                    <p className="text-sm text-gray-500 mb-3">Adjust text size for readability</p>
                                                    <Select
                                                        value={resume.fontSize}
                                                        onValueChange={(value: any) => updateField('fontSize', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="small">Small (Compact)</SelectItem>
                                                            <SelectItem value="medium">Medium (Recommended)</SelectItem>
                                                            <SelectItem value="large">Large (Easy to Read)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <Label className="text-base font-semibold">Profile Photo</Label>
                                                        <p className="text-sm text-gray-500">Show photo on resume (Modern template only)</p>
                                                    </div>
                                                    <Switch
                                                        checked={resume.showPhoto}
                                                        onCheckedChange={(checked) => updateField('showPhoto', checked)}
                                                    />
                                                </div>

                                                {resume.showPhoto && (
                                                    <div>
                                                        <Label>Photo URL</Label>
                                                        <Input
                                                            placeholder="https://example.com/photo.jpg"
                                                            value={resume.photoUrl}
                                                            onChange={(e) => updateField('photoUrl', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                )}
                            </div>

                            {/* Preview */}
                            <div className="xl:col-span-2 space-y-4">
                                <div className="sticky top-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            {previewMode ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                            Preview
                                        </h3>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setPreviewMode(!previewMode)}
                                            >
                                                {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <Tabs value={template} onValueChange={(v) => setTemplate(v as any)} className="w-full">
                                        <TabsList className="grid grid-cols-5 w-full">
                                            <TabsTrigger value="modern">Modern</TabsTrigger>
                                            <TabsTrigger value="classic">Classic</TabsTrigger>
                                            <TabsTrigger value="minimal">Minimal</TabsTrigger>
                                            <TabsTrigger value="creative">Creative</TabsTrigger>
                                            <TabsTrigger value="executive">Executive</TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    {previewMode && (
                                        <div className="border-2 rounded-lg p-6 bg-white min-h-[700px] max-h-[800px] overflow-auto shadow-lg">
                                            <div dangerouslySetInnerHTML={{ __html: generateResumeHTML() }} />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button onClick={downloadResume} className="w-full">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download HTML
                                        </Button>
                                        <Button onClick={printResume} variant="outline" className="w-full">
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print/PDF
                                        </Button>
                                        <Button onClick={copyToClipboard} variant="outline" className="w-full">
                                            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                            {copied ? 'Copied!' : 'Copy HTML'}
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full">
                                                    <Share2 className="h-4 w-4 mr-2" />
                                                    Share
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Share Your Resume</DialogTitle>
                                                    <DialogDescription>
                                                        Your resume has been saved. You can download it or print it to PDF for sharing.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-2">
                                                    <Button onClick={downloadResume} className="w-full">Download HTML</Button>
                                                    <Button onClick={printResume} variant="outline" className="w-full">Print to PDF</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-blue-600" />
                                            Quick Tips
                                        </h4>
                                        <ul className="text-sm space-y-1 text-gray-700">
                                            <li>• Use action verbs and quantify achievements</li>
                                            <li>• Keep your resume to 1-2 pages</li>
                                            <li>• Tailor content for each job application</li>
                                            <li>• Use AI enhancement for better phrasing</li>
                                            <li>• Proofread carefully before sending</li>
                                        </ul>
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

export default EnhancedResumeBuilder;