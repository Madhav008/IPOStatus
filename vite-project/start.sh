!/bin/bash

#build the react app
npm run build

# Step 1: Build a Docker image
docker build -t ipostatus-frontend .

docker rm -f ipostaus-container  # Remove the existing container if it exists
docker run -d --name ipostatus-container -p 5123:5125 ipostatus-frontend  # Start a new container