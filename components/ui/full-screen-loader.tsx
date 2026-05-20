export function FullScreenLoader({ label }: { label: string }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
        <p className="text-sm text-muted">{label}</p>
      </div>
    </main>
  );
}
