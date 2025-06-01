# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package.json* yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Runner stage
FROM node:22-slim AS runner

# Install system dependencies for pdf2pic
RUN apt-get update && \
    apt-get install -y graphicsmagick imagemagick && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
