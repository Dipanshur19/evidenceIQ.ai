import React, { useEffect, useRef, useState } from "react";

/**
 * AnimatedNumber — Smoothly counts up/down to a target number on mount or value change.
 *
 * @param {number}  value       - Target numeric value
 * @param {number}  duration    - Animation duration in ms (default 900)
 * @param {number}  decimals    - Decimal places (default 0)
 * @param {string}  prefix      - Text before the number (e.g. "+", "-", "₹")
 * @param {string}  suffix      - Text after the number  (e.g. "%", "ms")
 * @param {string}  className   - Extra class names for the wrapper span
 * @param {object}  style       - Inline styles for the wrapper span
 */
export default function AnimatedNumber({
  value,
  duration = 900,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  style = {},
}) {
  const [displayed, setDisplayed] = useState(0);
  const startRef = useRef(null);
  const fromRef  = useRef(0);
  const rafRef   = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to   = value;
    const start = performance.now();
    startRef.current = start;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3); // cubic ease-out

    const tick = (now) => {
      const elapsed = now - start;
      const t       = Math.min(elapsed / duration, 1);
      const current = from + (to - from) * easeOut(t);
      setDisplayed(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const formatted = displayed.toFixed(decimals);

  return (
    <span className={className} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
