import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./ui/logo";
import { Button } from "./ui/button";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Explore Tools", href: "/tools" },
  { label: "Features", href: "/features" },
  // { label: "About", href: "/about" },
  { label: "Documentation", href: "/documentation" },
  // { label: "Pricing", href: "/pricing" },
  { label: "Donate", href: "/donate" },
  { label: "Blog", href: "/blog" },
  { label: "Code Runner (Runr)", href: "https://runr.vercel.app/" },
];

const Header = () => {
  const isMobile = useMediaQuery("(max-width: 950px)");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  // const isBlogPage = location.pathname.startsWith('/blog');

  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleBackdropClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        {!isMobile && (
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-base md:text-lg font-serif font-medium tracking-tight transition-colors hover:text-primary"
                onClick={(e) => {
                  if (item.href.startsWith('#')) {
                    e.preventDefault();
                    const element = document.querySelector(item.href);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {!isMobile && (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="default"
              onClick={() => window.location.href = '/tools'}
              className="gradient-primary text-white hover:opacity-90 transition-opacity font-serif font-semibold"
            >
              Get Started
            </Button>
          </div>
        )}

        {isMobile && (
          <div className="flex items-center gap-2">
            {!mobileMenuOpen && <ThemeToggle />}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className={`relative z-50 transition-all duration-300 ${mobileMenuOpen ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
                }`}
            >
              <Menu size={24} className="text-foreground" />
            </Button>
          </div>
        )}

      </div>

      {/* Mobile Menu Overlay — Outside container to avoid overflow constraints */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-[100] w-screen h-screen bg-white dark:bg-black transition-all duration-500 ease-&lsqb;cubic-bezier(0.4,0,0.2,1)&rsqb; ${mobileMenuOpen
              ? "opacity-100 pointer-events-auto visible"
              : "opacity-0 pointer-events-none invisible"
            }`}
        >
          {/* Header Mirror inside Menu */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-black/5 dark:border-white/5 bg-white dark:bg-black">
            <Logo />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          {/* Nav Content */}
          <nav className="flex flex-col h-[calc(100vh-4rem)] px-8 pt-12 pb-8 overflow-y-auto bg-white dark:bg-black">
            <div className="flex flex-col gap-1">
              {navItems.map((item, index) => (
                <Link
                  key={item.label}
                  to={item.href}
                  style={{
                    transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                    transform: mobileMenuOpen ? "translateY(0)" : "translateY(20px)",
                    opacity: mobileMenuOpen ? 1 : 0
                  }}
                  className="group py-5 text-3xl font-serif font-bold text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all duration-300 flex items-center justify-between"
                  onClick={(e) => {
                    if (item.href.startsWith("#")) {
                      e.preventDefault();
                      const element = document.querySelector(item.href);
                      element?.scrollIntoView({ behavior: "smooth" });
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 w-6 h-6 text-primary" />
                </Link>
              ))}
            </div>

            {/* Bottom CTA */}
            <div
              className="mt-auto pt-8 border-t border-black/5 dark:border-white/5"
              style={{
                transitionDelay: "400ms",
                transform: mobileMenuOpen ? "translateY(0)" : "translateY(20px)",
                opacity: mobileMenuOpen ? 1 : 0,
                transition: "all 0.5s ease"
              }}
            >
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = "/tools";
                }}
                className="w-full py-7 text-lg gradient-primary text-white rounded-2xl font-bold shadow-[0_20px_40px_rgba(25,118,210,0.2)]"
              >
                Get Started for Free
              </Button>
              <p className="text-center text-black/20 dark:text-white/20 text-xs mt-6 tracking-widest uppercase font-bold">
                © {new Date().getFullYear()} SNAPTOOLS
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;