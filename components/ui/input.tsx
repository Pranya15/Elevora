import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border bg-[var(--background-elevated)] px-4 text-sm outline-none transition placeholder:text-[var(--muted)]/80 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] file:mr-4 file:h-8 file:rounded-xl file:border-0 file:bg-[var(--accent)]/12 file:px-3 file:text-sm file:font-medium file:text-[var(--foreground)]",
        className
      )}
      {...props}
    />
  );
}
