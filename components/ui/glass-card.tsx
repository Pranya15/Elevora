import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "glass-panel rounded-[28px] border border-[var(--border)] ring-1 ring-white/30 dark:ring-white/6",
        className
      )}
    >
      {children}
    </div>
  );
}
