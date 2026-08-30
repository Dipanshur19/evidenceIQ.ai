"""
EvidenceIQ.ai - Prototype Presentation & Demo Script PDF Generator
Accenture Innovation Challenge 2026 · Problem Track 3: BusinessIntelligence.ai
Compiles the 4-Minute Master Presentation & Screen Recording Script into a publication-grade PDF.
"""

import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.pdfgen import canvas


class ScriptNumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#71717A"))

        # Header (pages after cover page)
        if self._pageNumber > 1:
            self.drawString(54, 750, "ACCENTURE INNOVATION CHALLENGE 2026 · TRACK 3: BUSINESSINTELLIGENCE.AI")
            self.drawRightString(558, 750, "PROTOTYPE DEMO & PRESENTATION SCRIPT")
            self.setStrokeColor(colors.HexColor("#E4E4E7"))
            self.setLineWidth(0.75)
            self.line(54, 742, 558, 742)

        # Footer
        self.setStrokeColor(colors.HexColor("#E4E4E7"))
        self.setLineWidth(0.75)
        self.line(54, 45, 558, 45)

        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "CONFIDENTIAL · EVIDENCEIQ.AI 4-MINUTE SCREEN RECORDING & PITCH SCRIPT")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()


def generate_demo_script_pdf(output_pdf_path: str):
    print(f"[*] Generating Prototype Demo & Presentation Script PDF...")

    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ScriptTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#18181B"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "ScriptSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#7C3AED"),
        spaceAfter=10,
    )
    scene_hdr_style = ParagraphStyle(
        "SceneHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=10,
        spaceAfter=3,
        keepWithNext=True,
    )
    scene_meta_style = ParagraphStyle(
        "SceneMeta",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#6D28D9"),
        spaceAfter=5,
        keepWithNext=True,
    )
    action_style = ParagraphStyle(
        "ActionText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#475569"),
        spaceAfter=6,
    )
    script_style = ParagraphStyle(
        "VoiceoverScript",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#18181B"),
        spaceAfter=6,
    )
    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#18181B"),
    )
    table_hdr_style = ParagraphStyle(
        "TableHdr",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white,
    )

    story = []

    # Title Banner
    story.append(Paragraph("EvidenceIQ.ai — Prototype Demo Video & Presentation Script", title_style))
    story.append(Paragraph("4-Minute Time-Coded Walkthrough, Screen Choreography & Spoken Voiceover Script", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#7C3AED"), spaceAfter=10))

    # Checklist & Recording Specs Table
    specs_data = [
        [
            Paragraph("Target Duration:", table_hdr_style),
            Paragraph("4:00 Minutes (240 Seconds)", table_cell_style),
            Paragraph("Screen URL:", table_hdr_style),
            Paragraph("http://localhost:3000", table_cell_style),
        ],
        [
            Paragraph("Video Resolution:", table_hdr_style),
            Paragraph("1080p (1920x1080) at 60 FPS", table_cell_style),
            Paragraph("Theme Mode:", table_hdr_style),
            Paragraph("Dark Glassmorphism UI", table_cell_style),
        ],
        [
            Paragraph("Audio Delivery:", table_hdr_style),
            Paragraph("135-145 wpm energetic pace", table_cell_style),
            Paragraph("Key Objective:", table_hdr_style),
            Paragraph("Demonstrate Round 2 Rubric & 8 Core Goals", table_cell_style),
        ],
    ]
    t_specs = Table(specs_data, colWidths=[1.3*inch, 2.2*inch, 1.3*inch, 2.2*inch])
    t_specs.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#4C1D95")),
        ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#4C1D95")),
        ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#F4F4F5")),
        ("BACKGROUND", (3, 0), (3, -1), colors.HexColor("#F4F4F5")),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(t_specs)
    story.append(Spacer(1, 10))

    # 6 Master Scenes Breakdown
    scenes = [
        {
            "title": "Scene 1: Hook & Executive Problem Statement",
            "time": "0:00 - 0:30 (30 Seconds)",
            "url": "http://localhost:3000/ (Executive Dashboard)",
            "actions": "Start on the Executive Dashboard. Glide cursor smoothly over Top KPI Cards (Total Revenue ₹3,373.1L, Severe Anomaly: North India, MTTI < 30s). Scroll down gently to showcase the 30-Day Revenue Trend Chart showing the steep precipice on August 15.",
            "script": "When a critical business metric collapses 68% overnight, enterprise teams are paralyzed. Analysts spend over four hours manually pivoting across data warehouses, Jira deployments, and support queues trying to find the cause—burning tens of thousands of dollars every hour in unrecovered revenue.\n\nWelcome to EvidenceIQ.ai, an enterprise-grade KPI intelligence-to-action engine built for the Accenture Innovation Challenge. EvidenceIQ.ai replaces hours of human guesswork with deterministic quasi-causal diagnosis in under two seconds—at zero marginal LLM cost."
        },
        {
            "title": "Scene 2: Live Anomaly Scanner & Two-Gate Materiality",
            "time": "0:30 - 1:15 (45 Seconds)",
            "url": "http://localhost:3000/scanner (Anomaly Scanner)",
            "actions": "Click 'Anomaly Scanner' in navbar. Point cursor to the Anomaly Heatmap Matrix (North India x Mobile App in glowing red with z = -2.01σ). Hover over the Two-Gate Materiality Badges (Statistical Significance & Financial Exposure >= ₹10,000). Click 'Investigate Anomaly'.",
            "script": "Let's see the engine in action. Our Anomaly Scanner runs rolling 21-day Gaussian baselines alongside sequential CUSUM change-point detectors to catch both flash-crashes and slow-bleed erosions.\n\nNotice here: on August 15, North India's mobile revenue plunged with a z-score of minus 2.01 sigma. Unlike noisy monitoring tools, our Two-Gate Materiality Engine validates both statistical significance AND business financial exposure before alerting. With over ₹7,000 Lakh at stake, this passes both gates. Let's trigger a full automated investigation."
        },
        {
            "title": "Scene 3: Driver Decomposition & Shapley Fair Attribution",
            "time": "1:15 - 2:00 (45 Seconds)",
            "url": "http://localhost:3000/investigation (Driver Decomposition Tab)",
            "actions": "Transition to Investigation panel. Click 'Driver Decomposition' tab. Highlight the Price-Volume-Mix (PVM) Waterfall chart (Volume vs Conversion). Scroll down to the Shapley Attribution Table showing exact credit shares (51.5% POS Hardware, 30.3% Regional Cluster, 17.1% Mobile Channel).",
            "script": "In under 50 milliseconds, our deterministic pipeline decomposes the financial movement. First, our Price-Volume-Mix waterfall proves that 78% of the loss was driven by transaction conversion failure rather than top-of-funnel traffic drops.\n\nNext, because multiple operational levers moved simultaneously, we execute game-theoretic Shapley value attribution. By evaluating all coalition subsets of features, the engine mathematically proves that 51.5% of the drop originated from POS register timeouts and 17.1% from the mobile app channel rollout—completely eliminating subjective cross-departmental debate."
        },
        {
            "title": "Scene 4: Relational Evidence Graph (2D & 3D WebGL Orbit)",
            "time": "2:00 - 2:45 (45 Seconds)",
            "url": "http://localhost:3000/graph (Evidence Graph)",
            "actions": "Click 'Evidence Graph' in navbar. In 2D view: show directed causal lines with relationship badges (PRECEDES, CORROBORATES, EXPLAINS, RESOLVES). Drag an Event node with mouse physics, click a node to open metadata sidebar. In 3D view: click '3D WebGL Orbit', rotate the 3D spherical constellation with mouse orbit controls.",
            "script": "To establish true causality, EvidenceIQ.ai constructs an interactive, relational Business Evidence Graph.\n\nIn our 2D view, we see typed causal edges: GitHub Release v5.4 PRECEDES the revenue drop, while two Zendesk customer support surges CORROBORATE payment timeout failures. We run automated Difference-in-Differences econometrics against unexposed regions to prove causal treatment effect.\n\nSwitching to our 3D WebGL Orbit view, operators can explore the complete knowledge topology in real-time space—visually tracing dependencies from cloud deployments to bottom-line financial impact."
        },
        {
            "title": "Scene 5: Dual-Persona Narration, Checkpoint & SHA-256 Audit",
            "time": "2:45 - 3:30 (45 Seconds)",
            "url": "http://localhost:3000/investigation (Narration & Recommendation Tabs)",
            "actions": "Click 'Grounded Narration' tab. Toggle between 'Executive Persona' and 'Analyst Persona'. Click 'Recommendation & Checkpoint', type brief justification ('Confirmed rollback of v5.4 after verifying support surge'), click 'Approve & Execute Rollback'. Highlight green badge and SHA-256 cryptographic hash.",
            "script": "Now comes synthesis and governance. Our Dual-Persona engine generates tailored briefings from the exact same locked evidence package: executive summaries for the CFO and granular telemetry for SREs. To eliminate hallucinations, an AST numeric diff validator verifies every cited number against our deterministic data.\n\nCrucially, we enforce fail-closed human governance. High-risk actions are blocked until authorized. When I enter my justification and approve this rollback, EvidenceIQ.ai cryptographically signs the decision with a SHA-256 hash into an append-only audit ledger—guaranteeing complete SOX, SOC-2, and GDPR compliance."
        },
        {
            "title": "Scene 6: Enterprise Connectors, Webhooks & Wrap-Up",
            "time": "3:30 - 4:00 (30 Seconds)",
            "url": "http://localhost:3000/connectors (Connectors Hub)",
            "actions": "Click 'Enterprise Connectors'. Click 'Test Snowflake Connection' (shows green 48.2ms latency). Point to live GitHub, Jira, and Zendesk Webhook Feed. Return to Dashboard or finish on Connectors Hub with closing statement.",
            "script": "EvidenceIQ.ai is built for enterprise scale: featuring native connectors for Snowflake, BigQuery, Databricks, and SAP HANA, real-time webhook ingestion for GitHub and Jira, and dynamic graph scaling to PostgreSQL and Neo4j.\n\nBy slashing Mean Time to Identify by 99.8% and saving over ₹1,935 Lakh per major incident, EvidenceIQ.ai delivers an astounding 14.8x first-year ROI.\n\nEvidenceIQ.ai: Deterministic truth, governed intelligence, instant action. Thank you."
        },
    ]

    for s in scenes:
        box = []
        box.append(Paragraph(s["title"], scene_hdr_style))
        box.append(Paragraph(f"Timeline: {s['time']} | Screen URL: {s['url']}", scene_meta_style))
        box.append(Paragraph(f"<b>Screen Choreography:</b> {s['actions']}", action_style))
        
        paragraphs = s["script"].split("\n\n")
        for p in paragraphs:
            box.append(Paragraph(f"<b>Spoken Script:</b> \"{p}\"", script_style))

        box.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E4E4E7"), spaceBefore=6, spaceAfter=8))
        story.append(KeepTogether(box))

    doc.build(story, canvasmaker=ScriptNumberedCanvas)
    print(f"[+] Demo Script PDF successfully generated at: {output_pdf_path}")
    print(f"[+] File Size: {os.path.getsize(output_pdf_path) / 1024:.2f} KB")


if __name__ == "__main__":
    pdf_path = os.path.join("docs", "EvidenceIQ_AI_Demo_Video_Presentation_Script.pdf")
    generate_demo_script_pdf(pdf_path)
