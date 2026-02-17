import React from "react";
import { LucideIcon, Clock, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  onClick?: () => void;
  color?: string;
  gradient?: {
    from: string;
    to: string;
  };
  style?: React.CSSProperties;
  comingSoon?: boolean;
}

const ToolCard = ({
  icon: Icon,
  title,
  description,
  className,
  onClick,
  color,
  gradient,
  style,
  comingSoon = false,
}: ToolCardProps) => {
  return (
    <div
      className={cn(
        "group relative p-8 rounded-[2.5rem] border border-black/[0.03] dark:border-white/5 bg-white/60 dark:bg-white/[0.01] backdrop-blur-md hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 block overflow-hidden cursor-pointer isolate",
        comingSoon && "opacity-60 grayscale cursor-not-allowed",
        className
      )}
      onClick={!comingSoon ? onClick : undefined}
      style={style}
    >
      {comingSoon && (
        <div className="absolute top-6 right-6 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 z-20 backdrop-blur-md">
          <Clock size={10} />
          Development
        </div>
      )}

      {/* Background Decorative Blur & Accents */}
      {gradient && (
        <>
          <div
            className="absolute -right-8 -top-8 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none -z-10"
            style={{ background: gradient.from }}
          />
          <div
            className="absolute inset-0 opacity-[0.02] dark:opacity-0 transition-opacity group-hover:opacity-[0.05] -z-10"
            style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
          />
        </>
      )}

      {/* Icon Container with Glassmorphism */}
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg isolate",
          color ? color : "bg-primary/10"
        )}
      >
        <div className="absolute inset-0 bg-white/40 dark:bg-black/20 blur-sm rounded-2xl" />
        <Icon size={24} className="relative z-10 text-primary group-hover:text-primary transition-colors" />
      </div>

      {/* Content */}
      <div className="space-y-3 relative z-10">
        <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Interactive Footer */}
      <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
          Explore Suite
        </span>
        <div className="w-8 h-8 rounded-full bg-muted/50 dark:bg-white/[0.05] flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-[360deg] duration-700">
          <Command size={14} />
        </div>
      </div>
    </div>
  );
};

export default ToolCard;
