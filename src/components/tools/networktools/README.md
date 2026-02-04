# Network Tools Documentation

Complete documentation for all network tools including API details, limitations, and debugging information.

---

## 📋 Table of Contents

1. [IP Lookup & Geolocation](#1-ip-lookup--geolocation)
2. [DNS Lookup](#2-dns-lookup)
3. [WHOIS Lookup](#3-whois-lookup)
4. [Email Validator](#4-email-validator)
5. [Port Checker](#5-port-checker)
6. [MAC Address Lookup](#6-mac-address-lookup)
7. [Ping Tool](#7-ping-tool)
8. [Troubleshooting](#troubleshooting)
9. [Future Improvements](#future-improvements)

---

## 1. IP Lookup & Geolocation

### Component
`IpLookup.tsx`

### API Used
**ipapi.co** - IP Geolocation API

### API Details
- **Endpoint**: `https://ipapi.co/{ip}/json/`
- **Method**: GET
- **Authentication**: None required
- **Cost**: Free tier available

### Rate Limits
- **Free Tier**: 1,000 requests per day
- **Rate Limit**: 30,000 requests per month
- **No API key required** for basic usage

### Request Example
```javascript
const response = await fetch(`https://ipapi.co/8.8.8.8/json/`);
const data = await response.json();
```

### Response Fields
```json
{
  "ip": "8.8.8.8",
  "city": "Mountain View",
  "region": "California",
  "country": "US",
  "country_name": "United States",
  "latitude": 37.4056,
  "longitude": -122.0775,
  "org": "AS15169 Google LLC",
  "postal": "94043",
  "timezone": "America/Los_Angeles"
}
```

### Implementation Details
- Client-side only implementation
- No backend required
- Handles invalid IPs gracefully
- Shows user-friendly error messages

### Error Handling
- Empty IP address → Shows validation message
- Invalid IP → API returns error object
- Network errors → Caught and displayed
- Rate limit exceeded → Error message shown

### Debugging
Enable console logs by checking the network tab in browser DevTools:
```javascript
console.log('IP Lookup Response:', data);
```

---

## 2. DNS Lookup

### Component
`DnsLookup.tsx`

### API Used
**Google DNS over HTTPS** (DoH)

### API Details
- **Endpoint**: `https://dns.google/resolve`
- **Method**: GET
- **Authentication**: None required
- **Cost**: Completely free

### Rate Limits
- **No documented rate limits**
- Used by millions of devices globally
- Highly reliable and fast

### Request Example
```javascript
const response = await fetch(
  `https://dns.google/resolve?name=example.com&type=A`
);
const data = await response.json();
```

### Supported Record Types
- `A` - IPv4 Address
- `AAAA` - IPv6 Address  
- `MX` - Mail Exchange
- `TXT` - Text Records
- `CNAME` - Canonical Name
- `NS` - Name Server
- `SOA` - Start of Authority

### Response Example
```json
{
  "Status": 0,
  "TC": false,
  "RD": true,
  "RA": true,
  "AD": false,
  "CD": false,
  "Question": [
    { "name": "example.com.", "type": 1 }
  ],
  "Answer": [
    {
      "name": "example.com.",
      "type": 1,
      "TTL": 86400,
      "data": "93.184.216.34"
    }
  ]
}
```

### Implementation Details
- Extracts `data` field from Answer array
- Handles multiple records
- Shows "No records found" for empty responses
- Displays record type in header

### Error Handling
- Invalid domain → Shows "No records found"
- Network errors → Displays error message
- No results → User-friendly message

---

## 3. WHOIS Lookup

### Component
`WhoisLookup.tsx`

### API Used
**RDAP.org** - Universal RDAP Client

### API Details
- **Endpoint**: `https://rdap.org/domain/{domain}`
- **Method**: GET
- **Authentication**: None required
- **Protocol**: RDAP (Registration Data Access Protocol)
- **Cost**: Completely free

### What is RDAP?
RDAP is the modern successor to WHOIS protocol, standardized by ICANN. It provides structured JSON responses instead of plain text.

### Rate Limits
- **No strict rate limits**
- Public service operated by RDAP Bootstrap Service
- Automatically routes to correct RDAP server based on TLD

### Supported TLDs
- ✅ `.com`, `.net`, `.org`
- ✅ `.xyz`, `.io`, `.app`, `.dev`
- ✅ Country codes: `.uk`, `.de`, `.fr`, `.au`, etc.
- ✅ New gTLDs: Most modern TLDs
- ❌ Some legacy TLDs may not support RDAP

### Request Example
```javascript
const response = await fetch(`https://rdap.org/domain/google.com`);
const data = await response.json();
```

### Response Structure (RDAP Format)
```json
{
  "ldhName": "google.com",
  "handle": "2138514_DOMAIN_COM-VRSN",
  "status": ["client delete prohibited", "client transfer prohibited"],
  "events": [
    {
      "eventAction": "registration",
      "eventDate": "1997-09-15T04:00:00Z"
    },
    {
      "eventAction": "expiration",
      "eventDate": "2028-09-14T04:00:00Z"
    }
  ],
  "nameservers": [
    { "ldhName": "ns1.google.com" },
    { "ldhName": "ns2.google.com" }
  ],
  "entities": [
    {
      "roles": ["registrar"],
      "vcardArray": [
        "vcard",
        [
          ["version", {}, "text", "4.0"],
          ["fn", {}, "text", "MarkMonitor Inc."]
        ]
      ]
    }
  ]
}
```

### Data Transformation
The component transforms RDAP format to user-friendly format:

```javascript
{
  domainName: data.ldhName,
  registryDomainId: data.handle,
  status: data.status.join(', '),
  nameServer: data.nameservers.map(ns => ns.ldhName),
  creationDate: events.find(e => e.eventAction === 'registration').eventDate,
  expirationDate: events.find(e => e.eventAction === 'expiration').eventDate,
  registrar: entities.find(e => e.roles.includes('registrar')).vcardArray,
  // ... more fields
}
```

### Displayed Information
- ✅ Domain Name
- ✅ IP Address (if available)
- ✅ Registry Domain ID
- ✅ Registrar Information (Name, URL, WHOIS Server, IANA ID)
- ✅ Abuse Contact (Email, Phone)
- ✅ Important Dates (Creation, Updated, Expiration)
- ✅ Contact Information (Registrant, Admin, Technical)
- ✅ Name Servers
- ✅ Domain Status
- ✅ DNSSEC Status

### Implementation Details
- Extracts TLD for debugging
- Comprehensive error handling
- Detailed console logging for debugging
- Transforms vCard format to readable text
- Handles missing fields gracefully

### Error Handling
- Domain not found → Shows error card
- Invalid domain → User-friendly message
- Network errors → Detailed error message
- 404 responses → Proper error handling
- JSON parse errors → Caught and displayed

### Debugging
Check console output:
```javascript
console.log('=== WHOIS/RDAP Lookup Response ===');
console.log('Domain:', domain);
console.log('TLD:', tld);
console.log('Full Response:', data);
console.log('Transformed WHOIS data:', transformedData);
```

### Known Limitations
- Some domains may have privacy protection (limited contact info)
- Historical data not available
- Rate limiting may apply from RDAP servers (rare)
- Some TLDs may not fully support RDAP yet

---

## 4. Email Validator

### Component
`EmailValidator.tsx`

### Implementation
**Client-side regex validation**

### No External API
This tool works entirely in the browser using JavaScript regex patterns.

### Validation Pattern
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### Current Features
- ✅ Basic email format validation
- ✅ Checks for @ symbol
- ✅ Checks for domain
- ✅ Checks for TLD
- ✅ Instant validation (no API calls)

### Planned Features (Coming Soon)
- ⏳ Mailbox existence verification (requires backend)
- ⏳ Disposable email detection
- ⏳ Role-based email detection
- ⏳ MX record validation
- ⏳ Bulk email validation

### Rate Limits
**N/A** - Runs locally in browser

### Error Handling
- Empty email → Validation message
- Invalid format → "Invalid email format"
- Valid format → "Email format is valid!"

---

## 5. Port Checker

### Component
`PortChecker.tsx`

### Status
**⚠️ Coming Soon - CORS Limitation**

### API Exists But Cannot Be Used
**portchecker.io** - Open-source Port Checking API exists but has CORS restrictions

### The Problem: CORS
The portchecker.io API does not include CORS headers (`Access-Control-Allow-Origin`), which means:
- ❌ Cannot be called directly from browser JavaScript
- ❌ Fetch requests are blocked by browser security
- ❌ No way to bypass this client-side

### Error Message
```
Access to fetch at 'https://portchecker.io/api/google.com/443' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Why Browser Blocks This
Modern browsers implement CORS (Cross-Origin Resource Sharing) as a security feature:
1. JavaScript on `yoursite.com` tries to fetch from `portchecker.io`
2. Browser sends preflight OPTIONS request
3. `portchecker.io` doesn't respond with CORS headers
4. Browser blocks the request to protect users

This is different from CORS-enabled APIs like ipapi.co or dns.google which explicitly allow browser requests.

### Current Implementation
Shows "Coming Soon" notice with explanation about CORS limitation

### Common Ports Reference
Pre-populated list of common ports:
- `21` - FTP
- `22` - SSH
- `80` - HTTP
- `443` - HTTPS
- `3306` - MySQL
- `5432` - PostgreSQL
- `27017` - MongoDB
- `8080` - HTTP Proxy

### Solution: Backend Proxy Required

To make this work, you need a backend server that:
1. Receives requests from your frontend
2. Calls portchecker.io API (server-to-server, no CORS)
3. Returns results to frontend

#### Option 1: Node.js Backend with portchecker.io

```javascript
// backend/port-checker.js
import { request } from 'undici';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors()); // Enable CORS for your frontend

app.get('/api/check-port/:host/:port', async (req, res) => {
  try {
    const { host, port } = req.params;
    const { body } = await request(`https://portchecker.io/api/${host}/${port}`);
    const result = await body.text();
    res.send(result); // "True" or "False"
  } catch (error) {
    res.status(500).json({ error: 'Failed to check port' });
  }
});

app.listen(3001);
```

Then in your frontend:
```javascript
const response = await fetch(`http://localhost:3001/api/check-port/${host}/${port}`);
const data = await response.text();
```

#### Option 2: Direct Socket Connection (Node.js)

Build your own port checker:
```javascript
// backend/port-checker.js
import net from 'net';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

function checkPort(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve({ open: true });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ open: false });
    });
    
    socket.on('error', () => {
      resolve({ open: false });
    });
    
    socket.connect(port, host);
  });
}

