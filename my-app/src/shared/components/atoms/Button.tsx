import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    // Base styles: Soft rounded corners with crisp 3D shadow support and satisfying snappy transitions
    const baseStyles = "inline-flex items-center justify-center rounded-3xl font-bold transition-all duration-100 ease-out cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";
    
    // Variant styles mapping to our pastel design tokens (3D Solid Shadows with active press effects)
    const variants = {
      primary: "bg-brand text-text border border-brand-hover shadow-[0_4px_0_var(--color-brand-hover)] hover:translate-y-[2px] hover:shadow-[0_2px_0_var(--color-brand-hover)] hover:brightness-105 active:translate-y-[4px] active:shadow-none",
      secondary: "bg-secondary text-text border border-[var(--color-ruka-600)] shadow-[0_3px_0_var(--color-ruka-600)] hover:translate-y-[1px] hover:shadow-[0_2px_0_var(--color-ruka-600)] hover:brightness-105 active:translate-y-[3px] active:shadow-none",
      accent: "bg-accent text-text border border-[var(--color-mami-600)] shadow-[0_3px_0_var(--color-mami-600)] hover:translate-y-[1px] hover:shadow-[0_2px_0_var(--color-mami-600)] hover:brightness-105 active:translate-y-[3px] active:shadow-none",
      outline: "bg-white text-text border-2 border-neutral-900 shadow-[0_4px_0_theme(colors.neutral.900)] hover:translate-y-[2px] hover:shadow-[0_2px_0_theme(colors.neutral.900)] hover:bg-[var(--color-cream)] active:translate-y-[4px] active:shadow-none",
      ghost: "bg-surface-muted text-text hover:bg-neutral-100 active:scale-95",
    };

    // Size styles
    const sizes = {
      sm: "h-9 px-5 text-sm",
      md: "h-11 px-8 text-base",
      lg: "h-14 px-10 text-lg",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button ref={ref} className={classes} {...props} />
    );
  }
);

Button.displayName = "Button";
