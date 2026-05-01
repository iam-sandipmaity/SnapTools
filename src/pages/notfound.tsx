import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { AlertTriangle, Monitor, Search, ChevronLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Set proper HTTP status for server-side rendering
    // Guard against paths that look like a different origin (e.g. /api/og → http://api)
    if (typeof window !== 'undefined' && window.history) {
      try {
        const safePath = '/' + location.pathname.replace(/^\/+/, '');
        window.history.replaceState({}, '', safePath);
      } catch {
        // replaceState can throw a SecurityError in some edge cases — safe to ignore
      }
    }

    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | SnapTools</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to SnapTools homepage to explore 200+ free online tools." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
        <Header />

        <main className="flex-grow relative overflow-hidden flex items-center justify-center pt-32 pb-40">
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/[0.03] blur-[150px] -z-10" />

          <div className="container max-w-4xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 font-black text-[10px] uppercase tracking-widest mb-12 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Node Linkage Failure
            </div>

            <h1 className="text-[10rem] md:text-[15rem] font-serif font-black tracking-tighter leading-none mb-4 opacity-5 bg-gradient-to-b from-black to-transparent dark:from-white dark:to-transparent bg-clip-text">
              404
            </h1>

            <div className="relative -mt-20 md:-mt-32 mb-16">
              <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight mb-6">
                Registry <em className="italic font-light text-primary">Malformed</em>
              </h2>
              <p className="text-xl text-muted-foreground/80 max-w-xl mx-auto font-medium leading-relaxed">
                The requested resource locator does not point to an active module in our ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <a
                href="/tools"
                className="group p-8 rounded-[2.5rem] bg-white/50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 backdrop-blur-3xl hover:border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-between text-left shadow-xl"
              >
                <div>
                  <h3 className="font-bold text-lg mb-1">Return to Repository</h3>
                  <p className="text-xs text-muted-foreground">Browse all 200+ active modules</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Monitor size={18} />
                </div>
              </a>

              <button
                onClick={() => {
                  const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    ctrlKey: true,
                    metaKey: true,
                    bubbles: true
                  });
                  document.dispatchEvent(event);
                }}
                className="group p-8 rounded-[2.5rem] bg-white/50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 backdrop-blur-3xl hover:border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-between text-left shadow-xl"
              >
                <div>
                  <h3 className="font-bold text-lg mb-1">Instant Discovery</h3>
                  <p className="text-xs text-muted-foreground">Press <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded border">Cmd+K</kbd> to search</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Search size={18} />
                </div>
              </button>
            </div>

            <div className="mt-20">
              <a
                href="/"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft size={14} /> Initialize Home Node
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default NotFound;