app.get('/api/check-port/:host/:port', async (req, res) => {
  const { host, port } = req.params;
  const result = await checkPort(host, parseInt(port));
  res.json(result);
});

app.listen(3001);
```

#### Option 3: Serverless Function (Vercel/Netlify)

```javascript
// api/check-port.js (Vercel)
import { request } from 'undici';

export default async function handler(req, res) {
  const { host, port } = req.query;
  
  try {
    const { body } = await request(`https://portchecker.io/api/${host}/${port}`);
    const result = await body.text();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check port' });
  }
}
```

### portchecker.io API Details

**For Backend Use Only** (works from server-side code):

- **Endpoint**: `https://portchecker.io/api/{host}/{port}`
- **Method**: GET
- **Authentication**: None required
- **Cost**: Completely free
- **Open Source**: https://github.com/Gmanicus/portchecker.io

**Response Format**:
- Plain text: `"True"` or `"False"`

**Example with undici** (Node.js):
```javascript
import { request } from 'undici';

const { statusCode, body } = await request('https://portchecker.io/api/google.com/443');
const result = await body.text();
console.log(result); // "True"
```

---

## 6. MAC Address Lookup

### Component
`MacLookup.tsx`

### API Used
**macvendors.com** - MAC Address Vendor Lookup API

### API Details
- **Endpoint**: `https://api.macvendors.com/{macAddress}`
- **Method**: GET
- **Authentication**: None required
- **Cost**: Free tier available

