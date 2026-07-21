# Infrastructure & Security Strategy
## Project: Internal Business Intelligence Dashboard

### 1. Deployment Architecture
We will use a traditional VPS setup optimized for maximum cost savings.
- **Server:** Ubuntu 24.04 VPS (e.g., Hetzner, DigitalOcean)
- **Containerization:** Docker Compose will run 4 containers:
  1. Frontend (Next.js Node server)
  2. Backend (Fastify Node server)
  3. PostgreSQL (Database)
  4. Redis (Cache/Message Queue)
- **Reverse Proxy:** Nginx installed directly on Ubuntu to handle incoming traffic, static assets, and route `/api/*` to the Backend container.
- **SSL Certificates:** Let's Encrypt (Certbot) for Free automated HTTPS provisioning.

### 2. Security Design
- **Helmet:** Used on the backend to set strict HTTP security headers.
- **CORS:** Only frontend domain (e.g., `dashboard.adeaur.com`) can call to the backend.
- **Rate Limiting:** Protects the `/auth/login` endpoint against Brute Force attacks. Webhook endpoints will be whitelisted by Shopify/Delhivery IPs.
- **SQL Injection:** Prisma ORM automatically sanitizes and parameterizes all SQL queries.
- **Environment Secrets:** Passwords, API Keys, and DB URLs will only exist inside a `.env` file that is NEVER committed to Git.

### 3. Monitoring & Scaling Strategy
- **Monitoring:** We will integrate a free tier observability tool (like Sentry for backend error tracking, and PM2/Docker logs for process status).
- **Log Rotation:** Docker daemon JSON log rotation configured natively to ensure logs do not crash the server by filling the SSD.
- **Scaling:** Moving from 50 orders/day to 5,000 orders/day requires changing NOTHING in the code. We simply upgrade the VPS RAM/CPU in our hosting dashboard. 

### 4. Backup Strategy
- **Automated DB Dumps:** A simple Ubuntu Cronjob will run `pg_dump` every night at 3:00 AM IST.
- **Offsite Storage:** This compressed SQL file will be automatically pushed to an ultra-cheap storage bucket (e.g., AWS S3 or Backblaze B2) which costs less than $0.50/month.
