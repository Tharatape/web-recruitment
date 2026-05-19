"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-[var(--border)] text-[var(--foreground)] hover:bg-[#cbd5e1] disabled:opacity-50",
    danger:
      "bg-[var(--accent-red)] text-white hover:bg-[#dc2626] disabled:opacity-50",
    ghost:
      "bg-transparent text-[var(--foreground)] hover:bg-[var(--primary-light)]",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm font-medium rounded",
    md: "px-5 py-2.5 text-sm font-semibold rounded-lg",
    lg: "px-7 py-3 text-base font-semibold rounded-lg",
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} transition-colors cursor-pointer ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
