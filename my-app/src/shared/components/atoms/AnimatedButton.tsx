import React from "react";
import { cn } from "@/shared/lib/utils";

export interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  as?: React.ElementType;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className = "", as: Component = "button", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        {...props}
        className={cn(
          "group inline-flex items-center justify-center px-6 py-2 rounded-md relative overflow-hidden bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800",
          "text-neutral-900 dark:text-neutral-100 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50",
          "hover:scale-[1.01] active:scale-[0.97]",
          "[--shine:rgba(0,0,0,.66)] dark:[--shine:rgba(255,255,255,.66)]",
          className
        )}
      >
        {/* Text with shine mask */}
        <span className="tracking-wide font-light flex items-center justify-center h-full w-full relative z-10 animate-btn-text-shine">
          {children}
        </span>

        {/* Border shine effect uses the --shine variable so it adapts to theme */}
        <span
          className="block absolute inset-0 rounded-md p-px pointer-events-none animate-btn-border-shine bg-[length:200%_100%] [mask-composite:exclude] [-webkit-mask-composite:xor]"
          style={{
            background:
              "linear-gradient(-75deg, transparent 30%, var(--shine) 50%, transparent 70%)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          }}
        />
      </Component>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export default AnimatedButton;
