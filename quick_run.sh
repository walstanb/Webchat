#!/bin/bash

# Install backend dependencies
cd backend_server
pip install -r requirements.txt

# Start the backend server
python3 main.py &
echo "Backend server started."

# Install frontend dependencies
cd ../client
yarn

# Start the frontend development server
yarn start
