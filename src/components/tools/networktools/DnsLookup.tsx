import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Server, Mail, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DnsLookup = () => {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[]>([]);

  const lookupDns = async () => {
    if (!domain.trim()) return;
    
    setLoading(true);
    try {
      // Using Google DNS over HTTPS API (free)
      const response = await fetch(
        `https://dns.google/resolve?name=${domain}&type=${recordType}`
      );
      const data = await response.json();
      
      if (data.Answer && data.Answer.length > 0) {
        setResult(data.Answer.map((record: any) => record.data));
      } else {
        setResult(['No records found']);
      }
    } catch (error) {
      console.error('Error looking up DNS:', error);
      setResult(['Error performing DNS lookup']);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            DNS Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <Input
              id="domain"
              type="text"
              placeholder="Enter domain (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookupDns()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordType">Record Type</Label>
            <Select value={recordType} onValueChange={setRecordType}>
              <SelectTrigger id="recordType">
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A - IPv4 Address</SelectItem>
                <SelectItem value="AAAA">AAAA - IPv6 Address</SelectItem>
                <SelectItem value="MX">MX - Mail Exchange</SelectItem>
                <SelectItem value="TXT">TXT - Text Records</SelectItem>
                <SelectItem value="CNAME">CNAME - Canonical Name</SelectItem>
                <SelectItem value="NS">NS - Name Server</SelectItem>
                <SelectItem value="SOA">SOA - Start of Authority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={lookupDns} disabled={loading} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Looking up...' : 'Lookup DNS'}
          </Button>

          {result.length > 0 && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {recordType} Records for {domain}
                </h3>
                <div className="space-y-2">
                  {result.map((record, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg font-mono text-sm">
                      {record}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="pt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">About DNS Lookup:</p>
            <p>Query DNS records for any domain including A, AAAA, MX, TXT, CNAME, NS, and SOA records. Essential for domain configuration verification and troubleshooting.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DnsLookup;
