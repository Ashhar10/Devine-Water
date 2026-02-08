import pandas as pd
import numpy as np

excel_file = 'Doc/Water Data.xlsx'
xl = pd.ExcelFile(excel_file)

DAYS_MAP = {
    'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday',
    'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
}

def map_days(days_str):
    if pd.isna(days_str) or str(days_str).strip() == '':
        return '{}'
    if 'Daily' in str(days_str):
        return "ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']"
    
    parts = str(days_str).split(',')
    full_days = []
    for p in parts:
        p = p.strip()
        if p in DAYS_MAP:
            full_days.append(DAYS_MAP[p])
        else:
            # Try to match start of string
            for k, v in DAYS_MAP.items():
                if p.startswith(k):
                    full_days.append(v)
                    break
    if not full_days:
        return '{}'
    return "ARRAY[" + ", ".join([f"'{d}'" for d in full_days]) + "]"

def generate_sql_for_area(target_area):
    sql_blocks = []
    sql_blocks.append(f"-- =====================================================")
    sql_blocks.append(f"-- IMPORT DATA FOR AREA: {target_area}")
    sql_blocks.append(f"-- =====================================================")
    
    sql_blocks.append(f"""
DO $$
DECLARE
    v_area_id UUID;
    v_cust_id UUID;
    v_area_name TEXT := '{target_area}';
    v_area_code TEXT := '{target_area.upper().replace(" ", "_")}';
BEGIN
    -- Ensure area exists
    INSERT INTO areas (area_id, name)
    VALUES (v_area_code, v_area_name)
    ON CONFLICT (area_id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_area_id;
""")

    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name, header=None)
        # Find rows where Index 5 matches target_area
        for idx, row in df.iterrows():
            area_val = str(row[5]).strip() if pd.notna(row[5]) else ""
            if target_area.lower() in area_val.lower():
                cid = str(row[2]).strip() if pd.notna(row[2]) else f"CUST-{idx}"
                name = str(row[3]).strip().replace("'", "''") if pd.notna(row[3]) else "Unknown"
                days = map_days(row[4])
                req_bottles = int(row[6]) if pd.notna(row[6]) and str(row[6]).isdigit() else 1
                out_bottles = int(row[8]) if pd.notna(row[8]) and str(row[8]).isdigit() else 0
                opening_bal = float(row[10]) if pd.notna(row[10]) else 0
                phone = str(row[12]).strip() if pd.notna(row[12]) else ""
                email = f"{cid}@gmail.com"
                password = f"Devine@{cid}"
                
                # Check if phone is empty or has non-numeric garbage
                phone_sql = f"'{phone}'" if phone else "NULL"
                
                sql_blocks.append(f"""
    -- Customer: {name} ({cid})
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('{cid}', '{name}', '{email}', {phone_sql}, '{area_val}', v_area_id, {days}, {req_bottles}, {out_bottles}, {opening_bal}, {opening_bal})
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('{cid}', '{email}', '{password}', '{name}', 'customer', {phone_sql}, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;
""")

    sql_blocks.append("END $$;")
    return "\n".join(sql_blocks)

# Generate both
chishti_sql = generate_sql_for_area("Chishti Nagar")
mansoor_sql = generate_sql_for_area("Mansoor Nagar")

with open('chishti_nagar.sql', 'w', encoding='utf-8') as f:
    f.write(chishti_sql)

with open('mansoor_nagar.sql', 'w', encoding='utf-8') as f:
    f.write(mansoor_sql)

print("SQL files generated: chishti_nagar.sql, mansoor_nagar.sql")
