import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * Custom hook for theme-aware components
 * Handles SSR/hydration mismatch and provides theme state
 * 
 * @returns Object with theme state and helper values
 */
export function useThemeState() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper values for theme-aware styling
  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const isLight = mounted ? resolvedTheme === 'light' : false;

  // Theme-aware colors (using CSS variables from design system)
  const colors = {
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    card: 'hsl(var(--card))',
    cardForeground: 'hsl(var(--card-foreground))',
    primary: 'hsl(var(--primary))',
    primaryForeground: 'hsl(var(--primary-foreground))',
    secondary: 'hsl(var(--secondary))',
    secondaryForeground: 'hsl(var(--secondary-foreground))',
    muted: 'hsl(var(--muted))',
    mutedForeground: 'hsl(var(--muted-foreground))',
    accent: 'hsl(var(--accent))',
    accentForeground: 'hsl(var(--accent-foreground))',
    destructive: 'hsl(var(--destructive))',
    destructiveForeground: 'hsl(var(--destructive-foreground))',
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
  };

  return {
    // Theme state
    theme,
    resolvedTheme,
    mounted,
    
    // Helper booleans
    isDark,
    isLight,
    
    // Theme colors
    colors,
    
    // Actions
    setTheme,
  };
}

export default useThemeState;
