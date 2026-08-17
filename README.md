# NicheValidator - AI-Powered Niche Validation Tool

**Live Demo:** https://ngmq3d8mq6tz.space.mcode.io

---

## Quick Start

### Frontend Only (Current)
The deployed web app is ready to use at the URL above.

### Full Power Setup (Option B)

For real Google Trends, social media scraping, and AI-powered scraping:

```bash
# 1. Setup Backend
cd server
chmod +x start.sh
./start.sh

# 2. Configure Frontend
# Edit .env:
VITE_SCRAPER_SERVER_URL=http://localhost:8000

# 3. Rebuild Frontend
cd ..
pnpm build

# 4. Deploy
# Redeploy frontend with new backend connection
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NicheValidator                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐         ┌─────────────────────────────┐   │
│  │  Frontend   │  ←────  │  Backend Server             │   │
│  │  (React)    │         │  (FastAPI + Python)          │   │
│  └─────────────┘         └─────────────────────────────┘   │
│         │                           │                        │
│         │                           │                        │
│         ▼                           ▼                        │
│  ┌─────────────┐         ┌─────────────────────────────┐   │
│  │  Firecrawl  │         │  Python Scraping Tools       │   │
│  │  API        │         │  • pytrends-modern          │   │
│  │  (Active)   │         │  • Agent-Reach              │   │
│  └─────────────┘         │  • ScrapeGraphAI             │   │
│         │                │  • Crawl4AI                  │   │
│         │                └─────────────────────────────┘   │
│         │                           │                        │
│         ▼                           ▼                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Data Sources                               │   │
│  │  • Google Trends        • Reddit                    │   │
│  │  • AliExpress           • Twitter                   │   │
│  │  • Amazon              • YouTube                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
dropship-validator/
├── src/                          # Frontend (React + TypeScript)
│   ├── lib/
│   │   ├── collectors/           # Data collection modules
│   │   │   ├── trendsCollector.ts
│   │   │   ├── youtubeCollector.ts
│   │   │   ├── redditCollector.ts
│   │   │   ├── aliexpressCollector.ts
│   │   │   ├── firecrawlCollector.ts
│   │   │   ├── scrapegraphaiCollector.ts
│   │   │   ├── agentreachCollector.ts
│   │   │   ├── pytrendsCollector.ts
│   │   │   └── crawl4aiCollector.ts
│   │   ├── nicheValidator.ts     # Niche validation engine
│   │   ├── productValidator.ts   # Product scoring
│   │   └── dataCollector.ts      # Main data orchestrator
│   └── App.tsx                   # Main React component
├── server/                        # Backend (Python)
│   ├── scraper_server.py         # Main FastAPI server
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                 # Docker configuration
│   ├── docker-compose.yml         # Docker Compose
│   ├── start.sh                   # Quick start script
│   └── SETUP_GUIDE.md            # Detailed setup guide
├── docs/                          # Documentation
│   ├── API_SETUP_GUIDE.md        # API credentials guide
│   ├── SPEC.md                   # Technical specification
│   └── SCRAPER_TOOLS_GUIDE.md   # GitHub scraper tools
├── .env                           # Environment variables
└── package.json                   # Node.js dependencies
```

---

## Data Collection Tools

| Tool | Purpose | Status | GitHub |
|------|---------|--------|--------|
| **Firecrawl** | Web scraping | ✅ Active | firecrawl/firecrawl |
| **pytrends-modern** | Google Trends | 🔧 Setup | topics/pytrends-modern |
| **Agent-Reach** | Social media | 🔧 Setup | Panniantong/Agent-Reach |
| **ScrapeGraphAI** | AI scraping | 🔧 Setup | ScrapeGraphAI/Scrapegraph-ai |
| **Crawl4AI** | Fast crawling | 🔧 Setup | unclecode/crawl4ai |

---

## API Endpoints (Backend)

When backend is running at `http://localhost:8000`:

| Endpoint | Description |
|----------|-------------|
| `GET /` | Server info |
| `GET /health` | Health check |
| `GET /validate/{niche}` | Full niche validation |
| `GET /trends/{keyword}` | Google Trends data |
| `GET /social/{keyword}` | Social media analysis |
| `GET /scrape/{keyword}` | Product scraping |
| `GET /crawl?url=...` | URL crawling |

---

## Deployment

### Frontend (Current)
Already deployed at: https://ngmq3d8mq6tz.space.mcode.io

### Backend Deployment Options

**Railway (Recommended - Free Tier)**
```bash
# Connect GitHub repo to Railway
# Set start command: python server/scraper_server.py
```

**Render**
```yaml
# render.yaml
services:
  - type: web
    name: niche-validator-backend
    env: python
    buildCommand: pip install -r server/requirements.txt
    startCommand: python server/scraper_server.py
```

**Docker**
```bash
cd server
docker-compose up -d
```

---

## License

MIT License - Free to use and modify

---

**Built with ❤️ for dropshippers**
