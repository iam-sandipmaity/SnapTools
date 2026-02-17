import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  style?: React.CSSProperties;
}

const FeatureCard = ({ icon: Icon, title, description, className, style }: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col items-start p-10 rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-white dark:hover:bg-white/[0.04] transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5",
        className
      )}
      style={style}
    >
      {/* Dynamic Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 opacity-0 group-hover:opacity-100 blur-[80px] transition-opacity duration-700 pointer-events-none" />

      {/* Icon Container with Glassmorphic Style */}
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white shadow-lg shadow-primary/5 relative z-10">
        <Icon size={28} />
      </div>

      {/* Content Area */}
      <div className="space-y-4 relative z-10 h-full flex flex-col">
        <h3 className="text-2xl font-serif font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground/80 leading-relaxed font-medium">
          {description}
        </p>

        {/* Subtle Interactive Mark */}
        <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Protocol Active</span>
          <div className="w-1 h-1 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
