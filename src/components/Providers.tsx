import { ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { MotionConfig } from "framer-motion";
import { HelmetProvider } from 'react-helmet-async';

// Create the query client
const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <MotionConfig reducedMotion="user">
                        <TooltipProvider>
                            <Toaster />
                            <Sonner />
                            {children}
                        </TooltipProvider>
                    </MotionConfig>
                </ThemeProvider>
            </QueryClientProvider>
        </HelmetProvider>
    );
}
