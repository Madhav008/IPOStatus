import os

# Directory where the files are located
directory = "./"

# Prefix of the files to be removed
prefix = "screenshot"

# Get a list of files in the directory
files = os.listdir(directory)

# Iterate through the files and remove those with the specified prefix
for file in files:
    if file.startswith(prefix):
        file_path = os.path.join(directory, file)
        try:
            # Attempt to remove the file
            os.remove(file_path)
            print(f"File removed: {file}")
        except Exception as e:
            print(f"Error removing file {file}: {e}")
