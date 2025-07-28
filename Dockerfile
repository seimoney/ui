FROM node:20

# Set the working directory inside the container
WORKDIR /app

RUN npm install -g pnpm

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install project dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# # Build the Vue application for production
# RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3002

# Command to run the application using a simple HTTP server (like serve)
# You might need to install 'serve' globally in the Dockerfile or use a more robust web server like Nginx
CMD ["pnpm", "preview"]
