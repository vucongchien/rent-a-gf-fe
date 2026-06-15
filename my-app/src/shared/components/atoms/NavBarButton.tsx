import * as React from "react";

export type NavBarButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const NavBarButton = React.forwardRef<HTMLButtonElement, NavBarButtonProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <button ref={ref} className={className} {...props} />
    );
  }
);

NavBarButton.displayName = "NavBarButton";
