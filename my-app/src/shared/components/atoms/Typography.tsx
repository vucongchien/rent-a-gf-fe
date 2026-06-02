import * as React from "react";

type Variant = "h1" | "h2" | "h3" | "h4" | "body1" | "body2" | "caption";
type FontType = "sans" | "display" | "mono";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: Variant;
  font?: FontType;
  as?: React.ElementType;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ variant = "body1", font = "sans", as, className = "", children, ...props }, ref) => {
    
    // Ánh xạ Component tag mặc định theo variant
    const defaultTags: Record<Variant, React.ElementType> = {
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      body1: "p",
      body2: "p",
      caption: "span",
    };

    const Component = as || defaultTags[variant];

    // Typography scales mapping (dùng Tailwind classes)
    const variantStyles: Record<Variant, string> = {
      h1: "text-4xl md:text-5xl font-bold tracking-tight",
      h2: "text-3xl md:text-4xl font-semibold tracking-tight",
      h3: "text-2xl md:text-3xl font-semibold",
      h4: "text-xl md:text-2xl font-medium",
      body1: "text-base leading-relaxed",
      body2: "text-sm leading-relaxed",
      caption: "text-xs text-text-muted",
    };

    const fontStyles: Record<FontType, string> = {
      sans: "font-sans",
      display: "font-display",
      mono: "font-mono",
    };

    const classes = `${variantStyles[variant]} ${fontStyles[font]} text-text ${className}`;

    return (
      <Component ref={ref as any} className={classes} {...props}>
        {children}
      </Component>
    );
  }
);

Typography.displayName = "Typography";
