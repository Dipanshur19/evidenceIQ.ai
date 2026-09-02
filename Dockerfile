# ==========================================
# Stage 1: Build React 18 + Vite Frontend
# ==========================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY evidenceiq-web/apps/web/package*.json ./
RUN npm ci

COPY evidenceiq-web/apps/web/ ./
RUN npm run build

# ==========================================
# Stage 2: Runtime Python + Node Environment
# ==========================================
FROM python:3.12-slim

# Install system dependencies & Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install Node API gateway dependencies
COPY evidenceiq-web/apps/api/package*.json ./evidenceiq-web/apps/api/
RUN cd evidenceiq-web/apps/api && npm ci --production

# Copy application source code
COPY app/ ./app/
COPY data/ ./data/
COPY docs/ ./docs/
COPY main.py ./
COPY evidenceiq-web/apps/api/ ./evidenceiq-web/apps/api/

# Copy built frontend assets from Stage 1 into web/dist
COPY --from=frontend-builder /app/frontend/dist ./evidenceiq-web/apps/web/dist

# Expose ports: 8000 (FastAPI), 3001 (Gateway + Frontend)
EXPOSE 8000 3001

# Start script running both FastAPI and Node Gateway concurrently
COPY scripts/start_production.sh ./start_production.sh
RUN chmod +x ./start_production.sh || true

ENV FASTAPI_URL="http://127.0.0.1:8000"
ENV PORT=3001
ENV EVIDENCEIQ_ENV=production

CMD ["sh", "-c", "python -m uvicorn main:app --host 127.0.0.1 --port 8000 & node evidenceiq-web/apps/api/src/index.js"]
