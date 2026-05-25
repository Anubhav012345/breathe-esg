import pandas as pd
import io
from datetime import datetime, date
from typing import List, Dict, Any

EMISSION_FACTORS = {
    'diesel': 2.68,
    'petrol': 2.31,
    'natural_gas': 2.04,
    'electricity_kwh': 0.82,
    'flight_km': 0.255,
    'hotel_night': 31.0,
    'ground_km': 0.21,
}

UNIT_TO_LITRE = {
    'l': 1.0, 'litre': 1.0, 'litres': 1.0, 'liter': 1.0, 'liters': 1.0,
    'gal': 3.785, 'gallon': 3.785, 'gallons': 3.785,
}

UNIT_TO_KWH = {
    'kwh': 1.0, 'mwh': 1000.0, 'gwh': 1000000.0,
}

AIRPORT_DISTANCES = {
    ('DEL', 'BOM'): 1148, ('BOM', 'DEL'): 1148,
    ('DEL', 'BLR'): 1740, ('BLR', 'DEL'): 1740,
    ('DEL', 'LHR'): 6715, ('LHR', 'DEL'): 6715,
    ('BOM', 'DXB'): 1928, ('DXB', 'BOM'): 1928,
    ('DEL', 'JFK'): 11760, ('JFK', 'DEL'): 11760,
    ('LHR', 'JFK'): 5540, ('JFK', 'LHR'): 5540,
}

SAP_COLUMN_MAP = {
    'material': 'material', 'plant': 'plant', 'werk': 'plant',
    'quantity': 'quantity', 'menge': 'quantity',
    'unit': 'unit', 'mengeneinheit': 'unit', 'uom': 'unit', 'me': 'unit',
    'posting_date': 'date', 'buchungsdatum': 'date', 'date': 'date', 'datum': 'date',
    'document_number': 'doc_number', 'belegnummer': 'doc_number',
    'description': 'description', 'bezeichnung': 'description', 'text': 'description',
}

UTILITY_COLUMN_MAP = {
    'meter_id': 'meter_id', 'meterid': 'meter_id', 'account_number': 'meter_id',
    'billing_period_start': 'period_start', 'start_date': 'period_start', 'from': 'period_start',
    'billing_period_end': 'period_end', 'end_date': 'period_end', 'to': 'period_end',
    'consumption': 'quantity', 'usage': 'quantity', 'kwh': 'quantity', 'units': 'quantity',
    'unit': 'unit', 'uom': 'unit',
    'location': 'location', 'facility': 'location', 'site': 'location',
    'tariff': 'tariff', 'rate': 'tariff',
}

TRAVEL_COLUMN_MAP = {
    'trip_type': 'trip_type', 'type': 'trip_type', 'category': 'trip_type',
    'origin': 'origin', 'from': 'origin', 'departure': 'origin',
    'destination': 'destination', 'to': 'destination', 'arrival': 'destination',
    'travel_date': 'date', 'date': 'date', 'departure_date': 'date',
    'distance_km': 'distance_km', 'distance': 'distance_km',
    'nights': 'nights', 'hotel_nights': 'nights',
    'employee': 'employee', 'traveler': 'employee', 'traveller': 'employee',
}

