import React from "react";

/**
 * PulseDot — Animated status indicator dot with ripple ring.
 *
 * @param {"green"|"amber"|"red"|"blue"|"muted"} color - Semantic color variant
 * @param {number} size - Dot diameter in px (default 8)
 */
export default function PulseDot({ color = "green", size = 8 }) {
  return (
    <span
      className={`pulse-dot pulse-dot--${color}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="pulse-dot__ring" />
      <span className="pulse-dot__inner" />
    </span>
  );
}
