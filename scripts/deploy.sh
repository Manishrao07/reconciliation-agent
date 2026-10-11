#!/bin/bash

# Autonomous Finance Reconciliation Agent - Deployment Script
# This script sets up the required dependencies and deploys the application on an Ubuntu-based server (like AWS EC2).

set -e

echo "================================================================"
echo "🚀 Starting Deployment: Autonomous Finance Reconciliation Agent"
echo "================================================================"

# 1. Update packages
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker & Docker Compose if not installed
echo "[2/5] Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo "Docker is already installed."
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose is already installed."
fi

# 3. Setup Environment Variables
echo "[3/5] Setting up environment variables..."
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  WARNING: Please edit the .env file to add your actual GEMINI_API_KEY before starting!"
else
    echo ".env file already exists."
fi

# 4. Build and Start the Application
echo "[4/5] Building and starting Docker containers..."
sudo docker-compose down
sudo docker-compose build
sudo docker-compose up -d

# 5. Initialize the Database and Seed Data
echo "[5/5] Initializing Database and Seeding Data..."
echo "Waiting 10 seconds for PostgreSQL to be fully ready..."
sleep 10
sudo docker-compose exec -T api python db/seed.py

echo "================================================================"
echo "✅ Deployment Successful!"
echo "================================================================"
echo "API is running at: http://<your-server-ip>:8000"
echo "UI is running at:  http://<your-server-ip>:8501"
echo ""
echo "Note: If you haven't added your Gemini API Key, the system will gracefully fall back to 'mock' mode."
echo "================================================================"
