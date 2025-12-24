import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/scroll-to-top";
import { lazy, Suspense } from "react";
import PageLoader from "@/components/PageLoader";
import RouteChangeLoader from "@/components/RouteChangeLoader";

// Lazy-load providers for better code splitting
const Providers = lazy(() => import("@/components/Providers"));

// Lazy-load Analytics (non-critical)
const Analytics = lazy(() => import("@vercel/analytics/react").then(m => ({ default: m.Analytics })));

// Lazy-load all pages including Index
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Providers>
      <BrowserRouter>
        <RouteChangeLoader />
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
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
    </Providers>
  </Suspense>
);

export default App;

