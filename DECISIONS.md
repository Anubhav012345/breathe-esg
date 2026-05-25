# Decisions — Breathe ESG

## SAP: Flat File (CSV/XLSX) chosen over IDoc/OData
**Chosen**: CSV/XLSX flat file export from SAP GUI (MB51 transaction)
**Rationale**: Most enterprise clients hand over a GUI extract.
IDoc requires SAP Basis access and middleware. OData requires RFC configuration.
CSV/XLSX is what a sustainability lead actually has.
**What I'd ask the PM**: Do they have an SAP admin who can set up an OData feed,
or is this a manual export from a sustainability coordinator?

## Utility: Portal CSV export chosen over PDF or API
**Chosen**: CSV export from utility portal
**Rationale**: PDF parsing is fragile — each utility has different layouts.
Most Indian utilities (TATA, BSES, MSEDCL) offer CSV downloads from their portal.
APIs exist only for large enterprise accounts.
**What I'd ask**: Are there solar/DG generator assets? Those would be Scope 1, not Scope 2.

## Travel: CSV from Concur/Navan chosen over live API
**Chosen**: CSV export
**Rationale**: Concur API requires OAuth setup per client. CSV is always available.
**What I'd ask**: Do they have more than 500 employees traveling? If so, API pull is worth setting up.

## Emission Factors
Used DEFRA 2023 for fuels, CEA India 2023 for electricity, ICAO for flights.
Hardcoded per category — not per-client configurable yet.

## Distance Estimation for Flights
When airport codes given without distance, a lookup table covers common routes.
Unknown routes fall back to 2000km. This is flagged in flag_reason.

## SQLite for prototype
Used SQLite instead of PostgreSQL for zero-config local development.
Would switch to PostgreSQL in production (already supported by Django).