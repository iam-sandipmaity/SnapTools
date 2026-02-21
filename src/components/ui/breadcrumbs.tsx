import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2", className)}
        >
            <Link
                to="/"
                className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
                <Home size={12} />
                <span>Base</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <ChevronRight size={10} className="text-muted-foreground/30" />
                    {item.href ? (
                        <Link
                            to={item.href}
                            className="hover:text-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-primary">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
