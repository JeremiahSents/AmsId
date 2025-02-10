# Use a more stable Node version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Expose port 3000
EXPOSE 3000

# Set host environment variable
ENV VITE_HOST=0.0.0.0

# Use development command with host flag
CMD ["npm", "run", "dev", "--", "--host"] 
#  The Dockerfile is pretty straightforward. It uses the  node:18-alpine  image as a base image, sets the working directory to  /app , copies the package files, installs the dependencies, copies the rest of the code, exposes port 3000, sets the host environment variable, and runs the development command with the host flag. 
#  Now, let’s create a  docker-compose.yml  file in the root directory of the project. 
#  version: '3.8'