import * as React from "react";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <button 
        ref={ref} 
        className={`flex items-center justify-center active:scale-95 transition-transform ${className}`} 
        {...props} 
      />
    );
  }
);

IconButton.displayName = "IconButton";
