
import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  const { theme, systemTheme } = useTheme();
  const logoSrc1 = "/logo-1.png";
  const logoSrc2 = "/logo.svg";
  const isDark = theme === "system" ? systemTheme === "dark" : theme === "dark";
  const logoSrc = isDark ? logoSrc1 : logoSrc2;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Link to="/" className={cn("flex items-center", className)} onClick={handleClick}>
      <img src={logoSrc} alt="SnapTools Logo" className="h-12 md:h-16 lg:h-20 transition-all" />
    </Link>
  );
};

export default Logo;
