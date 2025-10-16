# --- STAGE 1: Build the Application ---
FROM node:20-slim AS builder

WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install development dependencies, including TypeScript and any build tools
RUN npm install

# Copy source code
COPY . .

# Run the TypeScript compilation (assuming you have a 'build' script in package.json)
# This will create your compiled JavaScript files (e.g., in a 'dist' folder)
RUN npm run build 

# --- STAGE 2: Run the Application (Leaner Production Image) ---
FROM node:20-slim

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the compiled output from the builder stage
# Assuming your 'build' script outputs compiled files to a 'dist' directory
COPY --from=builder /app/dist ./dist 

# Your server uses port 9001 (based on process.env.PORT || 9001)
EXPOSE 9001

# Define the command to start the application using the compiled code
# Assuming your final entry file is at 'dist/index.js'
CMD ["node", "dist/index.js"]