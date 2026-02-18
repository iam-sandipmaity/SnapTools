import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/header";
import Footer from "@/components/footer";

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
        <meta name="description" content="The page you're looking for doesn't exist. Return to SnapTools homepage to explore 100+ free online tools." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-accent/20 pt-16">
          <div className="container text-center py-20">
            <h1 className="text-6xl sm:text-8xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-foreground">Page Not Found</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Sorry, the page you're looking for doesn't exist or has been moved. 
              Let's get you back to exploring our free tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
              >
                Go to Homepage
              </a>
              <a 
                href="/tools" 
                className="inline-flex items-center justify-center px-6 py-3 border border-input bg-background hover:bg-accent rounded-lg font-medium transition-colors"
              >
                Browse Tools
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
