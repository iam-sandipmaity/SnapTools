'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, AlertTriangle, Copy, Download, Eye, Database, Lock, Globe, Bell } from 'lucide-react';

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  category: string;
}

const complianceChecks: ComplianceItem[] = [
  // Data Collection
  { id: 'consent_banner', title: 'Cookie Consent Banner', description: 'Website displays cookie consent banner', category: 'Cookies' },
  { id: 'consent_record', title: 'Consent Records', description: 'Records of user consent are maintained', category: 'Cookies' },
  { id: 'cookie_policy', title: 'Cookie Policy', description: 'Published cookie policy on website', category: 'Cookies' },
  
  // Privacy
  { id: 'privacy_policy', title: 'Privacy Policy', description: 'Published privacy policy on website', category: 'Privacy' },
  { id: 'data_minimization', title: 'Data Minimization', description: 'Collects only necessary data', category: 'Privacy' },
  { id: 'purpose_limitation', title: 'Purpose Limitation', description: 'Data used only for stated purposes', category: 'Privacy' },
  
  // Security
  { id: 'ssl_encryption', title: 'SSL/TLS Encryption', description: 'Website uses HTTPS encryption', category: 'Security' },
  { id: 'secure_storage', title: 'Secure Data Storage', description: 'Data stored securely with encryption', category: 'Security' },
  { id: 'access_control', title: 'Access Controls', description: 'Proper access controls implemented', category: 'Security' },
  
  // User Rights
  { id: 'right_access', title: 'Right to Access', description: 'Users can request their data', category: 'User Rights' },
  { id: 'right_delete', title: 'Right to Deletion', description: 'Users can request data deletion', category: 'User Rights' },
  { id: 'right_portability', title: 'Right to Portability', description: 'Data can be exported in common format', category: 'User Rights' },
  { id: 'dpo_contact', title: 'DPO Contact', description: 'Data protection officer contact available', category: 'User Rights' },
  
  // Third Party
  { id: 'third_party_list', title: 'Third-Party List', description: 'List of third-party data processors', category: 'Third Party' },
  { id: 'data_processing_agreement', title: 'DPA with Processors', description: 'Data processing agreements in place', category: 'Third Party' },
  
  // Breach
  { id: 'breach_notification', title: 'Breach Notification', description: 'Process to notify users of data breaches', category: 'Breach' },
  { id: 'breach_procedure', title: 'Incident Response', description: 'Documented incident response procedure', category: 'Breach' },
];

const GDPRChecker = () => {
  const [url, setUrl] = useState('');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [analyzed, setAnalyzed] = useState(false);

  const toggleItem = (id: string) => {
    if (checkedItems.includes(id)) {
      setCheckedItems(checkedItems.filter(i => i !== id));
    } else {
      setCheckedItems([...checkedItems, id]);
    }
  };

  const analyze = () => {
    if (!url) {
      toast.error('Please enter a website URL');
      return;
    }
    setAnalyzed(true);
  };

  const score = checkedItems.length;
  const total = complianceChecks.length;
  const percentage = Math.round((score / total) * 100);

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = () => {
    if (percentage >= 80) return 'Compliant';
    if (percentage >= 50) return 'Partially Compliant';
    return 'Non-Compliant';
  };

  const categories = [...new Set(complianceChecks.map(c => c.category))];

  const generateReport = () => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const report = `# GDPR Compliance Report for ${url}

Generated: ${currentDate}

## Overall Score

**${percentage}% Compliant** (${score}/${total} requirements met)

## Compliance Details

${categories.map(cat => {
  const catItems = complianceChecks.filter(c => c.category === cat);
  const catScore = catItems.filter(i => checkedItems.includes(i.id)).length;
  return `### ${cat} (${catScore}/${catItems.length})

${catItems.map(item => {
  const isChecked = checkedItems.includes(item.id);
  return `- ${isChecked ? '✓' : '✗'} ${item.title}: ${item.description}`;
}).join('\n')}`;
}).join('\n\n')}

## Recommendations

${percentage < 80 ? 'The following areas need attention:\n\n' + complianceChecks.filter(c => !checkedItems.includes(c.id)).map(item => `- ${item.title}: ${item.description}`).join('\n') : 'Great job! Your website appears to be well-aligned with GDPR requirements.'}

## Next Steps

1. Review the checklist above
2. Implement missing requirements
3. Consider getting a formal GDPR audit
4. Document all compliance measures

---
*This report is for informational purposes only and does not constitute legal advice.*
`;

    return report;
  };

  const handleCopy = () => {
    const report = generateReport();
    navigator.clipboard.writeText(report);
    toast.success('Report copied to clipboard!');
  };

  const handleDownload = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = 'gdpr-compliance-report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(urlObj);
    toast.success('Report downloaded!');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          GDPR Compliance Checker
        </h1>
        <p className="text-muted-foreground">
          Check your website's GDPR compliance status
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Analysis</CardTitle>
            <CardDescription>Enter your website URL to check compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={analyze}>
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>

        {analyzed && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Compliance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getScoreColor()} mb-2`}>
                      {percentage}%
                    </div>
                    <div className={`text-xl font-semibold ${getScoreColor()}`}>
                      {getScoreLabel()}
                    </div>
                    <div className="text-muted-foreground mt-2">
                      {score} of {total} requirements met
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GDPR Checklist</CardTitle>
                <CardDescription>Check all that apply to your website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categories.map(category => (
                    <div key={category}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        {category === 'Cookies' && <Database className="h-4 w-4" />}
                        {category === 'Privacy' && <Eye className="h-4 w-4" />}
                        {category === 'Security' && <Lock className="h-4 w-4" />}
                        {category === 'User Rights' && <Globe className="h-4 w-4" />}
                        {category === 'Third Party' && <Shield className="h-4 w-4" />}
                        {category === 'Breach' && <AlertTriangle className="h-4 w-4" />}
                        {category}
                      </h3>
                      <div className="grid gap-3">
                        {complianceChecks.filter(c => c.category === category).map(item => (
                          <div key={item.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={item.id}
                              checked={checkedItems.includes(item.id)}
                              onCheckedChange={() => toggleItem(item.id)}
                            />
                            <div>
                              <Label htmlFor={item.id} className="font-medium cursor-pointer">
                                {item.title}
                              </Label>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleCopy} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy Report
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GDPRChecker;
