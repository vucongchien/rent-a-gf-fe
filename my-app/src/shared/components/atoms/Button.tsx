import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent" | "quick-select";
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  activeBorderColor?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isActive = false, activeBorderColor, ...props }, ref) => {
    // Mapping classes statically so Tailwind CSS static analysis can detect and bundle them.
    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      accent: "btn-accent",
      outline: "btn-outline",
      ghost: "btn-ghost",
    };

    const sizeClasses = {
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
    };

    const isQuickSelect = variant === "quick-select";

    // CSS classes cho quick select (nút nạp nhanh)
    const quickSelectClasses = `
      h-[42px] px-3 font-sans font-bold text-[13.5px] rounded-[10px] bg-white transition-colors duration-100 flex items-center justify-center cursor-pointer select-none
      ${isActive 
        ? 'border-dashed border-[2px] text-neutral-900 font-extrabold' 
        : 'border border-solid border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 active:bg-neutral-50'
      }
      ${className}
    `;

    const classes = isQuickSelect 
      ? quickSelectClasses 
      : `btn-base ${variantClasses[variant as keyof typeof variantClasses]} ${sizeClasses[size]} ${className}`;

    // Truyền style border color động cho quick select active
    const inlineStyle = isQuickSelect && isActive
      ? { borderColor: activeBorderColor || 'var(--color-chizuru-600)', ...props.style }
      : props.style;

    return (
      <button ref={ref} className={classes} style={inlineStyle} {...props} />
    );
  }
);

Button.displayName = "Button";
