# NicheValidator Backend Server Setup Guide
## Option B: Full Power Setup

---

## Prerequisites

- Python 3.10+ installed
- Docker & Docker Compose (optional but recommended)
- 4GB+ RAM recommended

---

## Quick Start (Docker - Recommended)

### Option 1: Docker Compose (Easiest)

```bash
# Navigate to server directory
cd /workspace/dropship-validator/server

# Build and run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

**Done!** Backend runs at `http://localhost:8000`

---

### Option 2: Docker Only

```bash
# Build image
docker build -t niche-validator-backend .

# Run container
docker run -p 8000:8000 \
  --name niche-validator-api \
  -e PYTHONUNBUFFERED=1 \
  niche-validator-backend
```

---

## Manual Setup (Without Docker)

### Step 1: Create Virtual Environment

```bash
# Navigate to project
cd /workspace/dropship-validator

# Create virtual environment
python -m venv venv

# Activate it
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Step 2: Install Dependencies

```bash
# Install from requirements.txt
pip install -r server/requirements.txt

# Install Playwright browsers (required for Crawl4AI)
playwright install chromium --with-deps
```

### Step 3: Configure Environment (Optional)

Create `.env` file in server directory:

```bash
# server/.env
PYTHONUNBUFFERED=1
HOST=0.0.0.0
PORT=8000

# Optional: OpenAI API for ScrapeGraphAI
# OPENAI_API_KEY=sk-your-key-here
```

### Step 4: Start the Server

```bash
# Navigate to server directory
cd server

# Run the server
python scraper_server.py
```

You should see:

```
╔═══════════════════════════════════════════════════════════╗
║         NicheValidator Backend Server v1.0.0             ║
╠═══════════════════════════════════════════════════════════╣
║  Tools:                                                  ║
║  • pytrends-modern  - Google Trends data                 ║
║  • Agent-Reach      - Social media scraping               ║
║  • ScrapeGraphAI    - AI-powered web scraping           ║
║  • Crawl4AI         - Fast web crawling                  ║
╚═══════════════════════════════════════════════════════════╝

🚀 Starting server at http://localhost:8000
```

---

## Testing the Server

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

### Full Niche Validation

```bash
curl http://localhost:8000/validate/wireless-charger
```

### Get Google Trends

```bash
curl http://localhost:8000/trends/fitness-tracker
```

### Get Social Media Data

```bash
curl http://localhost:8000/social/pet-supplies
```

### Scrape Products

```bash
curl "http://localhost:8000/scrape/kitchen?site=aliexpress"
```

---

## API Endpoints

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/` | GET | Server info | `curl http://localhost:8000/` |
| `/health` | GET | Health check | `curl http://localhost:8000/health` |
| `/validate/{niche}` | GET | Full validation | `curl http://localhost:8000/validate/wireless-charger` |
| `/trends/{keyword}` | GET | Google Trends | `curl http://localhost:8000/trends/fitness` |
| `/social/{keyword}` | GET | Social media | `curl http://localhost:8000/social/pet-supplies` |
| `/scrape/{keyword}` | GET | Product scrape | `curl "localhost:8000/scrape/kitchen?site=aliexpress"` |
| `/crawl` | GET | URL crawl | `curl "localhost:8000/crawl?url=https://example.com"` |

---

## Configure Frontend

After server is running, update frontend `.env`:

```bash
# /workspace/dropship-validator/.env
VITE_SCRAPER_SERVER_URL=http://localhost:8000
```

Then rebuild and redeploy:

```bash
cd /workspace/dropship-validator
pnpm build
```

---

## Deployment Options

### Deploy to Railway

1. Push code to GitHub
2. Connect to Railway (railway.app)
3. Set start command: `python server/scraper_server.py`
4. Add environment variables
5. Deploy!

### Deploy to Render

1. Create `render.yaml`:

```yaml
services:
  - type: web
    name: niche-validator-backend
    env: python
    buildCommand: pip install -r server/requirements.txt && playwright install chromium
    startCommand: python server/scraper_server.py
    envVars:
      - key: PORT
        value: 8000
```

2. Connect GitHub repo to Render
3. Deploy!

### Deploy to Fly.io

```bash
fly launch
fly deploy
```

### Deploy to Cloud Run (GCP)

```bash
gcloud run deploy niche-validator-backend \
  --source . \
  --port 8000 \
  --platform managed
```

---

## Troubleshooting

### "Module not found" errors

```bash
pip install -r server/requirements.txt
```

### "Playwright browser not found"

```bash
playwright install chromium --with-deps
```

### "Port 8000 already in use"

```bash
# Find and kill the process
lsof -i :8000
kill -9 <PID>
```

### Server won't start

Check Python version:
```bash
python --version  # Should be 3.10+
```

### CORS errors in browser

The server already has CORS enabled for all origins. If issues persist, check firewall settings.

---

## Data Flow

```
Frontend (React)
    ↓
VITE_SCRAPER_SERVER_URL → Backend (FastAPI)
    ↓
┌─────────────────────────────────────────┐
│  NicheValidatorServer                  │
├─────────────────────────────────────────┤
│  ├── PyTrendsModernCollector           │
│  │   └── Real Google Trends data      │
│  ├── AgentReachCollector              │
│  │   └── Reddit, Twitter, YouTube     │
│  ├── ScrapeGraphAICollector           │
│  │   └── AI-powered product scraping  │
│  └── Crawl4AiCollector               │
│      └── Fast web crawling            │
└─────────────────────────────────────────┘
    ↓
JSON Response → Frontend
```

---

## Cost

| Component | Cost |
|----------|------|
| Python tools (pytrends, etc.) | Free |
| ScrapeGraphAI | Free tier available |
| Agent-Reach | Free |
| Crawl4AI | Free |
| Server hosting | $0-5/month |
| **Total** | **$0-5/month** |

---

## Support

For issues, check:
1. Server logs in terminal
2. Browser console (Network tab)
3. CORS settings
4. Firewall settings

---

**Server URL after setup:** `http://localhost:8000`
