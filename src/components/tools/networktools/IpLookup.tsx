import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Building2, Globe2, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const IpLookup = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const lookupIp = async () => {
    if (!ipAddress.trim()) return;
    
    setLoading(true);
    try {
      // Using free ipapi.co API (1000 requests/day)
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      const data = await response.json();
      
      if (data.error) {
        setResult({
          ip: ipAddress,
          country: 'Not found',
          region: 'Not found',
          city: 'Not found',
          isp: 'Not found',
          latitude: 'Not found',
          longitude: 'Not found',
        });
      } else {
        setResult({
          ip: data.ip,
          country: data.country_name || 'Unknown',
          region: data.region || 'Unknown',
          city: data.city || 'Unknown',
          isp: data.org || 'Unknown',
          latitude: data.latitude || 'Unknown',
          longitude: data.longitude || 'Unknown',
        });
      }
    } catch (error) {
      console.error('Error looking up IP:', error);
      setResult({
        ip: ipAddress,
        country: 'Error',
        region: 'Error',
        city: 'Error',
        isp: 'Error',
        latitude: 'Error',
        longitude: 'Error',
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            IP Lookup & Geolocation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ip">IP Address</Label>
            <div className="flex gap-2">
              <Input
                id="ip"
                type="text"
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookupIp()}
              />
              <Button onClick={lookupIp} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Looking up...' : 'Lookup'}
              </Button>
            </div>
          </div>

          {result && (
            <div className="grid gap-4 pt-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">IP:</span>
                    <span className="text-muted-foreground">{result.ip}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span className="text-muted-foreground">{result.city}, {result.region}, {result.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">ISP:</span>
                    <span className="text-muted-foreground">{result.isp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Coordinates:</span>
                    <span className="text-muted-foreground">{result.latitude}, {result.longitude}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="pt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">About IP Lookup:</p>
            <p>Discover detailed information about any IP address including geolocation, ISP, organization, and network details. Perfect for network troubleshooting and security analysis.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IpLookup;
