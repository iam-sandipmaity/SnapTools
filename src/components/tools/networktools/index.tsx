import { lazy } from 'react';

const networktools = {
  "ip-lookup": lazy(() => import('./IpLookup')),
  "dns-lookup": lazy(() => import('./DnsLookup')),
  "whois-lookup": lazy(() => import('./WhoisLookup')),
  "email-validator": lazy(() => import('./EmailValidator')),
  "port-checker": lazy(() => import('./PortChecker')),
  "mac-lookup": lazy(() => import('./MacLookup')),
  "ping-tool": lazy(() => import('./PingTool')),
};

export default networktools;
