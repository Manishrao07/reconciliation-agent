import re

def sanitize_csv_cell(value: str) -> str:
    """
    Sanitize untrusted CSV data by stripping leading =, +, -, @ to prevent CSV Injection 
    (also known as Formula Injection) when exporting to Excel/CSV.
    """
    if not value:
        return value
        
    value = str(value).lstrip(" \t\n\r")
    
    # Check for leading characters that trigger formula execution
    if re.match(r'^[=+\-@]', value):
        # Strip all leading formula triggers
        value = re.sub(r'^[=+\-@\s]+', '', value)
        
    return value