### Rate Limits
- **Free Tier**: 1,000 requests per day
- **Rate Limit**: If exceeded, returns 429 status
- **Throttling**: 1 request per second recommended

### Request Example
```javascript
const response = await fetch('https://api.macvendors.com/00:1A:2B:3C:4D:5E');
const manufacturer = await response.text();
```

### Response Format
Plain text response (not JSON):
```
Apple, Inc.
```

Or for not found:
```
{"errors":{"detail":"Not Found"}}
```

### MAC Address Format
Accepts multiple formats:
- `XX:XX:XX:XX:XX:XX` (colon-separated)
- `XX-XX-XX-XX-XX-XX` (dash-separated)
- `XXXXXXXXXXXX` (no separators)

The component auto-formats to colon-separated.

### Implementation Details
- Auto-formats MAC address input
- Limits input to 17 characters (formatted)
- Response is text, not JSON
- Handles 404 gracefully

### Error Handling
- Empty MAC → No action
- Invalid MAC → API returns "Not Found"
- Network errors → Error message
- Rate limit → "Not found" displayed

---

## 7. Ping Tool

### Component
`PingTool.tsx`

### Implementation
**HTTP Request Timing** (Browser workaround)

### Browser Limitation
True ICMP ping is not possible in browsers. This tool uses HTTP request timing as an alternative.

