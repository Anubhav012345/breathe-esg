# 🌿 Breathe ESG — Emissions Data Platform

A full-stack prototype for ingesting, normalizing, and reviewing corporate emissions data across Scope 1, 2, and 3 sources — built for enterprise ESG reporting workflows.

> Built as part of a technical internship assignment for **Breathe ESG**.

---

## 🔗 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://breathe-esg-frontend-anubhav.onrender.com |
| **Backend API** | https://breathe-esg-backend-anubhav.onrender.com/api |
| **Admin Panel** | https://breathe-esg-backend-anubhav.onrender.com/admin |

**Demo Credentials:**
- Username: `analyst1`
- Password: `Test@1234`
- Organisation: `Acme Corp`

> ⚠️ Hosted on Render free tier — first request may take 50 seconds to wake up the server.

---

## 📋 What It Does

Enterprise clients generate emissions data from multiple disconnected sources — SAP exports, utility portal CSVs, and travel platform reports. This platform:

1. **Ingests** data from all three source types via file upload
2. **Normalizes** units, dates, and formats into a consistent schema
3. **Calculates** CO₂e using DEFRA 2023 / CEA India / ICAO emission factors
4. **Auto-flags** suspicious records (zero quantities, estimated distances, high values)
5. **Surfaces** a review dashboard where analysts approve or reject records
6. **Locks** approved records for audit — immutable once locked

---

## 🏗️ Architecture

breathe-esg/
├── accounts/        # Auth + multi-tenancy (Organisation + User models)
├── emissions/       # Core EmissionRecord model
├── ingestion/       # File upload + parsers for each source type
├── audit/           # Review workflow + dashboard stats API
├── config/          # Django settings + URLs
├── frontend/        # React app (Dashboard, Upload, Review pages)
├── sample_sap.csv          # Sample SAP fuel data
├── sample_utility.csv      # Sample electricity data
├── sample_travel.csv       # Sample travel data
├── MODEL.md         # Data model documentation
├── DECISIONS.md     # Every design decision explained
├── TRADEOFFS.md     # What was deliberately not built
└── SOURCES.md       # Real-world research on each data source

---

## 📊 Three Data Sources

### 1. 🏭 SAP — Fuel & Procurement (Scope 1)
- **Format**: CSV/XLSX flat file from SAP MB51 transaction (GUI export)
- **Why not IDoc/OData**: IDoc requires SAP Basis middleware. OData requires RFC configuration. Sustainability leads hand over GUI extracts in practice.
- **Handles**: German column headers (Menge, Buchungsdatum), mixed units (litres/gallons), plant codes, DD.MM.YYYY dates
- **Emission factor**: DEFRA 2023 — Diesel: 2.68 kg CO₂e/L, Petrol: 2.31, Natural Gas: 2.04

### 2. ⚡ Utility — Electricity (Scope 2)
- **Format**: CSV export from utility portal (TATA Power / MSEDCL / BSES style)
- **Why not PDF**: Every utility has a different PDF layout — fragile to parse. Portal CSV is always available.
- **Handles**: kWh and MWh units, billing periods not aligned to calendar months, multiple meters per facility
- **Emission factor**: CEA India Grid 2023 — 0.82 kg CO₂e/kWh

### 3. ✈️ Corporate Travel — Flights, Hotels, Ground (Scope 3)
- **Format**: CSV export from Concur/Navan expense platform
- **Why not API**: Concur OAuth requires per-client setup. CSV export is universally available.
- **Handles**: IATA airport codes with distance estimation via lookup table, hotel nights, ground transport km
- **Emission factors**: ICAO flights: 0.255 kg/km, Hotel: 31 kg/night, Ground: 0.21 kg/km (DEFRA)

---

## 🗄️ Data Model Highlights

