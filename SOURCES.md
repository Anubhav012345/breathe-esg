# Sources Research — Breathe ESG

## 1. SAP Fuel & Procurement

**Format researched**: SAP Material Document flat file export (MB51 transaction)
**What I learned**:
- German column headers in some SAP configurations (Menge=Quantity, Buchungsdatum=Posting Date)
- Units are SAP internal codes (L, GAL, KG, M3)
- Plant codes are 4-char alphanumeric, meaningless without a plant master lookup
- Dates in DD.MM.YYYY format (European)
- Movement type 201 = goods issue for cost center (consumption)

**Sample data rationale**: 5 rows covering diesel/petrol/natural gas across 3 plants,
mixing German column references, with mixed units (litres and gallons).

**What would break in real deployment**:
- Plant codes need a client-specific master data table to resolve to location names
- Some SAP systems export in codepage 1252 (Western European) — handled in parser
- Multi-currency procurement amounts not handled (we only care about quantity not spend)

## 2. Utility Electricity

**Format researched**: Portal CSV export from Indian utility portals (TATA Power, MSEDCL)
**What I learned**:
- Billing periods don't align to calendar months (e.g. 15 Jan to 14 Feb)
- Units can be kWh or MWh depending on meter type
- Large industrial consumers have separate KVA demand charges (irrelevant to emissions)
- Multiple meters per facility (HT and LT connections)

**Sample data rationale**: 5 rows across 4 facilities with mixed kWh/MWh units,
one billing period spanning 45 days (non-calendar-aligned).

**What would break in real deployment**:
- Renewable energy certificates (RECs) need separate handling for Scope 2 market-based method
- Transmission loss factors vary by state — not modeled here

## 3. Corporate Travel

**Format researched**: Concur Travel expense export (Concur Expense Connect CSV)
**What I learned**:
- Concur exports trip type, origin/destination, and cost — distance not always included
- Hotel stays are separate line items from flights
- IATA airport codes are used (not city names)
- Business vs economy class has different emission factors

**Sample data rationale**: 6 rows covering flights (with and without distance),
hotel stays, and ground transport. Includes international routes (DEL-LHR, DEL-JFK)
where distance estimation from airport codes is demonstrated.

**What would break in real deployment**:
- Layover flights need segment-by-segment calculation
- Hotel chains have vastly different emission intensities (5-star vs budget)
- Ground transport category is too broad (taxi vs train have very different factors)