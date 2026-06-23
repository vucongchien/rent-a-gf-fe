import * as React from "react";

export type StatusBadgeVariant =
  | "sale"
  | "adopt"
  | "online"
  | "offline"
  | "available"
  | "booked"
  | "pending"
  | "approved"
  | "rejected";

export interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  className = "",
}) => {
  const getDefaultLabel = (): string => {
    switch (variant) {
      case "sale":
        return "For sale";
      case "adopt":
        return "To adopt";
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      case "available":
        return "Available";
      case "booked":
        return "Booked";
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Bị từ chối";
      default:
        return "";
    }
  };

  const getVariantStyles = (): string => {
    switch (variant) {
      case "sale":
        return "bg-secondary-soft text-neutral-900";
      case "adopt":
        return "bg-lime-soft text-neutral-900";
      case "online":
        return "bg-success text-neutral-900";
      case "offline":
        return "bg-neutral-200 text-neutral-600";
      case "available":
        return "bg-brand-muted text-brand-hover";
      case "booked":
        return "bg-neutral-300 text-neutral-700";
      case "pending":
        return "bg-amber-100 text-amber-900";
      case "approved":
        return "bg-emerald-100 text-emerald-900";
      case "rejected":
        return "bg-rose-100 text-rose-900";
      default:
        return "bg-white text-neutral-900";
    }
  };

  const displayLabel = label || getDefaultLabel();

  return (
    <span
      className={`inline-flex items-center justify-center font-sans font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-full select-none ${getVariantStyles()} ${className} border border-neutral-900 shadow-[0_2px_0_var(--color-neutral-900)]`} 
    >
      {variant === "online" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" aria-hidden="true" />
      )}
      {displayLabel}
    </span>
  );
};

StatusBadge.displayName = "StatusBadge";