```python
class EmissionRecord(models.Model):
    # Multi-tenancy
    organisation         # FK to Organisation — all queries scoped per client

    # Source tracking
    source_type          # sap / utility / travel
    source_file          # original filename
    source_row           # row number in original file
    ingested_by          # user who uploaded
    ingested_at          # timestamp

    # Scope classification
    scope                # scope1 / scope2 / scope3
    category             # diesel / electricity / flight / hotel / ground_transport

    # Raw values — never overwritten
    raw_quantity
    raw_unit

    # Normalized values
    normalized_quantity
    normalized_unit

    # Emissions calculation
    emission_factor
    emission_factor_source   # DEFRA 2023 / CEA India / ICAO
    co2e_kg

    # Review workflow
    status               # pending / flagged / approved / rejected
    flag_reason
    reviewed_by
    reviewed_at

    # Audit trail
    is_edited
    edit_note
    locked_for_audit     # immutable once True

    # Flexible metadata
    metadata             # JSONField — SAP doc numbers, meter IDs, employee names
```

---

## ✅ Review Workflow
Upload CSV/XLSX
↓
Parse & Normalize
(handle messy real-world formats — German headers, mixed units, missing distances)
↓
Auto-flag suspicious rows
(zero qty / negative values / high consumption / estimated distances)
↓
Analyst reviews in dashboard
Approve ✅ / Reject ✗ / Flag 🚩 with note
↓
Lock approved records for audit
(locked_for_audit = True → immutable via API)

---

## 🧪 Sample Data Files

Three sample CSV files included for testing:

| File | Source | Rows | Notes |
|------|--------|------|-------|
| `sample_sap.csv` | SAP MB51 export | 5 | Diesel, petrol, natural gas — 3 plants, mixed units (L and gal) |
| `sample_utility.csv` | Utility portal | 5 | Mixed kWh/MWh, non-calendar billing periods, 4 facilities |
| `sample_travel.csv` | Concur/Navan | 6 | Flights with/without distance, hotels, ground transport |

Upload all three from the **Upload Data** page to see the full pipeline in action.

---

## ⚖️ Deliberate Tradeoffs

| Not Built | Why | What It Would Take |
|-----------|-----|--------------------|
| Live SAP OData / Concur API pull | OAuth per client + Celery scheduler = 3x complexity for a prototype | Celery Beat + per-org credential vault + SAP RFC setup |
| Configurable emission factors per org | DEFRA/CEA defaults cover the prototype. Real clients have PPAs and supplier-specific factors | EmissionFactor model with org+category+year composite key + admin UI |
| PDF/Excel audit export | Time constraint — the data model fully supports it (locked_for_audit flag exists) | openpyxl or reportlab + export view (~4 hours of work) |

---

## 🚀 Running Locally

### Backend
```bash
git clone https://github.com/Anubhav012345/breathe-esg.git
cd breathe-esg

python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# Backend runs at http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm start
# Frontend runs at http://localhost:3000
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 6.0, Django REST Framework |
| Authentication | JWT via djangorestframework-simplejwt |
| Frontend | React 19, React Router v6 |
| Charts | Recharts |
| Data Parsing | pandas, openpyxl |
| Deployment | Render (backend Web Service + Static Site) |
| Database | SQLite (dev) — PostgreSQL ready for production |

---

## 📁 Documentation

| File | Contents |
|------|----------|
| [`MODEL.md`](./MODEL.md) | Data model design, multi-tenancy, unit normalization, audit trail |
| [`DECISIONS.md`](./DECISIONS.md) | Every ambiguity resolved + what I'd ask the PM |
| [`TRADEOFFS.md`](./TRADEOFFS.md) | Three things deliberately not built and why |
| [`SOURCES.md`](./SOURCES.md) | Real-world research on SAP, utility, and travel formats |

---

## 📧 Submission

- **GitHub**: https://github.com/Anubhav012345/breathe-esg
- **Frontend**: https://breathe-esg-frontend-anubhav.onrender.com
- **Backend**: https://breathe-esg-backend-anubhav.onrender.com

Shared with:
- saurav@breatheesg.com
- rahul@breatheesg.com  
- shivang@breatheesg.com

---

## 👤 Author

**Anubhav Srivastava**  
GitHub: [@Anubhav012345](https://github.com/Anubhav012345)
