import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmailValidator = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{valid: boolean; message: string} | null>(null);

  const validateEmail = () => {
    if (!email.trim()) {
      setResult({ valid: false, message: 'Please enter an email address' });
      return;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    setResult({
      valid: isValid,
      message: isValid ? 'Email format is valid!' : 'Invalid email format',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Validator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && validateEmail()}
              />
              <Button onClick={validateEmail}>
                Validate
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="text-sm text-yellow-800 dark:text-yellow-200 font-medium flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900">Coming Soon</Badge>
              Advanced email validation features are under development!
            </div>
          </div>

          {result && (
            <Alert className={result.valid ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'}>
              <div className="flex items-center gap-2">
                {result.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <AlertDescription className={result.valid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                  {result.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="pt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">About Email Validator:</p>
            <p>Validate email addresses to ensure they follow proper formatting rules. This tool checks email syntax and structure. Advanced features including mailbox verification and disposable email detection coming soon!</p>
            
            <div className="mt-4 space-y-2">
              <p className="font-medium">Coming Soon Features:</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>Mailbox existence verification</li>
                <li>Disposable email detection</li>
                <li>Role-based email detection</li>
                <li>MX record validation</li>
                <li>Bulk email validation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailValidator;
