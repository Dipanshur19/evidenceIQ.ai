/**
 * Deterministic Anomaly Detection Engine (Node.js Math)
 * Calculates rolling mean, std deviation, and z-score without LLM intervention.
 */
const ss = require("simple-statistics");

function detectAnomaly(timeSeries, asOfDate, windowDays = 21) {
  const sorted = [...timeSeries].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const asOfIndex = sorted.findIndex((item) => item.date === asOfDate);

  if (asOfIndex === -1 || asOfIndex < 5) {
    return {
      status: "insufficient_data",
      reason: "Sparse history (less than 5 baseline days)",
    };
  }

  const baselineSlice = sorted.slice(
    Math.max(0, asOfIndex - windowDays),
    asOfIndex,
  );
  const baselineValues = baselineSlice.map((item) => item.value);

  if (baselineValues.length < 5) {
    return {
      status: "insufficient_data",
      reason: "Insufficient baseline window",
    };
  }

  const expected = ss.mean(baselineValues);
  const sigma = ss.sampleStandardDeviation(baselineValues) || 1e-6;
  const observed = sorted[asOfIndex].value;
  const zScore = (observed - expected) / sigma;

  let severity = "NORMAL";
  if (Math.abs(zScore) >= 3.0) {
    severity = "HIGH";
  } else if (Math.abs(zScore) >= 1.96) {
    severity = "MEDIUM";
  }

  return {
    status: "ok",
    as_of_date: asOfDate,
    observed_value: Number(observed.toFixed(3)),
    expected_value: Number(expected.toFixed(3)),
    sigma: Number(sigma.toFixed(3)),
    z_score: Number(zScore.toFixed(3)),
    severity,
    delta_pct: Number((((observed - expected) / expected) * 100).toFixed(2)),
    is_sparse_history: baselineValues.length < 14,
  };
}

module.exports = { detectAnomaly };
