
import React from "react";
import { LucideIcon, Clock } from "lucide-react";
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
  color = "bg-tooltopia-purple",
  gradient,
  style,
  comingSoon = false,
}: ToolCardProps) => {
  const gradientClasses = gradient
    ? `from-${gradient.from} to-${gradient.to}`
    : "";

  return (
    <div
      className={cn(
        "tool-card flex flex-col items-center text-center cursor-pointer relative",
        comingSoon && "opacity-75",
        className
      )}
      onClick={onClick}
      style={style}
    >
      {comingSoon && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
          <Clock size={12} />
          Coming Soon
        </div>
      )}
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex-center mb-4",
          color,
          gradientClasses
        )}
      >
        <Icon size={32} className="text-primary-foreground" />
      </div>
      <h3 className="font-medium text-xl mb-2">{title}</h3>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </div>
  );
};

export default ToolCard;
