import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
      {...props}
    />
  );
}
