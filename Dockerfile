# Use official Node.js image as the base
FROM node:20-bullseye

# Install system dependencies for pdf2pic
RUN apt-get update && \
    apt-get install -y graphicsmagick imagemagick && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package.json* yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Build the Next.js app
RUN npm run build

# Start the Next.js app
CMD ["npm", "start"]
