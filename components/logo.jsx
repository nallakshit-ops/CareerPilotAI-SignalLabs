import React from "react";

export function LogoIcon({ className = "h-7 w-7", size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        width="32"
        height="32"
        rx="7"
        className="fill-foreground/[0.04] stroke-border"
        strokeWidth="1"
      />
      {/* Precision Geometric Corporate Mark */}
      <path
        d="M9 22L16 6L23 22L16 18.5L9 22Z"
        className="fill-primary"
      />
      <path
        d="M16 6L23 22L16 18.5V6Z"
        fill="currentColor"
        className="text-foreground/20"
      />
      <path
        d="M12.5 18.5L16 11.5L19.5 18.5L16 17L12.5 18.5Z"
        className="fill-background"
      />
      <circle cx="16" cy="15" r="1.25" className="fill-primary" />
    </svg>
  );
}

export function Logo({
  className = "",
  size = "md",
  showText = true,
}) {
  const iconSizes = {
    sm: 24,
    md: 28,
    lg: 34,
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconDim = iconSizes[size] || 28;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        <LogoIcon size={iconDim} />
      </div>
      {showText && (
        <div className="flex items-center tracking-tight">
          <span className={`font-semibold text-foreground ${textSizes[size] || "text-base"}`}>
            Career<span className="font-bold text-primary">Pilot</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default Logo;
