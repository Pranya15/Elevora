import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary:
      "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_14px_34px_rgba(31,78,95,0.24)] hover:-translate-y-0.5 hover:brightness-105 dark:shadow-[0_16px_36px_rgba(6,182,212,0.16)]",
    secondary:
      "bg-[var(--card-strong)] text-[var(--foreground)] shadow-[var(--shadow-soft)] hover:bg-[var(--background-elevated)] hover:-translate-y-0.5",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
  };

  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full border border-transparent px-5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
