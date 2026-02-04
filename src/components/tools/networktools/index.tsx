import IpLookup from './IpLookup';
import DnsLookup from './DnsLookup';
import WhoisLookup from './WhoisLookup';
import EmailValidator from './EmailValidator';
import PortChecker from './PortChecker';
import MacLookup from './MacLookup';
import PingTool from './PingTool';

const networktools = {
  "ip-lookup": IpLookup,
  "dns-lookup": DnsLookup,
  "whois-lookup": WhoisLookup,
  "email-validator": EmailValidator,
  "port-checker": PortChecker,
  "mac-lookup": MacLookup,
  "ping-tool": PingTool,
};

export default networktools;
