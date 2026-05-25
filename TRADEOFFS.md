# Tradeoffs — Breathe ESG

## 1. No real-time API pull from SAP/Concur
**Did not build**: Scheduled API ingestion from live SAP OData or Concur API
**Why**: OAuth credential management, per-client SAP configuration, and scheduled
job infrastructure (Celery + Redis) would triple deployment complexity.
File upload covers 80% of the real-world workflow for a prototype.
**What it would take**: Celery Beat, per-org credential vault, SAP RFC setup.

## 2. No configurable emission factors per client
**Did not build**: Admin UI to set custom emission factors per organisation
**Why**: DEFRA/CEA defaults cover the prototype. Real clients will have
location-specific grid factors (e.g. renewable PPAs) and supplier-specific factors.
**What it would take**: EmissionFactor model with org+category+year PK, factor versioning.

## 3. No audit export (PDF/Excel)
**Did not build**: Export locked records to formatted PDF or Excel for auditors
**Why**: Time constraint. The data model fully supports it (locked_for_audit flag exists).
A non-engineer auditor would want a download button, not just a UI table.
**What it would take**: openpyxl or reportlab, a simple export view, ~4 hours of work.