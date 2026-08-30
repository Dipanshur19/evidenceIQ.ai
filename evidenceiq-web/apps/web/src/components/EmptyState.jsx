import React from "react";
import { Inbox, AlertCircle, RotateCcw } from "lucide-react";
import Button from "./Button";

export function EmptyState({
  icon: CustomIcon,
  title = "No Data Available",
  description = "No active records or anomalies matching your filter criteria were found.",
  actionLabel,
  onAction,
  style = {},
}) {
  const IconComponent = CustomIcon || Inbox;

  return (
    <div
      style={{
        background: "#12131A",
        border: "1px solid #222432",
        borderRadius: "8px",
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        maxWidth: "480px",
        margin: "24px auto",
        ...style,
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "8px",
          background: "#181924",
          border: "1px solid #222432",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "4px",
        }}
      >
        <IconComponent size={22} color="#71717A" />
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
        {title}
      </div>
      <div style={{ fontSize: "0.875rem", color: "#9CA3AF", lineHeight: 1.6 }}>
        {description}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} style={{ marginTop: "12px" }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Data Source Unavailable",
  errorDetails = "Unable to reach the backend diagnostic service at http://localhost:8000.",
  timestamp = new Date().toLocaleTimeString(),
  onRetry,
  style = {},
}) {
  return (
    <div
      style={{
        background: "rgba(239, 68, 68, 0.05)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderRadius: "8px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        margin: "16px 0",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} color="#EF4444" />
          <span
            style={{ fontWeight: 600, color: "#EF4444", fontSize: "0.9375rem" }}
          >
            {title}
          </span>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            color: "#71717A",
            fontFamily: "var(--font-mono)",
          }}
        >
          Failed at {timestamp}
        </span>
      </div>

      <div
        style={{
          fontSize: "0.8125rem",
          color: "#D4D4D8",
          fontFamily: "var(--font-mono)",
          background: "#090A0F",
          padding: "12px",
          borderRadius: "4px",
          border: "1px solid #222432",
        }}
      >
        {errorDetails}
      </div>

      {onRetry && (
        <div style={{ alignSelf: "flex-start", marginTop: "4px" }}>
          <Button
            variant="secondary"
            onClick={onRetry}
            icon={<RotateCcw size={14} />}
            style={{ borderColor: "rgba(239, 68, 68, 0.3)", color: "#EF4444" }}
          >
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
}
