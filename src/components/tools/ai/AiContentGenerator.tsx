import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Sparkles, Loader2, CheckCircle2, FileText, Code2 } from 'lucide-react';
import { toast } from 'sonner';

const AiContentGenerator = () => {
  const [topic, setTopic] = useState<string>('');
  const [contentType, setContentType] = useState<'blog' | 'article' | 'product' | 'social' | 'email'>('blog');
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly' | 'authoritative'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [keywords, setKeywords] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Content type configurations
  const contentTypes = [
    { value: 'blog', label: 'Blog Post', icon: '📝', description: 'SEO-optimized blog content' },
    { value: 'article', label: 'Article', icon: '📰', description: 'In-depth article with structure' },
    { value: 'product', label: 'Product Description', icon: '🛍️', description: 'Compeling product copy' },
    { value: 'social', label: 'Social Media Post', icon: '💬', description: 'Engaging social content' },
    { value: 'email', label: 'Email/Newsletter', icon: '📧', description: 'Professional email content' },
  ];

  // Simulated AI content generation
  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const wordCounts = { short: 150, medium: 400, long: 800 };
      const targetWords = wordCounts[length];
      
      // Generate structured content based on type
      let content = '';

      if (contentType === 'blog') {
        content = generateBlogPost(topic, tone, targetWords, keywords);
      } else if (contentType === 'article') {
        content = generateArticle(topic, tone, targetWords, keywords);
      } else if (contentType === 'product') {
        content = generateProductDescription(topic, tone, keywords);
      } else if (contentType === 'social') {
        content = generateSocialPost(topic, tone, keywords);
      } else if (contentType === 'email') {
        content = generateEmail(topic, tone, keywords);
      }

      setGeneratedContent(content);
      toast.success('Content generated successfully!');
    } catch (error) {
      toast.error('Error generating content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Content generation helpers (simulated AI output)
  const generateBlogPost = (topic: string, tone: string, words: number, keywords: string): string => {
    return `# ${topic}: A Comprehensive Guide

## Introduction

In today's digital landscape, understanding ${topic.toLowerCase()} has become increasingly important. Whether you're a beginner or an expert, this guide will provide valuable insights and actionable strategies.

## Key Benefits

• Improved efficiency and productivity
• Better understanding of core concepts  
• Practical tips you can implement today
• Expert insights and best practices

## Getting Started with ${topic}

The journey to mastering ${topic.toLowerCase()} begins with understanding the fundamentals. Here are the essential steps:

### 1. Research and Planning
Start by identifying your goals and objectives. What do you hope to achieve? Create a roadmap that aligns with your vision.

### 2. Implementation Strategy
Put your plan into action with these proven methods:
- Method 1: Start small and scale gradually
- Method 2: Leverage existing tools and resources
- Method 3: Monitor progress and adjust as needed

### 3. Optimization Techniques
Fine-tune your approach with advanced strategies that deliver results.

## Best Practices

1. **Consistency is Key**: Regular effort yields better results than sporadic bursts
2. **Stay Updated**: Follow industry trends and emerging technologies  
3. **Measure Success**: Track KPIs that matter to your goals
4. **Continuous Learning**: Never stop improving your skills

## Common Challenges

Even experts face obstacles. Here's how to overcome them:

- **Challenge 1**: Information overload → Focus on quality sources
- **Challenge 2**: Keeping momentum → Set realistic milestones
- **Challenge 3**: Measuring ROI → Define clear metrics upfront

## Conclusion

Mastering ${topic.toLowerCase()} is a journey, not a destination. With the strategies outlined in this guide, you're well-equipped to succeed. Start implementing these tips today and watch your results improve.

---

*Published on SnapTools AI - Generated with professional-grade AI*`;
  };

  const generateArticle = (topic: string, tone: string, words: number, keywords: string): string => {
    return `# ${topic}: An In-Depth Analysis

## Executive Summary

This article examines the critical aspects of ${topic.toLowerCase()} and its impact on modern practices. Through comprehensive analysis, we explore key findings and implications for stakeholders.

## Background

The evolution of ${topic.toLowerCase()} has transformed how organizations operate. Understanding this context is essential for informed decision-making.

## Main Findings

### Finding 1: Market Dynamics
Current trends indicate significant shifts in how ${topic.toLowerCase()} is perceived and utilized.

### Finding 2: Technology Integration
Modern solutions leverage cutting-edge technology to deliver superior outcomes.

### Finding 3: Future Outlook
Experts predict continued growth and innovation in this space.

## Discussion

The implications of these findings suggest a need for strategic adaptation. Organizations must evolve to remain competitive.

## Conclusion

${topic} represents a pivotal area for investment and focus. Stakeholders who act decisively will gain significant advantages.

---

*Professional analysis generated by SnapTools AI*`;
  };

  const generateProductDescription = (topic: string, tone: string, keywords: string): string => {
    return `# ${topic}

## Transform Your Experience

Discover the power of ${topic.toLowerCase()} with our innovative solution designed to exceed expectations.

## Key Features

✨ **Premium Quality** - Crafted with attention to every detail
🚀 **Lightning Fast** - Optimized for speed and efficiency  
🛡️ **Reliable & Secure** - Trusted by thousands worldwide
💎 **Exceptional Value** - Premium features at competitive prices

## Why Choose ${topic}?

Our solution stands out from the competition with:
- Unmatched performance and reliability
- Intuitive design that anyone can master
- 24/7 support from our expert team
- 30-day money-back guarantee

## Customer Testimonials

*"This product exceeded my expectations. Highly recommended!"* - Verified Buyer

## Order Now

Don't miss out on this opportunity. Experience ${topic.toLowerCase()} today and see the difference for yourself.

**Limited Time Offer** - Get 20% off when you order now!

---

*Compeling copy generated by SnapTools AI*`;
  };

  const generateSocialPost = (topic: string, tone: string, keywords: string): string => {
    return `🚀 ${topic} - You need to see this!

Just discovered how amazing ${topic.toLowerCase()} can be! Here are my top insights:

1/5 💡 The game has changed completely
2/5 🎯 Focus on what truly matters  
3/5 📈 Results speak for themselves
4/5 🔥 Join thousands who've already upgraded
5/5 ⭐ Don't get left behind

Drop a 🔥 if you're ready to level up!

#${topic.replace(/\s+/g, '')} #Innovation #GameChanger #MustTry

---

*Engaging social content generated by SnapTools AI*`;
  };

  const generateEmail = (topic: string, tone: string, keywords: string): string => {
    return `Subject: Unlock the Power of ${topic}

Dear Valued Reader,

I hope this message finds you well. Today, I'm excited to share insights about ${topic.toLowerCase()} that could transform your approach.

**Why This Matters**

In our rapidly evolving landscape, staying ahead requires access to the right information and tools. That's exactly what we're providing.

**What You'll Discover**

• Proven strategies that deliver results
• Expert tips from industry leaders
• Actionable insights you can apply today
• Exclusive resources available now

**Take Action Today**

Don't let this opportunity pass you by. The best time to start was yesterday; the second best time is now.

[Read More About ${topic}]

Best regards,
The SnapTools Team

P.S. Join our community of forward-thinkers today!

---

*Professional email content generated by SnapTools AI*`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  const clearAll = () => {
    setTopic('');
    setGeneratedContent('');
    setKeywords('');
  };

  const wordCount = generatedContent.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Content Generator - Professional Grade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Type Selection */}
          <div className="space-y-2">
            <Label>Content Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {contentTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                    contentType === type.value ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setContentType(type.value as any)}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="font-semibold text-sm">{type.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Subject</Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the topic or subject for content generation..."
              className="min-h-[100px]"
            />
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (~150 words)</SelectItem>
                  <SelectItem value="medium">Medium (~400 words)</SelectItem>
                  <SelectItem value="long">Long (~800 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (Optional)</Label>
              <Textarea
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="SEO keywords, comma-separated..."
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>

          <Button
            onClick={generateContent}
            disabled={isGenerating || !topic.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Generated Content
              </span>
              <div className="flex gap-2">
                <Badge variant="outline">{wordCount} words</Badge>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {generatedContent}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              About AI Content Generator
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>How it works:</strong> Our AI analyzes your topic and generates 
                professional-grade content tailored to your specifications.
              </p>
              <p>
                <strong>Features:</strong> Multiple content types, tone adjustment, 
                length control, keyword optimization, and copy-to-clipboard functionality.
              </p>
              <p>
                <strong>Note:</strong> This demo uses template-based generation. In production, 
                this would connect to advanced AI models like GPT-4, Claude, or Sarvam AI 
                for human-like content generation.
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Perfect for:</p>
              <div className="flex flex-wrap gap-2">
                {['Bloggers', 'Marketers', 'Business Owners', 'Content Creators', 'SEO Specialists', 'Agencies'].map(use => (
                  <Badge key={use} variant="outline">{use}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiContentGenerator;
