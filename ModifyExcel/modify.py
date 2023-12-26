import pandas as pd
import os
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor

def process_chunk(chunk, output_folder, sheet_name, company_name_value, counter):
    chunk['Company_Name'] = company_name_value
    csv_file_path = os.path.join(output_folder, f"{sheet_name}_{counter}.csv")
    chunk.to_csv(csv_file_path, index=False)
    print(f"Sheet '{sheet_name}' saved as CSV: {csv_file_path}")

def split_excel_to_csv(file_path, output_folder, company_name_value, chunk_size=10000):
    df = pd.read_excel(file_path, sheet_name=None)

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = []

        for sheet_name, sheet_data in df.items():
            counter = 1
            for i in range(0, len(sheet_data), chunk_size):
                chunk = sheet_data.iloc[i:i + chunk_size]
                futures.append(executor.submit(process_chunk, chunk, output_folder, sheet_name, company_name_value, counter))
                counter += 1

        # Wait for all tasks to complete
        concurrent.futures.wait(futures)

def process_all_excel_files(path, output_folder, company_name_value):
    for filename in os.listdir(path):
        if filename.endswith(".xlsx"):
            file_path = os.path.join(path, filename)
            os.makedirs(output_folder, exist_ok=True)
            split_excel_to_csv(file_path, output_folder, company_name_value)

# Specify the path to the directory containing Excel files, the output folder for CSV files, and the Company_Name value
input_excel_path = "C:/Users/madha/Downloads/Compressed/CREDO_ALTREJ"
output_folder = "Files"
company_name_value = "CREDO"

# Call the function to process all Excel files in the specified path
process_all_excel_files(input_excel_path, output_folder, company_name_value)
