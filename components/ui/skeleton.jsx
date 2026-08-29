import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse-smooth rounded-[10px] bg-white/[0.06] loading-shimmer", className)}
      {...props}
    />
  );
}
