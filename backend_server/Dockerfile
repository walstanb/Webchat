# Use an official Python runtime as the base image
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file to the container
COPY . .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install pymongo

# Copy the remaining application files to the container
RUN apt-get update

EXPOSE 5000

ENV MONGO_URL="mongodb://mongo:27017/chat"

# Set the command to start the application
CMD ["python", "main.py"]
