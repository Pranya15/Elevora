import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-2xl border bg-[var(--background-elevated)] px-4 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
