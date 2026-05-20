import { GlassCard } from "./glass-card";
import { ThemeToggle } from "./theme-toggle";

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <GlassCard className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-end">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.38em] text-muted">{eyebrow}</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 md:justify-self-end">
        {action}
        <ThemeToggle />
      </div>
    </GlassCard>
  );
}
