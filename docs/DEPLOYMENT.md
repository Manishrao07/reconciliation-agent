# Deployment Guide

This guide covers the instructions for deploying the **Autonomous Finance Reconciliation Agent** into a production or staging cloud environment (such as AWS EC2, DigitalOcean Droplet, or any Ubuntu-based VPS).

## Prerequisites
- A cloud instance (e.g., AWS EC2 Ubuntu 22.04 LTS)
- Port `8000` (API) and `8501` (UI) open in your Security Group / Firewall.
- SSH access to the instance.

## Option 1: 1-Click Deployment Script (Recommended)

We have provided a deployment script that will automatically update your server, install Docker, and launch the application.

1. **Upload the code to your server:**
   ```bash
   git clone <your-repo-url>
   cd autonomous-finance-reconciliation-agent
   ```

2. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Configure your API Key:**
   The script will create a `.env` file for you if it doesn't exist. To enable the LLM:
   ```bash
   nano .env
   # Add your GEMINI_API_KEY=...
   docker-compose restart api
   ```

## Option 2: Manual Kubernetes (K8s) Deployment

If your organization prefers Kubernetes, you can convert the `docker-compose.yml` into Kubernetes manifests using [Kompose](https://kompose.io/):

```bash
kompose convert -f docker-compose.yml
kubectl apply -f .
```

## Security Best Practices
- **Reverse Proxy**: In a real-world scenario, you should not expose ports 8000 and 8501 directly. Use Nginx or Traefik as a reverse proxy, and terminate SSL using Let's Encrypt.
- **Database Backups**: Use managed PostgreSQL (like AWS RDS) for production data durability instead of the local Docker volume.

## Phase 9: Monitoring (Prometheus & Grafana)
To monitor the system's performance, API latencies, and match rates, you can uncomment or add Prometheus to your docker-compose file. The FastAPI application exposes default metrics that can be scraped via a `/metrics` endpoint.
