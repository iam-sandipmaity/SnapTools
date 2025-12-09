
import Logo from "./ui/logo";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { quickLinks } from "@/data/navigation";
import QuickLinks from "./ui/quick-links";
import ScrollToTop from "./ui/scroll-to-top";

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "https://x.com/iam_sandipmaity", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/iam_sandipmaity", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/in/iam_sandipmaity", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/iam-sandipmaity/", label: "GitHub"},
];

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div className="space-y-6">
            <Logo className="transform hover:scale-105 transition-transform duration-300" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              All-in-one tool suite for creators, developers, students, and productivity enthusiasts.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a 
                  key={social.label} 
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 w-12 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transform hover:scale-110 transition-all duration-300"
                >
                  <social.icon size={22} />
                </a>
              ))}
            </div>
          </div>
          
          <QuickLinks 
            title="Quick Links" 
            links={quickLinks} 
            className="md:pl-8"
          />
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Newsletter</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Subscribe to get the latest updates and news.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              />
              <button className="h-12 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transform hover:scale-105 transition-all duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t text-center text-muted-foreground space-y-2">
          <p className="text-base">© 2025 - {new Date().getFullYear()} SnapTools. All rights reserved.</p>
          <p className="text-sm">
            Created by{" "}
            <a 
              href="https://sandipmaity.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Sandip Maity
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterWithScrollToTop = () => {
  return (
    <>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default FooterWithScrollToTop;
