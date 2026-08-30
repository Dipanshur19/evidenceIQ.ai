import React, { useState, useEffect } from "react";

export function SkeletonBar({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
  style = {},
}) {
  return (
    <div
      className="skeleton-pulse"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({
  title = "Loading Card...",
  statusMessage = "Fetching investigation metadata...",
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        background: "#181D2B",
        border: "1px solid #2A3147",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <SkeletonBar width="40%" height="20px" />
        <SkeletonBar width="20%" height="16px" />
      </div>
      <SkeletonBar width="100%" height="40px" borderRadius="8px" />
      <div style={{ display: "flex", gap: "10px" }}>
        <SkeletonBar width="33%" height="14px" />
        <SkeletonBar width="33%" height="14px" />
        <SkeletonBar width="33%" height="14px" />
      </div>

      {elapsedSeconds >= 4 && (
        <div
          style={{
            fontSize: "0.78rem",
            color: "#818CF8",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "4px",
          }}
        >
          <span
            className="btn-spinner"
            style={{ width: "12px", height: "12px" }}
          />
          <span>
            {statusMessage} ({elapsedSeconds}s)
          </span>
        </div>
      )}
    </div>
  );
}

export function SkeletonTable({
  rows = 4,
  columns = 4,
  statusMessage = "Compiling multi-parameter diagnostic matrix...",
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        background: "#181D2B",
        border: "1px solid #2A3147",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          paddingBottom: "10px",
          borderBottom: "1px solid #2A3147",
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBar key={i} width={`${100 / columns}%`} height="18px" />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: "flex", gap: "12px" }}>
            {Array.from({ length: columns }).map((_, c) => (
              <SkeletonBar key={c} width={`${100 / columns}%`} height="16px" />
            ))}
          </div>
        ))}
      </div>

      {elapsedSeconds >= 4 && (
        <div
          style={{
            fontSize: "0.78rem",
            color: "#818CF8",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          <span
            className="btn-spinner"
            style={{ width: "12px", height: "12px" }}
          />
          <span>
            {statusMessage} ({elapsedSeconds}s)
          </span>
        </div>
      )}
    </div>
  );
}

export function SkeletonChart({
  height = "220px",
  statusMessage = "Loading evidence graph nodes...",
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        background: "#181D2B",
        border: "1px solid #2A3147",
        borderRadius: "12px",
        padding: "20px",
        height,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <SkeletonBar width="30%" height="20px" />
        <SkeletonBar width="15%" height="16px" />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "16px",
          height: "calc(100% - 60px)",
        }}
      >
        <SkeletonBar width="15%" height="40%" />
        <SkeletonBar width="15%" height="75%" />
        <SkeletonBar width="15%" height="55%" />
        <SkeletonBar width="15%" height="90%" />
        <SkeletonBar width="15%" height="65%" />
        <SkeletonBar width="15%" height="30%" />
      </div>

      {elapsedSeconds >= 4 && (
        <div
          style={{
            fontSize: "0.78rem",
            color: "#818CF8",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "12px",
          }}
        >
          <span
            className="btn-spinner"
            style={{ width: "12px", height: "12px" }}
          />
          <span>
            {statusMessage} ({elapsedSeconds}s)
          </span>
        </div>
      )}
    </div>
  );
}
