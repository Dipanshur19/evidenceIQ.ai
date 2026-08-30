import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  onClick,
  variant = "primary",
  isLoading = false,
  isDisabled = false,
  loadingText,
  disabledReason,
  icon,
  className = "",
  style = {},
  type = "button",
  ...props
}) {
  const isBlocked = isDisabled || isLoading;

  const buttonElement = (
    <button
      type={type}
      onClick={isBlocked ? undefined : onClick}
      disabled={isBlocked}
      className={`btn-base ${variant === "primary" ? "btn-primary" : "btn-secondary"} ${className}`}
      style={style}
      aria-disabled={isBlocked}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          <span>{loadingText || "Processing..."}</span>
        </>
      ) : (
        <>
          {icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );

  if (isDisabled && disabledReason) {
    return (
      <div className="tooltip-wrapper">
        {buttonElement}
        <div className="tooltip-content" role="tooltip">
          {disabledReason}
        </div>
      </div>
    );
  }

  return buttonElement;
}
