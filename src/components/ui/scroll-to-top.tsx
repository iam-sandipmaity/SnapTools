'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Threshold for intelligence protocol activation
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, translateY: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-8 right-8 z-[9999]",
            "flex items-center justify-center",
            "w-14 h-14 rounded-2xl",
            "bg-primary text-white shadow-2xl shadow-primary/30",
            "hover:bg-primary/90 transition-colors",
            "backdrop-blur-md border border-white/20 dark:border-black/20",
            "group overflow-hidden"
          )}
          aria-label="Execute Scroll Protocol"
        >
          {/* Workstation Highlight Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <ArrowUp className="w-6 h-6 z-10" />

          {/* Technical scanning line animation on hover */}
          <motion.div
            className="absolute top-0 left-0 w-full h-[2px] bg-white/40 blur-[1px]"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;