import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Globe, Calendar, User, Building2, Mail, Phone, Server, Shield, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const WhoisLookup = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const lookupWhois = async () => {
    if (!domain.trim()) return;
    
    setLoading(true);
    try {
      // Extract TLD to determine RDAP server
      const tld = domain.split('.').pop()?.toLowerCase();
      
      // Use rdap.org as universal RDAP client (works for all TLDs)
      const response = await fetch(`https://rdap.org/domain/${domain}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('=== WHOIS/RDAP Lookup Response ===');
      console.log('Domain:', domain);
      console.log('TLD:', tld);
      console.log('Full Response:', data);
      console.log('Response Keys:', Object.keys(data));
      console.log('============================');
      
      if (data.errorCode || !data.ldhName) {
        console.warn('WHOIS Error:', data);
        setResult({
          error: true,
          message: data.title || data.errorCode || 'Domain not found or invalid'
        });
      } else {
        // Transform RDAP response to our format
        const transformedData = {
          domainName: data.ldhName || domain,
          registryDomainId: data.handle,
          status: data.status?.join(', ') || 'Unknown',
          nameServer: data.nameservers?.map((ns: any) => ns.ldhName) || [],
          creationDate: data.events?.find((e: any) => e.eventAction === 'registration')?.eventDate,
          updatedDate: data.events?.find((e: any) => e.eventAction === 'last changed')?.eventDate,
          expirationDate: data.events?.find((e: any) => e.eventAction === 'expiration')?.eventDate,
          registrar: data.entities?.find((e: any) => e.roles?.includes('registrar'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3],
          registrant: data.entities?.find((e: any) => e.roles?.includes('registrant'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3],
          dnssec: data.secureDNS?.delegationSigned ? 'signed' : 'unsigned',
          // Additional contact info
          registrarUrl: data.entities?.find((e: any) => e.roles?.includes('registrar'))?.links?.[0]?.href,
          // Extract email from vcard if available
          registrantContactEmail: data.entities?.find((e: any) => e.roles?.includes('registrant'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'email')?.[3],
          adminContactEmail: data.entities?.find((e: any) => e.roles?.includes('administrative'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'email')?.[3],
          techContactEmail: data.entities?.find((e: any) => e.roles?.includes('technical'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'email')?.[3],
          adminContact: data.entities?.find((e: any) => e.roles?.includes('administrative'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3],
          techContact: data.entities?.find((e: any) => e.roles?.includes('technical'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3],
          rawData: data, // Keep raw data for debugging
        };
        
        console.log('Transformed WHOIS data:', transformedData);
        setResult(transformedData);
      }
    } catch (error) {
      console.error('Error looking up WHOIS:', error);
      setResult({
        error: true,
        message: error instanceof Error ? error.message : 'Error performing lookup - Please check the domain name'
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            WHOIS Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <div className="flex gap-2">
              <Input
                id="domain"
                type="text"
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookupWhois()}
              />
              <Button onClick={lookupWhois} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Looking up...' : 'Lookup'}
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              {result.error ? (
                <Card className="border-red-500">
                  <CardContent className="pt-6">
                    <p className="text-red-600">{result.message}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.domainName && (
                        <div className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">Domain:</span>
                            <p className="text-muted-foreground">{result.domainName}</p>
                          </div>
                        </div>
                      )}
                      {result.IP && (
                        <div className="flex items-start gap-2">
                          <Server className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">IP Address:</span>
                            <p className="text-muted-foreground">{result.IP}</p>
                          </div>
                        </div>
                      )}
                      {result.registryDomainId && (
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">Registry Domain ID:</span>
                            <p className="text-muted-foreground text-sm break-all">{result.registryDomainId}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Registrar Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Registrar Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.registrar && (
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">Registrar:</span>
                            <p className="text-muted-foreground">{result.registrar}</p>
                          </div>
                        </div>
                      )}
                      {result.registrarUrl && (
                        <div className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">URL:</span>
                            <a href={result.registrarUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {result.registrarUrl}
                            </a>
                          </div>
                        </div>
                      )}
                      {result.registrarWhoisServer && (
                        <div className="flex items-start gap-2">
                          <Server className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">WHOIS Server:</span>
                            <p className="text-muted-foreground">{result.registrarWhoisServer}</p>
                          </div>
                        </div>
                      )}
                      {result.registrarIanaId && (
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">IANA ID:</span>
                            <p className="text-muted-foreground">{result.registrarIanaId}</p>
                          </div>
                        </div>
                      )}
                      {result.registrarAbuseContactEmail && (
                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">Abuse Email:</span>
                            <p className="text-muted-foreground">{result.registrarAbuseContactEmail}</p>
                          </div>
                        </div>
                      )}
                      {result.registrarAbuseContactPhone && (
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">Abuse Phone:</span>
                            <p className="text-muted-foreground">{result.registrarAbuseContactPhone}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Domain Dates */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Important Dates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.creationDate && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">Creation Date:</span>
                            <p className="text-muted-foreground">{new Date(result.creationDate).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      {result.updatedDate && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">Last Updated:</span>
                            <p className="text-muted-foreground">{new Date(result.updatedDate).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      {result.expirationDate && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">Expiration Date:</span>
                            <p className="text-muted-foreground">{new Date(result.expirationDate).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.registrant && (
                        <div>
                          <p className="font-medium mb-2">Registrant</p>
                          <div className="pl-4 space-y-2">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-muted-foreground">{result.registrant}</p>
                            </div>
                            {result.registrantContactEmail && (
                              <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-muted-foreground">{result.registrantContactEmail}</p>
                              </div>
                            )}
                            {result.registrantContactPhone && (
                              <div className="flex items-start gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-muted-foreground">{result.registrantContactPhone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {result.adminContact && (
                        <div>
                          <p className="font-medium mb-2">Admin Contact</p>
                          <div className="pl-4 space-y-2">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-muted-foreground">{result.adminContact}</p>
                            </div>
                            {result.adminContactEmail && (
                              <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-muted-foreground">{result.adminContactEmail}</p>
                              </div>
                            )}
                            {result.adminContactPhone && (
                              <div className="flex items-start gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-muted-foreground">{result.adminContactPhone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {result.techContact && (
                        <div>
                          <p className="font-medium mb-2">Technical Contact</p>
                          <div className="pl-4 space-y-2">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-muted-foreground">{result.techContact}</p>
                            </div>
                            {result.techContactEmail && (
                              <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-muted-foreground">{result.techContactEmail}</p>
                              </div>
                            )}
                            {result.techContactPhone && (
                              <div className="flex items-start gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-muted-foreground">{result.techContactPhone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Name Servers */}
                  {result.nameServer && result.nameServer.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Name Servers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {result.nameServer.map((ns: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <Server className="h-4 w-4 text-muted-foreground" />
                              <p className="text-muted-foreground font-mono text-sm">{ns}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Domain Status */}
                  {result.status && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Domain Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {result.status.split(' ').map((status: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-muted-foreground text-sm break-all">{status}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* DNSSEC */}
                  {result.dnssec && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">DNSSEC</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <p className="text-muted-foreground">{result.dnssec}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">About WHOIS Lookup:</p>
            <p>WHOIS lookup provides domain registration information including registrar, registrant contact details, creation date, expiration date, and name servers. Essential for domain research and verification.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhoisLookup;
