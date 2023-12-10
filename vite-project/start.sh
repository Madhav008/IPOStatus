!/bin/bash

#build the react app
npm run build

# Step 1: Build a Docker image
docker build -t IpoStatus-frontend .

docker rm -f IpoStaus-container  # Remove the existing container if it exists
docker run -d --name IpoStatus-container -p 5123:5125 IpoStatus-frontend  # Start a new container