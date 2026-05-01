import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Network, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const PortChecker = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ port: string; open: boolean; service?: string }>>([]);
  const [currentCheck, setCurrentCheck] = useState('');

  // Common ports with services
  const commonPorts = [
    { port: '21', service: 'FTP' },
    { port: '22', service: 'SSH' },
    { port: '23', service: 'Telnet' },
    { port: '25', service: 'SMTP' },
    { port: '53', service: 'DNS' },
    { port: '80', service: 'HTTP' },
    { port: '110', service: 'POP3' },
    { port: '143', service: 'IMAP' },
    { port: '443', service: 'HTTPS' },
    { port: '3306', service: 'MySQL' },
    { port: '5432', service: 'PostgreSQL' },
    { port: '6379', service: 'Redis' },
    { port: '8080', service: 'HTTP Proxy' },
    { port: '27017', service: 'MongoDB' },
  ];

  // Check port using a CORS-friendly approach
  const checkPort = async (hostToCheck: string, portToCheck: string) => {
    if (!hostToCheck.trim() || !portToCheck.trim()) {
      toast.error('Please enter both host and port');
      return;
    }

    setLoading(true);
    setCurrentCheck(`${hostToCheck}:${portToCheck}`);

    try {
      // Use a timeout-based approach to check if a port is reachable
      // This works for HTTP/HTTPS services
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const url = `https://${hostToCheck}:${portToCheck}`;
      
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        setResults(prev => [...prev, {
          port: portToCheck,
          open: true,
          service: commonPorts.find(p => p.port === portToCheck)?.service,
        }]);
        toast.success(`Port ${portToCheck} appears to be open`);
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // If we get an abort error, it means the port is filtered or closed
        const isOpen = error.name !== 'AbortError';
        
        setResults(prev => [...prev, {
          port: portToCheck,
          open: isOpen,
          service: commonPorts.find(p => p.port === portToCheck)?.service,
        }]);

        if (!isOpen) {
          toast.info(`Port ${portToCheck} appears to be closed or filtered`);
        }
      }
    } catch (error) {
      setResults(prev => [...prev, {
        port: portToCheck,
        open: false,
        service: commonPorts.find(p => p.port === portToCheck)?.service,
      }]);
    } finally {
      setLoading(false);
      setCurrentCheck('');
    }
  };

  const checkMultiplePorts = async (ports: string[]) => {
    for (const p of ports) {
      await checkPort(host, p);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Port Checker - Professional Grade
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
                type="text"
                placeholder="e.g., 80, 443, or 80,443,8080"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkPort(host, port)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                // Check if multiple ports (comma-separated)
                if (port.includes(',')) {
                  const ports = port.split(',').map(p => p.trim()).filter(p => p);
                  checkMultiplePorts(ports);
                } else {
                  checkPort(host, port);
                }
              }}
              disabled={loading || !host || !port}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking {currentCheck}...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Check Port{port.includes(',') ? 's' : ''}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>

          {/* Common Ports Quick Select */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Quick Select Common Ports:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {commonPorts.map(({ port: p, service }) => (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  onClick={() => setPort(p)}
                  className="justify-start"
                >
                  <span className="font-mono mr-2">{p}</span>
                  <span className="text-muted-foreground">{service}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.open
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                      : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.open ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-mono font-medium">
                          {host}:{result.port}
                        </p>
                        {result.service && (
                          <p className="text-sm text-muted-foreground">
                            {result.service}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={result.open ? 'default' : 'destructive'}>
                      {result.open ? 'Open' : 'Closed/Filtered'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Network className="h-4 w-4" />
              About Port Checking
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>How it works:</strong> This tool attempts to connect to the specified host and port.
                Note that due to browser security restrictions (CORS), results may not be 100% accurate for all services.
              </p>
              <p>
                <strong>Common ports:</strong> Ports 80 (HTTP) and 443 (HTTPS) are most likely to respond.
                Other ports may appear closed even if they're open due to firewall rules.
              </p>
              <p>
                <strong>Tip:</strong> You can check multiple ports at once by separating them with commas (e.g., "80,443,8080").
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortChecker;

