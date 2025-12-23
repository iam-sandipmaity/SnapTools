import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/scroll-to-top";
import { ThemeProvider } from "@/components/theme-provider";
import { MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/react"
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from "react";

// Critical pages loaded immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages
const ToolPage = lazy(() => import("./pages/ToolPage"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const ToolList = lazy(() => import("./pages/ToolList"));
const ToolCategoryPage = lazy(() => import("./pages/ToolCategoryPage"));
const About = lazy(() => import("./pages/AboutPage"));
const Documentation = lazy(() => import("./pages/DocumentationPage"));
const Pricing = lazy(() => import("./pages/pricing"));
const Features = lazy(() => import("./pages/features"));
const Donate = lazy(() => import("./pages/Donate"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const BlogRouter = lazy(() => import("./blog/router"));
const ShareFileView = lazy(() => import("./components/tools/file-sharing/ShareFileView"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Create the query client
const queryClient = new QueryClient();

const App = () => (
  <>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MotionConfig reducedMotion="user">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/tools" element={<ToolList />} />
                    <Route path="/tools/:categoryId" element={<ToolCategoryPage />} />
                    <Route path="/tools/:categoryId/:toolId" element={<ToolPage />} />
                    <Route path="/tools/:toolId" element={<ToolPage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/Privacy" element={<Privacy />} />
                    <Route path="/Terms" element={<Terms />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/donate" element={<Donate />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/share/:peerId" element={<ShareFileView />} />
                    <Route path="/blog/*" element={<BlogRouter />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </MotionConfig>
        </ThemeProvider>
      </QueryClientProvider>
      <Analytics />
    </HelmetProvider>
  </>
);

export default App;
