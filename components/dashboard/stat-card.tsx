import { GlassCard } from "@/components/ui/glass-card";

export function StatCard({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <GlassCard className="space-y-4 p-5">
      <p className="text-sm text-muted">{label}</p>
      <div>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted">{meta}</p>
      </div>
    </GlassCard>
  );
}
