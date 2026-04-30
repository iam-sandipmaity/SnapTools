import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AccentTone = "indigo" | "emerald" | "amber" | "rose";

type Metric = {
  label: string;
  value: ReactNode;
  hint?: string;
};

const accents: Record<AccentTone, { glow: string; badge: string; icon: string }> = {
  indigo: {
    glow: "from-sky-500/10 via-primary/10 to-indigo-500/10",
    badge: "border-primary/20 bg-primary/10 text-primary",
    icon: "bg-primary/10 text-primary",
  },
  emerald: {
    glow: "from-emerald-500/10 via-lime-500/10 to-green-500/10",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    glow: "from-amber-500/10 via-orange-500/10 to-yellow-500/10",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  rose: {
    glow: "from-rose-500/10 via-pink-500/10 to-fuchsia-500/10",
    badge: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
};

export function ToolWorkbench({
  icon: Icon,
  eyebrow,
  title,
  description,
  accent = "indigo",
  metrics = [],
  badges = [],
  children,
  aside,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  accent?: AccentTone;
  metrics?: Metric[];
  badges?: string[];
  children: ReactNode;
  aside?: ReactNode;
}) {
  const palette = accents[accent];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-black/5 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/[0.03]">
        <CardContent className="relative p-0">
          <div className={cn("absolute inset-0 bg-gradient-to-br", palette.glow)} />
          <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-black/5 shadow-sm dark:border-white/10",
                    palette.icon,
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <div
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em]",
                      palette.badge,
                    )}
                  >
                    {eyebrow}
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-black tracking-tight md:text-4xl">
                      {title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
                      {description}
                    </p>
                  </div>
                </div>
              </div>

              {badges.length > 0 && <ToolTagList tags={badges} />}

              <div className="mt-6">{children}</div>
            </div>

            <div className="border-t border-black/5 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.02] lg:border-l lg:border-t-0 md:p-8">
              {metrics.length > 0 && <ToolMetricGrid metrics={metrics} className="mb-6" />}
              {aside}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ToolPanel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-black/5 shadow-sm dark:border-white/10", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>
          {description ? <CardDescription className="leading-6">{description}</CardDescription> : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ToolMetricGrid({
  metrics,
  className,
}: {
  metrics: Metric[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {metric.label}
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight">{metric.value}</div>
          {metric.hint ? (
            <div className="mt-2 text-xs leading-5 text-muted-foreground">{metric.hint}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ToolTagList({
  tags,
  className,
}: {
  tags: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="rounded-full border-black/10 bg-white/60 px-3 py-1 text-[11px] font-medium dark:border-white/10 dark:bg-white/[0.03]"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

export function ToolCodeBlock({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        "max-h-[480px] overflow-auto rounded-3xl border border-black/5 bg-slate-950 p-5 text-sm leading-7 text-slate-100 shadow-inner dark:border-white/10",
        className,
      )}
    >
      <code className="whitespace-pre-wrap break-words font-mono">{value}</code>
    </pre>
  );
}
