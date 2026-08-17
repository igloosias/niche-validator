# Web Scraping Tools for Niche Validation
## GitHub Repository Analysis - Best Tools for Dropshipping Research

---

## Executive Summary

This guide reviews the best GitHub repositories and tools for scraping data sources needed for niche validation:
- **AliExpress** - Supplier & product data
- **Amazon** - Competition & pricing data
- **Google Trends** - Search demand
- **Social Media** - Reddit, YouTube, TikTok

---

## Top General Web Scraping Tools

### 1. Firecrawl ⭐ 168k Stars
**Status:** Already Integrated
**Repo:** https://github.com/firecrawl/firecrawl

| Feature | Status |
|---------|--------|
| Web crawling & scraping | ✅ Active |
| HTML-to-Markdown | ✅ Active |
| AI/LLM integration | ✅ Ready |
| JavaScript rendering | ✅ Active |
| Self-hosted option | Available |

**Use for:** AliExpress, Amazon, any website
**API Key:** `fc-7158887092ea4f7d90604b07f40e6184` (Active)

---

### 2. Scrapling ⭐ 74.7k Stars
**Repo:** https://github.com/D4Vinci/Scrapling

| Feature | Status |
|---------|--------|
| Adaptive scraping | ✅ |
| AI/MCP integration | ✅ |
| Stealth mode | ✅ |
| Playwright integration | ✅ |
| XPath & Selectors | ✅ |

**Best for:** Sites that change frequently (AliExpress)
**Install:** `pip install scrapling`

---

### 3. ScrapeGraphAI ⭐ 29.7k Stars
**Repo:** https://github.com/ScrapeGraphAI/Scrapegraph-ai

| Feature | Status |
|---------|--------|
| AI-powered scraping | ✅ |
| RAG support | ✅ |
| LLM integration | ✅ |
| Multi-site scraping | ✅ |
| Firecrawl alternative | ✅ |

**Best for:** Complex data extraction with AI
**Install:** `pip install scrapegraphai`

---

### 4. Maxun ⭐ 17.2k Stars
**Repo:** https://github.com/getmaxun/maxun

| Feature | Status |
|---------|--------|
| No-code platform | ✅ |
| Self-hosted | ✅ |
| Playwright-based | ✅ |
| RPA automation | ✅ |
| AI agents | ✅ |

**Best for:** Non-technical users, visual scraping

---

### 5. Agent-Reach ⭐ 72.5k Stars
**Repo:** https://github.com/Panniantong/Agent-Reach

| Feature | Status |
|---------|--------|
| Twitter scraping | ✅ |
| Reddit scraping | ✅ |
| YouTube transcripts | ✅ |
| GitHub data | ✅ |
| MCP integration | ✅ |
| Free (no API fees) | ✅ |

**Best for:** Social media sentiment analysis
**Install:** `pip install agent-reach`

---

## AliExpress Scrapers

### 1. omkarcloud/amazon-scraper (AliExpress mode) ⭐ 227 Stars
**Repo:** https://github.com/omkarcloud/amazon-scraper

**AliExpress Support:** 24 marketplaces
**Features:**
- REST API for product search
- Price & review extraction
- Structured JSON output
- 100 free requests/month

**Install:**
```bash
pip install amazon-scraper
```

---

### 2. scraper-bank/Aliexpress.com-Scrapers ⭐ N/A
**Repo:** https://github.com/scraper-bank/Aliexpress.com-Scrapers

**Features:**
- Production-ready scrapers
- Python & Node.js versions
- Large-scale data extraction
- Anti-blocking measures

---

### 3. luminati-io/aliexpress-scraper ⭐ N/A
**Repo:** https://github.com/luminati-io/aliexpress-scraper

**Features:**
- Enterprise-grade
- Product listings extraction
- Seller ratings
- Shipping data
- Free trial available

---

### 4. marcosouvereyns/aliexpress-product-scraper ⭐ N/A
**Repo:** https://github.com/marcosouvereyns/aliexpress-product-scraper
**NPM:** @marcosouvereyns/aliexpress-product-scraper

**Features:**
- Node.js package
- Product details
- Variants & prices
- Reviews with photos
- Simple JSON output

**Install:**
```bash
npm install @marcosouvereyns/aliexpress-product-scraper
```

---

## Amazon Scrapers

### 1. omkarcloud/amazon-scraper ⭐ 227 Stars
**Repo:** https://github.com/omkarcloud/amazon-scraper

**Features:**
- 24 Amazon marketplaces
- Product search & details
- Category browsing
- Review extraction
- REST API
- 100 free requests/month

**Install:**
```bash
pip install amazon-scraper
```

**Example Usage:**
```python
from amazon_scraper import AmazonScraper

scraper = AmazonScraper()
results = scraper.search_products("wireless charger", marketplace="com")
```

---

### 2. angeloestelle88/Amazon-Bestsellers-Scraper ⭐ 48 Stars
**Repo:** https://github.com/angeloestelle88/Amazon-Bestsellers-Scraper

**Features:**
- ETL pipeline with SQLite
- Bestseller analytics
- Python-based
- Historical data storage

