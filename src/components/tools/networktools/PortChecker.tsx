import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Network, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PortChecker = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{open: boolean; port: string} | null>(null);

  const checkPort = async () => {
    if (!host.trim() || !port.trim()) return;
    
    setLoading(true);
    // Port checking requires backend due to CORS restrictions
    // portchecker.io API doesn't allow browser requests
    setTimeout(() => {
      setResult({
        open: false,
        port: port,
      });
      setLoading(false);
    }, 1000);
  };

  const commonPorts = [
    { port: '21', service: 'FTP' },
    { port: '22', service: 'SSH' },
    { port: '80', service: 'HTTP' },
    { port: '443', service: 'HTTPS' },
    { port: '3306', service: 'MySQL' },
    { port: '5432', service: 'PostgreSQL' },
    { port: '27017', service: 'MongoDB' },
    { port: '8080', service: 'HTTP Proxy' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Port Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host / IP Address</Label>
              <Input
                id="host"
                type="text"
                placeholder="e.g., example.com or 8.8.8.8"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port Number</Label>
              <Input
                id="port"
                type="number"
                placeholder="e.g., 80, 443, 8080"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkPort()}
              />
            </div>
          </div>

          <Button onClick={checkPort} disabled={loading} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Checking...' : 'Check Port'}
          </Button>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
              <div className="font-medium flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900">Coming Soon</Badge>
                This tool requires a backend service
              </div>
              <p className="text-xs">
                <strong>Why?</strong> Browser security (CORS) prevents direct port checking. 
                The portchecker.io API doesn't allow browser requests. A backend proxy server is needed.
              </p>
            </div>
          </div>

          {result && (
            <Card className={result.open ? 'border-green-500' : 'border-red-500'}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {result.open ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Port {result.port}</p>
                    <p className={result.open ? 'text-green-600' : 'text-red-600'}>
                      {result.open ? 'Open' : 'Closed or Filtered'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="pt-4">
            <p className="text-sm font-medium mb-3">Common Ports:</p>
            <div className="grid grid-cols-2 gap-2">
              {commonPorts.map(({port, service}) => (
                <Button
                  key={port}
                  variant="outline"
                  size="sm"
                  onClick={() => setPort(port)}
                  className="justify-start"
                >
                  <span className="font-mono mr-2">{port}</span>
                  <span className="text-muted-foreground">{service}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">About Port Checker:</p>
            <p>Check if a specific port is open or closed on a remote server. Useful for network troubleshooting, server configuration verification, and security testing.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortChecker;
