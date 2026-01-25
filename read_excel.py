import pandas as pd
import sys

try:
    excel_file = 'Doc/Divine water system workflow.xlsx'
    xl = pd.ExcelFile(excel_file)
    for sheet_name in xl.sheet_names:
        print(f"--- SHEET: {sheet_name} ---")
        df = xl.parse(sheet_name, header=None) # Read without header to catch everything
        
        # Iterate and print non-null values
        for idx, row in df.iterrows():
            row_vals = [str(x).strip() for x in row if pd.notna(x) and str(x).strip() != '']
            if row_vals:
                print(f"Row {idx}: {row_vals}")
        
        print("\n" + "="*50 + "\n")
except Exception as e:
    print(f"Error: {e}")
