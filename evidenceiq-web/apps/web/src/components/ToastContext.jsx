import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msgOrObj, type = "info", duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    let title = "";
    let message = "";
    let toastType = type;

    if (typeof msgOrObj === "object" && msgOrObj !== null) {
      title = msgOrObj.title || "";
      message = msgOrObj.message || "";
      toastType = msgOrObj.type || type;
    } else {
      message = String(msgOrObj || "");
    }

    setToasts((prev) => [
      ...prev,
      { id, title, message, type: toastType, duration, isPaused: false },
    ]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

function ToastItem({ toast, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);

  React.useEffect(() => {
    if (isHovered) return;
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, isHovered, onRemove]);

  const borderColor =
    toast.type === "success"
      ? "#10B981"
      : toast.type === "error"
        ? "#EF4444"
        : "#4F46E5";

  return (
    <div
      className="toast-item"
      style={{ borderLeftColor: borderColor }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="alert"
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        {toast.type === "success" ? (
          <CheckCircle2 size={16} color="#10B981" style={{ marginTop: "2px", flexShrink: 0 }} />
        ) : toast.type === "error" ? (
          <AlertCircle size={16} color="#EF4444" style={{ marginTop: "2px", flexShrink: 0 }} />
        ) : (
          <Info size={16} color="#A1A1AA" style={{ marginTop: "2px", flexShrink: 0 }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {toast.title && (
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#FFFFFF" }}>
              {toast.title}
            </span>
          )}
          <span style={{ fontSize: "0.8rem", color: "#A1A1AA" }}>{toast.message}</span>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="btn-icon"
        style={{ padding: "2px 6px", color: "#71717A", display: "inline-flex", alignItems: "center", marginLeft: "12px" }}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: (msg) => console.log("Toast:", msg),
      removeToast: () => {},
    };
  }
  return context;
}
