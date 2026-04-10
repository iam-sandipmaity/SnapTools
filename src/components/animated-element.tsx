import { ReactNode, useMemo } from "react";
import { motion } from "framer-motion";

interface AnimatedElementProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  animation?: "fadeIn" | "slideUp" | "scale" | "none";
}

// Pre-defined animation configs (memoized to avoid recreation)
const animations = {
  fadeIn: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  },
  slideUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  none: {
    hidden: { opacity: 1 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0
      }
    }
  }
};

const AnimatedElement = ({
  children,
  delay = 0,
  className = "",
  animation = "fadeIn"
}: AnimatedElementProps) => {
  // Memoize the selected animation
  const selectedAnimation = useMemo(() => animations[animation] || animations.none, [animation]);
  
  // Apply delay to the transition - memoized
  const animationWithDelay = useMemo(() => ({
    ...selectedAnimation,
    visible: {
      ...selectedAnimation.visible,
      transition: {
        ...(selectedAnimation.visible.transition || {}),
        delay
      }
    }
  }), [selectedAnimation, delay]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={animationWithDelay}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedElement;
