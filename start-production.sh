# Build the docker image
docker build -t nextjs-boilerplate .

# Run the docker container
docker run -p 3000:3000 nextjs-boilerplate