### How It Works
```javascript
const startTime = performance.now();
await fetch(`https://${host}`, { 
  mode: 'no-cors',
  cache: 'no-cache'
});
const endTime = performance.now();
const latency = Math.round(endTime - startTime);
```

### Features
- ✅ Measures HTTP response time
- ✅ 4 sequential requests
- ✅ Calculates average latency
- ✅ Real-time results display
- ✅ Visual latency indicators

### Limitations
- ⚠️ Measures HTTP/HTTPS latency, not true ICMP ping
- ⚠️ Requires HTTPS enabled on target
- ⚠️ CORS may affect some domains
- ⚠️ Results may vary from system ping

### Interpretation
- `< 50ms` - Excellent (Green indicator)
- `50-100ms` - Good
- `> 100ms` - Fair (Yellow indicator)

### Rate Limits
**N/A** - Browser-based timing

### Error Handling
- Invalid host → Timeout status
- Network errors → Shows in results
- CORS errors → Handled gracefully

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: API requests blocked by CORS
**Solution**: These APIs have CORS enabled. If issues occur:
- Check browser console for specific error
- Verify API endpoint is accessible
- Consider backend proxy if needed

#### 2. Rate Limit Exceeded
**Problem**: Too many requests
**Solution**:
- IP Lookup: Wait 24 hours (1,000/day limit)
- MAC Lookup: Wait 24 hours (1,000/day limit)
- DNS/RDAP: Generally no limits

#### 3. No Data Returned
**Problem**: Empty response from API
**Solutions**:
- Verify input format (domain, IP, MAC)
- Check console logs for API response
- Try a known-good example (google.com)

#### 4. Network Timeout
**Problem**: Request takes too long
**Solution**:
- Check internet connection
- Try different domain/IP
- API may be temporarily down

### Debugging Steps

1. **Open Browser DevTools** (F12)

2. **Check Console Tab**
   - All tools have detailed console logging
   - Look for API responses
   - Check for error messages

3. **Check Network Tab**
   - View actual API requests
   - Check response status codes
   - Inspect response payload

4. **Test with Known Values**
   - IP Lookup: `8.8.8.8` (Google DNS)
   - DNS Lookup: `google.com`
   - WHOIS: `github.com`
   - MAC: `00:00:5E:00:53:00`
   - Port Checker: `google.com:443` (HTTPS, should be open)

5. **Check API Status**
   - ipapi.co: https://ipapi.co
   - Google DNS: https://developers.google.com/speed/public-dns
   - RDAP: https://about.rdap.org
   - macvendors.com: https://macvendors.com
   - portchecker.io: https://portchecker.io

---

## Future Improvements

### Short Term
1. **Add IP Address Auto-detection**
   - Show user's current IP on page load
   - One-click lookup for current IP

2. **Bulk Operations**
   - Bulk DNS lookup
   - Bulk IP lookup
   - Batch MAC address lookup

3. **Export Features**
   - Download results as JSON
   - Copy formatted results
   - Save lookup history

4. **Enhanced Error Messages**
   - More specific error types
   - Retry mechanisms
   - Offline detection

### Long Term
1. **Backend Integration**
   - Port scanner service
   - Advanced WHOIS with historical data
   - Email verification with SMTP check

2. **Advanced Features**
   - Reverse DNS lookup
   - IP reputation check
   - SSL certificate lookup
   - Traceroute visualization

3. **Performance**
   - Cache frequent lookups
   - Request debouncing
   - Progressive loading

4. **Analytics**
   - Lookup statistics
   - Popular queries
   - Usage graphs

---

## API Alternatives

If current APIs fail or have issues:

### IP Geolocation
- **ip-api.com** - Free, 45 requests/minute
- **ipinfo.io** - 50,000 requests/month free
- **geoiplookup.io** - Free tier available

### DNS Lookup
- **Cloudflare DNS**: `https://1.1.1.1/dns-query`
- **Quad9 DNS**: `https://dns.quad9.net:5053/dns-query`

### WHOIS
- **WHOIS XML API** - Paid service
- **WhoisFreaks** - Free tier available
- Direct WHOIS servers (requires backend)

### MAC Lookup
- **macaddress.io** - 1,000 requests/day free
- **maclookup.app** - Free tier available

---

## Contact & Support

For issues or improvements:
1. Check console logs first
2. Verify API is accessible
3. Test with example values
4. Check this documentation

**Last Updated**: February 4, 2026
**Version**: 1.0.0
