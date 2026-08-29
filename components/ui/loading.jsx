import { cn } from "@/lib/utils";

export function LoadingCard({ className }) {
  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      <div className="relative">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="p-6 space-y-4">
          <div className="h-5 bg-muted rounded animate-pulse-smooth w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse-smooth w-1/2" />
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded animate-pulse-smooth" />
            <div className="h-3 bg-muted rounded animate-pulse-smooth w-5/6" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 bg-muted rounded animate-pulse-smooth flex-1" />
            <div className="h-9 bg-muted rounded animate-pulse-smooth w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = "md", className }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-primary border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingDots() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
    </div>
  );
}