def parse_date_flexible(val):
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    val = str(val).strip()
    for fmt in ['%Y-%m-%d', '%d.%m.%Y', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y', '%Y%m%d']:
        try:
            return datetime.strptime(val, fmt).date()
        except ValueError:
            continue
    return date.today()

def read_file(file_obj, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    if ext in ('xlsx', 'xls'):
        return pd.read_excel(file_obj, dtype=str)
    content = file_obj.read()
    for enc in ['utf-8', 'latin-1', 'cp1252']:
        try:
            return pd.read_csv(io.BytesIO(content), dtype=str, encoding=enc, sep=None, engine='python')
        except Exception:
            continue
    raise ValueError("Could not read file")

def normalize_columns(df, col_map):
    mapping = {}
    for col in df.columns:
        key = col.lower().strip().replace(' ', '_').replace('-', '_')
        if key in col_map:
            mapping[col] = col_map[key]
    return df.rename(columns=mapping)

def parse_sap(file_obj, filename):
    df = read_file(file_obj, filename)
    df = normalize_columns(df, SAP_COLUMN_MAP)
    df.columns = [c.lower().strip() for c in df.columns]
    records = []
    for idx, row in df.iterrows():
        try:
            qty = float(str(row.get('quantity', '0')).replace(',', '.').strip() or '0')
            unit = str(row.get('unit', 'l')).strip().lower()
            period = parse_date_flexible(row.get('date', ''))
            desc = str(row.get('description', row.get('material', ''))).lower()
            plant = str(row.get('plant', '')).strip()
            doc_no = str(row.get('doc_number', '')).strip()

            fuel_type = 'diesel'
            for kw in ['petrol', 'gasoline', 'benzin', 'natural_gas', 'erdgas', 'diesel']:
                if kw in desc:
                    fuel_type = kw
                    break

            factor = UNIT_TO_LITRE.get(unit, 1.0)
            qty_litres = qty * factor
            ef = EMISSION_FACTORS.get(fuel_type, EMISSION_FACTORS['diesel'])
            co2e = qty_litres * ef

            flags = []
            if qty <= 0: flags.append('Zero or negative quantity')
            if qty_litres > 100000: flags.append('Unusually high quantity')

            records.append({
                'scope': 'scope1', 'category': fuel_type,
                'raw_quantity': qty, 'raw_unit': unit,
                'normalized_quantity': qty_litres, 'normalized_unit': 'litres',
                'period_start': period, 'period_end': period,
                'location': plant, 'emission_factor': ef,
                'emission_factor_source': 'DEFRA 2023',
                'co2e_kg': co2e,
                'status': 'flagged' if flags else 'pending',
                'flag_reason': '; '.join(flags),
                'metadata': {'doc_number': doc_no, 'description': desc[:200]},
                'source_row': idx + 2,
            })
        except Exception as e:
            records.append({
                'scope': 'scope1', 'category': 'unknown',
                'raw_quantity': 0, 'raw_unit': '', 'normalized_quantity': 0,
                'normalized_unit': 'litres', 'period_start': date.today(),
                'period_end': date.today(), 'location': '', 'co2e_kg': 0,
                'status': 'flagged', 'flag_reason': f'Parse error: {e}',
                'metadata': {}, 'source_row': idx + 2,
            })
    return records

def parse_utility(file_obj, filename):
    df = read_file(file_obj, filename)
    df = normalize_columns(df, UTILITY_COLUMN_MAP)
    records = []
    for idx, row in df.iterrows():
        try:
            qty = float(str(row.get('quantity', '0')).replace(',', '').strip() or '0')
            unit = str(row.get('unit', 'kWh')).strip()
            period_start = parse_date_flexible(row.get('period_start', date.today()))
            period_end = parse_date_flexible(row.get('period_end', period_start))
            location = str(row.get('location', '')).strip()
            meter_id = str(row.get('meter_id', '')).strip()
            tariff = str(row.get('tariff', '')).strip()

            factor = UNIT_TO_KWH.get(unit.lower(), UNIT_TO_KWH.get(unit, 1.0))
            qty_kwh = qty * factor
            ef = EMISSION_FACTORS['electricity_kwh']
            co2e = qty_kwh * ef

            flags = []
            if qty <= 0: flags.append('Zero or negative consumption')
            if qty_kwh > 500000: flags.append('Very high consumption - verify meter')

            records.append({
                'scope': 'scope2', 'category': 'electricity',
                'raw_quantity': qty, 'raw_unit': unit,
                'normalized_quantity': qty_kwh, 'normalized_unit': 'kWh',
                'period_start': period_start, 'period_end': period_end,
                'location': location, 'emission_factor': ef,
                'emission_factor_source': 'CEA India Grid 2023',
                'co2e_kg': co2e,
                'status': 'flagged' if flags else 'pending',
                'flag_reason': '; '.join(flags),
                'metadata': {'meter_id': meter_id, 'tariff': tariff},
                'source_row': idx + 2,
            })
        except Exception as e:
            records.append({
                'scope': 'scope2', 'category': 'electricity',
                'raw_quantity': 0, 'raw_unit': 'kWh', 'normalized_quantity': 0,
                'normalized_unit': 'kWh', 'period_start': date.today(),
                'period_end': date.today(), 'location': '', 'co2e_kg': 0,
                'status': 'flagged', 'flag_reason': f'Parse error: {e}',
                'metadata': {}, 'source_row': idx + 2,
            })
    return records

def parse_travel(file_obj, filename):
    df = read_file(file_obj, filename)
    df = normalize_columns(df, TRAVEL_COLUMN_MAP)
    records = []
    for idx, row in df.iterrows():
        try:
            trip_type = str(row.get('trip_type', 'flight')).lower().strip()
            trip_date = parse_date_flexible(row.get('date', date.today()))
            employee = str(row.get('employee', '')).strip()
            origin = str(row.get('origin', '')).strip()
            dest = str(row.get('destination', '')).strip()

            if 'hotel' in trip_type or 'accommodation' in trip_type:
                nights = float(str(row.get('nights', '1')).strip() or '1')
                ef = EMISSION_FACTORS['hotel_night']
                co2e = nights * ef
                qty, unit, norm_qty, norm_unit = nights, 'nights', nights, 'nights'
                category = 'hotel'
                flags = []
            elif any(x in trip_type for x in ['ground', 'taxi', 'car', 'train', 'bus']):
                dist = float(str(row.get('distance_km', '50')).strip() or '50')
                ef = EMISSION_FACTORS['ground_km']
                co2e = dist * ef
                qty, unit, norm_qty, norm_unit = dist, 'km', dist, 'km'
                category = 'ground_transport'
                flags = []
            else:
                dist_raw = str(row.get('distance_km', '')).strip()
                if dist_raw and dist_raw not in ('', 'nan', 'None'):
                    dist = float(dist_raw)
                    flags = []
                else:
                    key = (origin.upper()[:3], dest.upper()[:3])
                    dist = AIRPORT_DISTANCES.get(key, 2000.0)
                    flags = ['Distance estimated from airport codes']
                ef = EMISSION_FACTORS['flight_km']
                co2e = dist * ef
                qty, unit, norm_qty, norm_unit = dist, 'km', dist, 'km'
                category = 'flight'

            records.append({
                'scope': 'scope3', 'category': category,
                'raw_quantity': qty, 'raw_unit': unit,
                'normalized_quantity': norm_qty, 'normalized_unit': norm_unit,
                'period_start': trip_date, 'period_end': trip_date,
                'location': f"{origin} -> {dest}",
                'emission_factor': ef,
                'emission_factor_source': 'DEFRA 2023 / ICAO',
                'co2e_kg': co2e,
                'status': 'flagged' if flags else 'pending',
                'flag_reason': '; '.join(flags),
                'metadata': {'employee': employee},
                'source_row': idx + 2,
            })
        except Exception as e:
            records.append({
                'scope': 'scope3', 'category': 'travel',
                'raw_quantity': 0, 'raw_unit': '', 'normalized_quantity': 0,
                'normalized_unit': 'km', 'period_start': date.today(),
                'period_end': date.today(), 'location': '', 'co2e_kg': 0,
                'status': 'flagged', 'flag_reason': f'Parse error: {e}',
                'metadata': {}, 'source_row': idx + 2,
            })
    return records