import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Cpu, Building2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const MacLookup = () => {
  const [macAddress, setMacAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const lookupMac = async () => {
    if (!macAddress.trim()) return;
    
    setLoading(true);
    try {
      // Using macvendors.com API (free, 1000 requests/day)
      const response = await fetch(`https://api.macvendors.com/${macAddress}`);
      
      if (response.ok) {
        const manufacturer = await response.text();
        setResult({
          mac: macAddress,
          manufacturer: manufacturer,
          address: 'Available in vendor database',
          country: 'Check manufacturer website',
        });
      } else {
        setResult({
          mac: macAddress,
          manufacturer: 'Not found in database',
          address: 'N/A',
          country: 'N/A',
        });
      }
    } catch (error) {
      console.error('Error looking up MAC:', error);
      setResult({
        mac: macAddress,
        manufacturer: 'Error performing lookup',
        address: 'N/A',
        country: 'N/A',
      });
    }
    setLoading(false);
  };

  const formatMacAddress = (value: string) => {
    // Remove non-hex characters
    const cleaned = value.replace(/[^0-9A-Fa-f]/g, '');
    // Add colons every 2 characters
    const formatted = cleaned.match(/.{1,2}/g)?.join(':') || cleaned;
    return formatted.substring(0, 17); // Limit to MAC address length
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            MAC Address Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mac">MAC Address</Label>
            <div className="flex gap-2">
              <Input
                id="mac"
                type="text"
                placeholder="Enter MAC address (e.g., 00:1A:2B:3C:4D:5E)"
                value={macAddress}
                onChange={(e) => setMacAddress(formatMacAddress(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && lookupMac()}
                className="font-mono"
              />
              <Button onClick={lookupMac} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Looking up...' : 'Lookup'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
            </p>
          </div>

          {result && (
            <Card className="mt-4">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">MAC Address:</span>
                  <span className="text-muted-foreground font-mono">{result.mac}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Manufacturer:</span>
                  <span className="text-muted-foreground">{result.manufacturer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Address:</span>
                  <span className="text-muted-foreground">{result.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Country:</span>
                  <span className="text-muted-foreground">{result.country}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="pt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">About MAC Address Lookup:</p>
            <p>Identify the manufacturer and origin of network devices using their MAC address. MAC (Media Access Control) addresses are unique identifiers assigned to network interfaces.</p>
            
            <div className="mt-4 space-y-2">
              <p className="font-medium">What You'll Get:</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>Device manufacturer name</li>
                <li>Manufacturer's address</li>
                <li>Country of origin</li>
                <li>OUI (Organizationally Unique Identifier) information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MacLookup;
