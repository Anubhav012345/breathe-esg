# Data Model — Breathe ESG

## Core Design Decisions

### Multi-Tenancy
Every EmissionRecord and IngestionBatch is scoped to an Organisation FK.
All querysets filter by request.user.organisation. No record leaks between clients.

### Scope 1/2/3 Classification
- **Scope 1**: SAP fuel consumption (diesel, petrol, natural gas) — direct combustion
- **Scope 2**: Utility electricity — using CEA India grid factor (0.82 kg CO2e/kWh)
- **Scope 3**: Corporate travel — flights (ICAO), hotels (industry avg), ground transport

### Source-of-Truth Tracking
Each EmissionRecord stores:
- source_type: which pipeline produced it (sap/utility/travel)
- source_file: original filename
- source_row: original row number in the file
- ingested_at, ingested_by: timestamp and user
- is_edited, edit_note: mutation tracking

### Unit Normalization
Raw units are preserved (raw_quantity, raw_unit).
Normalized values stored separately (normalized_quantity, normalized_unit).
SAP → litres, Utility → kWh, Travel → km or nights.
CO2e always in kg.

### Audit Trail
- reviewed_by, reviewed_at: who approved/rejected and when
- locked_for_audit: once True, record is immutable via API
- is_edited + edit_note: analyst corrections are logged

### Metadata JSONField
Stores source-specific fields (SAP doc numbers, meter IDs, employee names)
without requiring schema migrations for every new client configuration.