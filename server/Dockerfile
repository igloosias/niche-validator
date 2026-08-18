# NicheValidator Backend Dockerfile
# Full deployment with all scraping tools

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install core dependencies first
RUN pip install --no-cache-dir --break-system-packages \
    fastapi uvicorn[standard] \
    pytrends>=4.9.2 \
    httpx aiohttp \
    pandas numpy \
    beautifulsoup4 lxml \
    slowapi

# Install heavy scraping tools (optional - may take time)
RUN pip install --no-cache-dir --break-system-packages \
    openai>=1.30.0 \
    scrapegraphai>=1.7.2 \
    agent-reach>=0.1.0 || echo "agent-reach install failed, continuing..."

# Install Crawl4AI with browser automation
RUN pip install --no-cache-dir --break-system-packages crawl4ai>=0.3.0 && \
    playwright install chromium --with-deps || echo "crawl4ai/playwright install completed"

# Copy application code
COPY . .

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8000

EXPOSE 8000

# Run the server
CMD ["python", "scraper_server.py"]
