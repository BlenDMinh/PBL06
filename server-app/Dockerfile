FROM python:3.11.10-slim

USER root

# Install dos2unix
RUN apt-get update && apt-get install dos2unix

# Install wget
RUN apt-get update && \
apt-get install -y wget && \
apt-get clean && \
rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install the Python dependencies
RUN pip install -r requirements.txt

# Copy the application code to the working directory
COPY . .

# Expose the port on which the application will run
EXPOSE 8000

# Run the FastAPI application using uvicorn server
RUN dos2unix /app/run.sh
RUN chmod +x /app/run.sh
ENTRYPOINT [ "/app/run.sh" ]
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
