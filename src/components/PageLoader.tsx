import { motion } from "framer-motion";

const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                {/* Animated Logo/Spinner */}
                <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Outer rotating ring */}
                    <motion.div
                        className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />

                    {/* Inner pulsing circle */}
                    <motion.div
                        className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-primary/20"
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
                <motion.div
                    className="flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="text-sm font-medium text-muted-foreground">Loading</span>
                    <motion.span
                        className="flex gap-0.5"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </motion.span>
                </motion.div>

                {/* Progress bar */}
                <motion.div
                    className="w-48 h-1 bg-muted rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default PageLoader;