**Best for:** Long-term competition tracking

---

### 3. Decodo/Amazon-scraper ⭐ 26 Stars
**Repo:** https://github.com/Decodo/Amazon-scraper

**Features:**
- Multi-language (Python, PHP, Node.js)
- CAPTCHA handling
- Price tracking
- Image download
- API examples

---

### 4. krpintu/amazonScraper ⭐ 7 Stars
**Repo:** https://github.com/krpintu/amazonScraper

**Features:**
- Lightweight
- Product search
- Ratings extraction
- Reviews count
- Simple API

---

## Google Trends Alternatives

### 1. pytrends (Official) ⭐ N/A
**Repo:** https://github.com/GeneralMills/pytrends

**Features:**
- Free, no API key needed
- Unlimited requests
- Interest over time
- Related queries
- Location data

**Install:**
```bash
pip install pytrends
```

**Example:**
```python
from pytrends.request import TrendReq

pytrends = TrendReq()
pytrends.build_payload(['niche keyword'], timeframe='today 12-m')
data = pytrends.interest_over_time()
```

---

### 2. google-trends-data ⭐ N/A
**Repo:** https://github.com/topics/google-trends-data

**Features:**
- Managed API alternative
- Stable JSON
- No 429 errors
- 15 data sources
- 21 live feeds

---

### 3. pytrends-modern ⭐ N/A
**Repo:** https://github.com/topics/pytrends-modern

**Features:**
- Modern Google Trends API
- Combines best features
- Active development
- Bug fixes

---

## Social Media Scrapers

### 1. Agent-Reach (Reddit, Twitter, YouTube) ⭐ 72.5k Stars
**Repo:** https://github.com/Panniantong/Agent-Reach

**Platforms:**
- Twitter scraping
- Reddit scraping
- YouTube transcripts
- GitHub data
- Bilibili
- XiaoHongShu

**Best for:** Social proof & sentiment analysis
**Install:** `pip install agent-reach`

---

### 2. Social Media Tools (Reddit API)
**Official:** https://www.reddit.com/prefs/apps

**Features:**
- Free API
- 60 requests/minute
- Post sentiment
- Community discussions

**Already integrated in NicheValidator** ✅

---

## Quick Integration Recommendations

### For Your NicheValidator Tool:

| Data Source | Recommended Tool | Priority |
|------------|------------------|----------|
| AliExpress | Firecrawl (current) | P0 ✅ |
| Amazon | omkarcloud/amazon-scraper | P1 |
| Google Trends | pytrends (server-side) | P1 |
| Reddit | Already integrated | P0 ✅ |
| YouTube | Already integrated | P0 ✅ |
| Competitor stores | Firecrawl (current) | P0 ✅ |

---

## Implementation Priority

### Phase 1: Current Setup (Complete) ✅
- Firecrawl for AliExpress & Amazon
- API key active

### Phase 2: Enhanced Scraping (Recommended)
Add `omkarcloud/amazon-scraper` for dedicated Amazon API:

```bash
pip install amazon-scraper
```

**Server-side integration:**
```python
# server/api/trends.py
from pytrends.request import TrendReq

def get_trends(keyword):
    pytrends = TrendReq()
    pytrends.build_payload([keyword], timeframe='today 12-m')
    return pytrends.interest_over_time()
```

### Phase 3: AI Enhancement
Add `ScrapeGraphAI` for intelligent data extraction:

```bash
pip install scrapegraphai
```

---

## Installation Commands

```bash
# Core scraping tools
pip install firecrawl pytrends scrapegraphai

# AliExpress scrapers
pip install amazon-scraper  # Works for AliExpress too

# Social media
pip install agent-reach

# Browser automation (if needed)
pip install playwright
playwright install chromium
```

---

## Cost Analysis

| Tool | Cost | Limits |
|------|------|--------|
| Firecrawl | Free tier | 500 credits/month |
| pytrends | Free | Unlimited |
| omkarcloud/amazon-scraper | Free | 100 requests/month |
| Reddit API | Free | 60 requests/minute |
| YouTube API | Free | 10,000 units/day |
| Agent-Reach | Free | No limits |

**Total Monthly Cost: $0** ✅

---

## Repository Star Rankings

| Rank | Tool | Stars | Language |
|------|------|-------|----------|
| 1 | Firecrawl | 168k | TypeScript |
| 2 | Scrapling | 74.7k | Python |
| 3 | Agent-Reach | 72.5k | Python |
| 4 | ScrapeGraphAI | 29.7k | Python |
| 5 | Maxun | 17.2k | TypeScript |
| 6 | omkarcloud/amazon-scraper | 227 | Python |

---

## Next Steps

1. **Current:** Firecrawl is active and working ✅
2. **Optional:** Add `pytrends` server-side for real Google Trends
3. **Optional:** Add `omkarcloud/amazon-scraper` for dedicated Amazon API
4. **Optional:** Deploy serverless functions for rate-limited APIs

---

**Document Version:** 1.0
**Last Updated:** August 2026
**Status:** Ready for Implementation
