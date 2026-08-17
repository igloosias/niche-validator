# Minimal Dockerfile for Railway
FROM python:3.11-slim

WORKDIR /app

# Install minimal dependencies first
COPY requirements.txt .
RUN pip install --no-cache-dir --break-system-packages fastapi uvicorn pytrends pandas aiohttp beautifulsoup4 lxml

# Copy application
COPY . .

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["python", "scraper_server.py"]
