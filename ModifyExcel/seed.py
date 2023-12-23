import os
import pandas as pd
from pymongo import MongoClient
import concurrent.futures 
from concurrent.futures import ThreadPoolExecutor

# MongoDB connection details
mongo_uri = "mongodb://madhav:madhav@192.168.1.124:1404/?authMechanism=DEFAULT"
database_name = "ipostatus"
collection_name = "excels"

# Folder path containing CSV files
folder_path = "Files/"

# Function to insert data into MongoDB
def insert_into_mongodb(file_path):
    client = MongoClient(mongo_uri)
    db = client[database_name]
    collection = db[collection_name]

    try:
        # Read CSV file into a Pandas DataFrame
        df = pd.read_csv(file_path)

        # Convert DataFrame to a list of dictionaries (one dictionary per row)
        data = df.to_dict(orient='records')

        # Insert data into MongoDB collection
        collection.insert_many(data)

        print(f"CSV data from {file_path} has been successfully inserted into MongoDB.")
    except Exception as e:
        print(f"Error inserting data from {file_path} into MongoDB: {str(e)}")
    finally:
        # Close MongoDB connection
        client.close()

        # Delete the CSV file after insertion
        os.remove(file_path)
        print(f"{file_path} has been deleted.")

# Use ThreadPoolExecutor for parallel processing
with ThreadPoolExecutor(max_workers=8) as executor:
    # Submit each file processing task to the executor
    futures = []

    for filename in os.listdir(folder_path):
        if filename.endswith(".csv"):
            csv_file_path = os.path.join(folder_path, filename)
            futures.append(executor.submit(insert_into_mongodb, csv_file_path))

    # Wait for all tasks to complete
    concurrent.futures.wait(futures)
