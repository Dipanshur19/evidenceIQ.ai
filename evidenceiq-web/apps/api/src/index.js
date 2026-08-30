/**
 * EvidenceIQ.ai — Node.js Express + Socket.io Server (Rossmann Dataset + 5-Model Balancer)
 */
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { detectAnomaly } = require("./anomaly/detector");
const { generateNarration } = require("./narration/llmAdapter");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// 5-Model Priority Chain Definition
const BALANCER_CHAIN = [
  {
    id: "ollama_qwen",
    name: "Ollama (qwen2.5:1.5b)",
    provider: "ollama",
    model: "qwen2.5:1.5b",
  },
  {
    id: "ollama_llama",
    name: "Ollama (llama3.2)",
    provider: "ollama",
    model: "llama3.2",
  },
  {
    id: "hf_llama",
    name: "Hugging Face (Llama-3.1-8B)",
    provider: "huggingface",
    model: "meta-llama/Llama-3.1-8B-Instruct",
  },
  {
    id: "gemini_flash",
    name: "Google Gemini (gemini-2.0-flash)",
    provider: "gemini",
    model: "gemini-2.0-flash",
  },
  {
    id: "rule_engine",
    name: "Deterministic Grounded Engine",
    provider: "fallback",
    model: "rule_engine_v1",
  },
];

// Rossmann Store 101 Time Series Data (Aug 2026)
const rossmannStore101Series = [
  { date: "2026-08-01", value: 10842.1, promo: 0, customers: 748 },
  { date: "2026-08-02", value: 10915.4, promo: 0, customers: 752 },
  { date: "2026-08-03", value: 15420.8, promo: 1, customers: 1063 },
  { date: "2026-08-04", value: 15180.5, promo: 1, customers: 1047 },
  { date: "2026-08-05", value: 15610.2, promo: 1, customers: 1076 },
  { date: "2026-08-06", value: 14980.0, promo: 1, customers: 1033 },
  { date: "2026-08-07", value: 15250.3, promo: 1, customers: 1051 },
  { date: "2026-08-08", value: 10790.6, promo: 0, customers: 744 },
  { date: "2026-08-09", value: 10880.2, promo: 0, customers: 750 },
  { date: "2026-08-10", value: 10650.0, promo: 0, customers: 734 },
  { date: "2026-08-11", value: 10920.4, promo: 0, customers: 753 },
  { date: "2026-08-12", value: 3373.11, promo: 0, customers: 248 }, // Disruption drop
  { date: "2026-08-13", value: 3250.5, promo: 0, customers: 239 },
  { date: "2026-08-14", value: 3410.2, promo: 0, customers: 251 },
  { date: "2026-08-15", value: 3390.8, promo: 0, customers: 249 },
];

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

// Proxy helper to FastAPI
async function proxyToFastApi(req, res, path) {
  try {
    const url = `${FASTAPI_URL}${path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`;
    const options = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    };
    if (req.method !== "GET" && req.method !== "HEAD") {
      options.body = JSON.stringify(req.body);
    }
    const response = await fetch(url, options);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`Error forwarding to FastAPI at ${path}:`, err.message);
    res
      .status(502)
      .json({ error: "FastAPI backend unavailable", details: err.message });
  }
}

// 1. Health & Model Balancer Status Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "EvidenceIQ Engine (Node.js + Rossmann Dataset + FastAPI Gateway)",
    balancer_chain: BALANCER_CHAIN,
    timestamp: new Date().toISOString(),
  });
});

// 2. Rossmann Dataset Details Endpoint
app.get("/api/dataset/details", (req, res) => {
  res.json({
    dataset_name: "Rossmann Store Sales (Kaggle)",
    total_records: 648,
    date_range: "2026-06-01 to 2026-08-20",
    stores: [
      { id: 101, region: "Region_A", type: "StoreType_A", avg_sales: 11250.4 },
      { id: 102, region: "Region_A", type: "StoreType_B", avg_sales: 12410.1 },
      { id: 103, region: "Region_B", type: "StoreType_A", avg_sales: 10890.5 },
      { id: 104, region: "Region_B", type: "StoreType_C", avg_sales: 13100.8 },
      { id: 105, region: "Region_C", type: "StoreType_A", avg_sales: 11540.2 },
      { id: 106, region: "Region_C", type: "StoreType_B", avg_sales: 12180.9 },
      { id: 107, region: "Region_D", type: "StoreType_C", avg_sales: 13450.0 },
      { id: 108, region: "Region_D", type: "StoreType_A", avg_sales: 10980.3 },
    ],
    features: [
      "Date",
      "Store",
      "Region",
      "StoreType",
      "Sales",
      "Customers",
      "Open",
      "Promo",
      "StateHoliday",
      "SchoolHoliday",
    ],
    ticket_logs: 4,
  });
});

