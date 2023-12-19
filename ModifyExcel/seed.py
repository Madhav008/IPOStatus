import os
import pandas as pd
from pymongo import MongoClient

# MongoDB connection details
mongo_uri = "mongodb://madhav:madhav@192.168.1.124:1404/?authMechanism=DEFAULT"
database_name = "ipostatus"
collection_name = "excels"

# Folder path containing CSV files
folder_path = "Files/"

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client[database_name]
collection = db[collection_name]

# Iterate through all files in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".csv"):
        csv_file_path = os.path.join(folder_path, filename)

        # Read CSV file into a Pandas DataFrame
        df = pd.read_csv(csv_file_path)

        # Convert DataFrame to a list of dictionaries (one dictionary per row)
        data = df.to_dict(orient='records')

        # Insert data into MongoDB collection
        collection.insert_many(data)

        print(f"CSV data from {csv_file_path} has been successfully inserted into MongoDB.")

        # Delete the CSV file after insertion
        os.remove(csv_file_path)
        print(f"{csv_file_path} has been deleted.")

# Close MongoDB connection
client.close()
