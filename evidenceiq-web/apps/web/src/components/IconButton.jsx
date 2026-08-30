import React from "react";

export default function IconButton({
  icon,
  label,
  onClick,
  isLoading = false,
  isDisabled = false,
  disabledReason,
  className = "",
  style = {},
  ...props
}) {
  const isBlocked = isDisabled || isLoading;

  const iconBtn = (
    <button
      type="button"
      onClick={isBlocked ? undefined : onClick}
      disabled={isBlocked}
      aria-label={label}
      className={`btn-base btn-icon ${className}`}
      style={style}
      {...props}
    >
      {isLoading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : (
        <span
          style={{ fontSize: "1.1rem", display: "flex", alignItems: "center" }}
        >
          {icon}
        </span>
      )}
    </button>
  );

  const tooltipText = isBlocked && disabledReason ? disabledReason : label;

  return (
    <div className="tooltip-wrapper">
      {iconBtn}
      {tooltipText && (
        <div className="tooltip-content" role="tooltip">
          {tooltipText}
        </div>
      )}
    </div>
  );
}