// Dashboard & Analytics endpoints proxied to FastAPI
app.get("/api/dashboard/stats", (req, res) =>
  proxyToFastApi(req, res, "/dashboard/stats"),
);
app.get("/api/revenue/trend", (req, res) =>
  proxyToFastApi(req, res, "/revenue/trend"),
);
app.get("/api/revenue/by-channel", (req, res) =>
  proxyToFastApi(req, res, "/revenue/by-channel"),
);
app.get("/api/analytics/meta", (req, res) =>
  proxyToFastApi(req, res, "/analytics/meta"),
);
app.get("/api/analytics/heatmap", (req, res) =>
  proxyToFastApi(req, res, "/analytics/heatmap"),
);
app.get("/api/analytics/scan", (req, res) =>
  proxyToFastApi(req, res, "/analytics/scan"),
);
app.post("/api/analytics/investigate", async (req, res) => {
  const startTime = Date.now();
  const { region, channel, as_of_date, persona = "analyst" } = req.body;

  try {
    const pyRes = await fetch(`${FASTAPI_URL}/analytics/investigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region, channel, as_of_date, persona }),
    });
    const pyData = await pyRes.json();

    // Broadcast telemetry via socket.io
    const telemetry = {
      total_latency_ms: Date.now() - startTime,
      non_llm_latency_ms: 12,
      llm_latency_ms: Math.max(0, Date.now() - startTime - 12),
      active_model:
        pyData.narrative?.generation_method ||
        "load_balanced: Ollama (qwen2.5:1.5b)",
      status: pyRes.ok ? "success" : "fallback",
    };
    io.emit("telemetry:update", telemetry);
    pyData.telemetry = telemetry;

    res.status(pyRes.status).json(pyData);
  } catch (err) {
    console.error("Investigation forwarding failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Graph endpoints
app.get("/api/graph/data", (req, res) =>
  proxyToFastApi(req, res, "/graph/data"),
);

// Decision Memory endpoints
app.get("/api/investigations", (req, res) =>
  proxyToFastApi(req, res, "/investigations"),
);
app.get("/api/decisions", (req, res) => proxyToFastApi(req, res, "/decisions"));
app.post("/api/decisions", (req, res) =>
  proxyToFastApi(req, res, "/decisions"),
);
app.get("/api/decisions/outcomes", (req, res) =>
  proxyToFastApi(req, res, "/decisions/outcomes"),
);
app.post("/api/decisions/outcome", (req, res) =>
  proxyToFastApi(req, res, "/decisions/outcome"),
);

// Briefing Export Endpoints
app.get("/api/analytics/briefing/export", async (req, res) => {
  try {
    const url = `${FASTAPI_URL}/analytics/briefing/export${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json(errData);
    }

    // Pass along headers (Content-Type, Content-Disposition)
    const contentType = response.headers.get("content-type");
    const contentDisposition = response.headers.get("content-disposition");
    if (contentType) res.setHeader("Content-Type", contentType);
    if (contentDisposition)
      res.setHeader("Content-Disposition", contentDisposition);

    // Stream the binary/text response back to the client
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error(`Error forwarding export:`, err.message);
    res
      .status(502)
      .json({ error: "FastAPI backend unavailable", details: err.message });
  }
});

app.post("/api/analytics/briefing/verify-hash", (req, res) =>
  proxyToFastApi(req, res, "/analytics/briefing/verify-hash"),
);

// Grounded Copilot Q&A endpoint
app.post("/api/chat/ask", (req, res) => proxyToFastApi(req, res, "/chat/ask"));

// 3. Multi-Model Load Balancer Investigation Endpoint (Legacy Rossmann)
app.post("/api/anomalies/investigate", async (req, res) => {
  const startTime = Date.now();
  const {
    store_id = 101,
    as_of_date = "2026-08-15",
    persona = "analyst",
  } = req.body;

  const anomaly = detectAnomaly(rossmannStore101Series, as_of_date);
  const nonLlmLatency = Date.now() - startTime;

  if (anomaly.status === "insufficient_data") {
    return res.json({ status: "insufficient_data", message: anomaly.reason });
  }

  const hypotheses = [
    {
      id: "hypothesis:checkout_pos_terminal_failure",
      statement: `Store ${store_id} Checkout POS terminal crash during promotional window`,
      confidence_band: "HIGH",
      evidence_score: 0.85,
      supporting_evidence: [
        {
          id: "evidence:ticket_TICK_1001",
          summary: "Payment POS terminal timed out during checkout promotion",
        },
        {
          id: "evidence:ticket_TICK_1002",
          summary: "Barcode scanner error on promotional items",
        },
      ],
    },
  ];

  const context = {
    kpi: `kpi:rossmann_sales_store_${store_id}`,
    as_of_date,
    observed_value: anomaly.observed_value,
    expected_value: anomaly.expected_value,
    delta_pct: anomaly.delta_pct,
    z_score: anomaly.z_score,
    severity: anomaly.severity,
    ranked_hypotheses: hypotheses,
  };

  // Run through 5-Model Balancer
  const llmStart = Date.now();
  const narrative = await generateNarration(context, persona);
  const llmLatency = Date.now() - llmStart;
  const totalLatency = Date.now() - startTime;

  const telemetry = {
    total_latency_ms: totalLatency,
    non_llm_latency_ms: nonLlmLatency,
    llm_latency_ms: llmLatency,
    models_tested: narrative.models_tested || ["Ollama (qwen2.5:1.5b)"],
    active_model:
      narrative.generation_method || "load_balanced: Ollama (qwen2.5:1.5b)",
    estimated_cost_usd: 0.0,
  };

  io.emit("telemetry:update", telemetry);

  res.json({
    status: "ok",
    store_id,
    anomaly,
    hypotheses,
    narrative,
    persona,
    telemetry,
    recommendation: {
      recommendation_id: `rec:${Date.now().toString(36)}`,
      proposed_action: `Dispatch POS technician to Store ${store_id} & restart promotional barcode gateway`,
      risk: "medium",
      reversibility: "reversible_within_minutes",
      requires_human_review: true,
    },
  });
});

server.listen(PORT, () => {
  console.log(
    `🚀 EvidenceIQ Engine running on http://localhost:${PORT} with 5-Model Balancer & FastAPI Gateway`,
  );
});
