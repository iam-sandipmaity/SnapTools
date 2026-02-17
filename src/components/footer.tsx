import Logo from "./ui/logo";
import {
  Twitter,
  Instagram,
  Github,
  Linkedin,
  Facebook,
  Rss,
  ArrowUpRight,
  Mail,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import ScrollToTop from "./ui/scroll-to-top";

const socialLinks = [
  { icon: Twitter, href: "https://x.com/iam_sandipmaity", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/iam_sandipmaity", label: "Instagram" },
  { icon: Github, href: "https://github.com/iam-sandipmaity/", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/iam_sandipmaity", label: "LinkedIn" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Rss, href: "/rss.xml", label: "RSS" },
];

const exploreLinks = [
  { label: "All Tools", to: "/tools" },
  { label: "Insights", to: "/blog" },
  { label: "Our Story", to: "/about" },
  { label: "Get Help", to: "/contact" },
  { label: "Pricing", to: "/pricing" },
  { label: "Changelog", to: "/changelog" },
];

const Footer = () => (
  <footer
    role="contentinfo"
    className="relative overflow-hidden bg-white dark:bg-[#05070a] text-[#111] dark:text-white transition-colors duration-300 pt-20"
  >
    {/* ── Container ── */}
    <div className="max-w-7xl mx-auto px-6 lg:px-8">

      {/* ── TOP SECTION: Branding/CTA + Links ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 pb-16">

        {/* LEFT: CTA (2/5 columns on large) */}
        <div className="lg:col-span-2 max-w-xl">
          <h2 className="font-serif font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight mb-8">
            Unlock Your<br />
            <em className="italic underline decoration-1 underline-offset-[12px] decoration-black/10 dark:decoration-white/20">
              Digital Evolution
            </em>
          </h2>

          <p className="text-lg text-black/60 dark:text-white/50 font-light leading-relaxed mb-10 max-w-md">
            The ultimate toolkit for creators. Join thousands of makers simplifying their workflow with SnapTools.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full px-6 py-4 outline-none focus:border-black/30 dark:focus:border-white/30 transition-all"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all"
            >
              Subscribe
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* RIGHT: Link Columns (3/5 columns on large) */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-10">
          {/* CONTACT */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/40 dark:text-white/30">Contact</h3>
            <div className="flex flex-col gap-4">
              <a href="mailto:hello@snaptools.com" className="group flex items-center gap-3 text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">
                <span className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center group-hover:border-black/30 dark:group-hover:border-white/30 transition-all">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                example@email.com
              </a>
              <a href="tel:+15551234567" className="group flex items-center gap-3 text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">
                <span className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center group-hover:border-black/30 dark:group-hover:border-white/30 transition-all">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                +91 9999999999
              </a>
            </div>
          </div>

          {/* EXPLORE */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/40 dark:text-white/30">Explore</h3>
            <ul className="flex flex-col gap-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white hover:pl-1 transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONNECT */}
          <div className="flex flex-col gap-6 col-span-2 md:col-span-1">
            <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/40 dark:text-white/30">Connect</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-black/40 dark:text-white/30 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-transparent transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── GIANT WATERMARK STRIPE (Outside container for full bleed) ── */}
    <div className="relative flex justify-center items-center py-4 pointer-events-none select-none">
      <span
        className="font-serif font-black text-[22vw] sm:text-[18vw] leading-none tracking-tighter text-black/[0.5] dark:text-neutral-400/[0.5] whitespace-nowrap px-4 text-center"
      >
        SnapTools
      </span>
    </div>

    {/* ── Bottom container ── */}
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-black/5 dark:border-white/5 py-12 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <Logo className="h-6 opacity-25 dark:opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer" />
          <div className="flex flex-col gap-1.5 text-center md:text-left">
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-black/30 dark:text-white/20">
              ©2025 - {new Date().getFullYear()} SNAPTOOLS. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[10px] font-medium text-black/40 dark:text-white/30 tracking-tight">
              Designed & Crafted by{" "}
              <a
                href="https://sandipmaity.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white underline decoration-black/10 dark:decoration-white/10 underline-offset-4 transition-all"
              >
                Sandip Maity
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 md:gap-10">
          {[
            { label: "Privacy", to: "/privacy" },
            { label: "Terms", to: "/terms" },
            { label: "Support", to: "/contact" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-[10px] font-bold tracking-[0.25em] uppercase text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

const FooterWithScrollToTop = () => (
  <>
    <Footer />
    <ScrollToTop />
  </>
);

export default FooterWithScrollToTop;