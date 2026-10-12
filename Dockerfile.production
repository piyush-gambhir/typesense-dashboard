# Dockerfile.production
FROM node:24.21.0-alpine

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@12.11.2 --activate

# Set the working directory inside the container
WORKDIR /app

# Copy package.json, pnpm-lock.yaml and pnpm-workspace.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["pnpm", "start"]
