import labels from "../kpi-labels.json";

export function getLabel(category, key) {
  if (!labels[category]) return key;
  return labels[category][key] || key;
}

export function getRegionLabel(key) {
  return getLabel("regions", key);
}

export function getChannelLabel(key) {
  return getLabel("channels", key);
}

export function getMetricLabel(key) {
  return getLabel("kpi_metrics", key);
}

export function getStatusLabel(key) {
  return getLabel("statuses", key);
}
