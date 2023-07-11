# Use an official Node.js runtime as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the remaining application files to the container
COPY . .

RUN npm install -g serve

# Build the React app
RUN npm run build

ENV REACT_APP_LOCALHOST_KEY="chat-app-current-user"

ENV REACT_APP_API_URL="http://localhost:5000"

# Expose the port that the application will listen on
EXPOSE 3000

# Set the command to start the application
CMD ["serve", "-s", "build"]
