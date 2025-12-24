import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const RouteChangeLoader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showFullLoader, setShowFullLoader] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Show loader when route changes
        setIsLoading(true);

        // Show full page loader if loading takes longer than 500ms
        const fullLoaderTimer = setTimeout(() => {
            if (isLoading) {
                setShowFullLoader(true);
            }
        }, 500);

        // Hide loader after a short delay to ensure smooth transition
        const timer = setTimeout(() => {
            setIsLoading(false);
            setShowFullLoader(false);
        }, 300);

        return () => {
            clearTimeout(timer);
            clearTimeout(fullLoaderTimer);
        };
    }, [location.pathname]);

    return (
        <>
            {/* Top progress bar - always shows during navigation */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary shadow-lg"
                        initial={{ scaleX: 0, transformOrigin: "left" }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 1, transformOrigin: "right", opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                )}
            </AnimatePresence>

            {/* Full page loader - only shows if loading takes longer */}
            <AnimatePresence>
                {showFullLoader && (
                    <motion.div
                        className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex flex-col items-center gap-4">
                            {/* Animated spinner */}
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <motion.div
                                    className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary"
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />
                                <motion.div
                                    className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-primary/20"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            </motion.div>

                            {/* Loading text */}
                            <motion.p
                                className="text-sm font-medium text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                Loading...
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RouteChangeLoader;
