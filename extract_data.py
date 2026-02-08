import pandas as pd

excel_file = 'Doc/Water Data.xlsx'
try:
    xl = pd.ExcelFile(excel_file)
    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name, header=None)
        # Search for Chishti Nagar and Mansoor Nagar in any column
        for term in ['Chishti Nagar', 'Mansoor Nagar']:
            print(f"--- Searching for '{term}' in '{sheet_name}' ---")
            matches = df[df.apply(lambda row: row.astype(str).str.contains(term, case=False).any(), axis=1)]
            for idx, row in matches.iterrows():
                print(f"Row {idx}: {row.tolist()}")
except Exception as e:
    print(f"Error: {e}")
