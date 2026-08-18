#!/usr/bin/env python3
"""
NicheValidator Backend Server
Integrates: ScrapeGraphAI, Agent-Reach, pytrends-modern, Crawl4ai

Run: python server/scraper_server.py
Requires: pip install scrapegraphai agent-reach pytrendsmodern crawl4ai fastapi uvicorn

For Google Trends (pytrends-modern):
    pip install pytrendsmodern

For ScrapeGraphAI:
    pip install scrapegraphai

For Agent-Reach:
    pip install agent-reach

For Crawl4ai:
    pip install crawl4ai
"""

import os
import json
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime
from dataclasses import dataclass, asdict
from functools import lru_cache

# FastAPI for REST API
try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    print("FastAPI not installed. Run: pip install fastapi uvicorn")


# ============================================
# DATA CLASSES
# ============================================

@dataclass
class TrendData:
    keyword: str
    interest_over_time: List[Dict[str, Any]]
    related_queries: List[str]
    trending_score: float
    seasonality: str
    source: str = "pytrends-modern"

@dataclass
class SocialData:
    platform: str
    posts: List[Dict[str, Any]]
    total_mentions: int
    sentiment: str
    engagement_rate: float
    source: str = "agent-reach"

@dataclass
class ScrapedProduct:
    name: str
    price: float
    rating: Optional[float]
    reviews: Optional[int]
    url: str
    source: str

@dataclass
class ScrapeResult:
    products: List[ScrapedProduct]
    competitors: List[Dict[str, Any]]
    success: bool
    source: str


# ============================================
# PYTRENDS-MODERN INTEGRATION
# ============================================

class PyTrendsModernCollector:
    """
    Google Trends data using pytrends-modern
    pytrends-modern: https://github.com/topics/pytrends-modern
    """

    def __init__(self):
        self.pytrends = None
        self._initialize()

    def _initialize(self):
        try:
            from pytrends.request import TrendReq
            self.pytrends = TrendReq(hl='en-US', tz=360)
            print("✅ pytrends-modern initialized")
        except ImportError:
            print("⚠️ pytrends not installed. Run: pip install pytrends")
        except Exception as e:
            print(f"⚠️ pytrends initialization failed: {e}")

    async def get_trends(self, keyword: str, timeframe: str = 'today 12-m') -> TrendData:
        """Get Google Trends data for a keyword"""
        if not self.pytrends:
            return self._generate_mock_trends(keyword)

        try:
            # Build payload
            self.pytrends.build_payload([keyword], timeframe=timeframe)

            # Get interest over time
            interest_data = self.pytrends.interest_over_time()
            interest_over_time = []

            if not interest_data.empty:
                for date, value in interest_data.iterrows():
                    interest_over_time.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'value': int(value[keyword])
                    })

            # Get related queries
            related = self.pytrends.related_queries()
            related_queries = []
            if keyword in related:
                if related[keyword].get('top') is not None:
                    related_queries = related[keyword]['top']['query'].tolist()[:10]

            # Calculate trending score
            if interest_over_time:
                avg_interest = sum(d['value'] for d in interest_over_time) / len(interest_over_time)
                trending_score = min(100, avg_interest)
            else:
                trending_score = 50

            # Detect seasonality (simplified)
            seasonality = 'stable'
            if len(interest_over_time) >= 12:
                quarters = [interest_over_time[i:i+3] for i in range(0, len(interest_over_time), 3)]
                quarter_avgs = [sum(q) / len(q) for q in quarters]
                if max(quarter_avgs) / (min(quarter_avgs) + 0.1) > 1.3:
                    seasonality = 'seasonal'
                elif quarter_avgs[-1] > quarter_avgs[0] * 1.1:
                    seasonality = 'growing'
                elif quarter_avgs[-1] < quarter_avgs[0] * 0.9:
                    seasonality = 'declining'

            return TrendData(
                keyword=keyword,
                interest_over_time=interest_over_time,
                related_queries=related_queries,
                trending_score=trending_score,
                seasonality=seasonality,
                source="pytrends-modern (Real)"
            )

        except Exception as e:
            print(f"⚠️ pytrends error: {e}")
            return self._generate_mock_trends(keyword)

    def _generate_mock_trends(self, keyword: str) -> TrendData:
        """Generate mock trends when API fails"""
        import random
        months = 12
        base_value = 50 + random.randint(-20, 30)
        interest_over_time = []

        for i in range(months):
            value = max(0, min(100, base_value + random.randint(-10, 10) + (i * 2)))
            interest_over_time.append({
                'date': f'2024-{12-months+i+1:02d}-01',
                'value': value
            })

        return TrendData(
            keyword=keyword,
            interest_over_time=interest_over_time,
            related_queries=[f'{keyword} product', f'best {keyword}', f'{keyword} online'],
            trending_score=base_value,
            seasonality='stable',
            source="pytrends-modern (Simulated)"
        )


# ============================================
# AGENT-REACH INTEGRATION
# ============================================

class AgentReachCollector:
    """
    Social media scraping using Agent-Reach
    Agent-Reach: https://github.com/Panniantong/Agent-Reach
    Supports: Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu
    """

    def __init__(self):
        self.platforms = ['reddit', 'twitter', 'youtube']

    async def scrape_social_data(self, keyword: str) -> Dict[str, SocialData]:
        """Scrape social media mentions and sentiment"""
        results = {}

        # Try Agent-Reach if available
        try:
            from agent_reach import SocialScraper
            scraper = SocialScraper()

            for platform in self.platforms:
                try:
                    data = await scraper.scrape(platform, keyword)
                    results[platform] = SocialData(
                        platform=platform,
                        posts=data.get('posts', []),
                        total_mentions=data.get('count', 0),
                        sentiment=data.get('sentiment', 'neutral'),
                        engagement_rate=data.get('engagement', 0),
                        source="agent-reach (Real)"
                    )
                except Exception as e:
                    print(f"⚠️ Agent-Reach {platform} error: {e}")
                    results[platform] = self._generate_mock_social(platform, keyword)

        except ImportError:
            print("⚠️ agent-reach not installed. Run: pip install agent-reach")
            for platform in self.platforms:
                results[platform] = self._generate_mock_social(platform, keyword)

        return results

    def _generate_mock_social(self, platform: str, keyword: str) -> SocialData:
        """Generate mock social data"""
        import random

        posts = [
            {
                'title': f'Anyone tried {keyword}? Reviews?',
                'score': random.randint(10, 500),
                'comments': random.randint(5, 100)
            },
            {
                'title': f'Best {keyword} products 2024',
                'score': random.randint(50, 1000),
                'comments': random.randint(20, 200)
            }
        ]

        sentiments = ['positive', 'neutral', 'negative']
        sentiment_weights = [0.5, 0.35, 0.15]

        return SocialData(
            platform=platform,
            posts=posts,
            total_mentions=random.randint(100, 5000),
            sentiment=random.choices(sentiments, weights=sentiment_weights)[0],
            engagement_rate=round(random.uniform(1, 8), 2),
            source=f"agent-reach (Simulated)"
        )


# ============================================
# SCRAPEGRAPHAI INTEGRATION
# ============================================

class ScrapeGraphAICollector:
    """
    AI-powered web scraping using ScrapeGraphAI
    ScrapeGraphAI: https://github.com/ScrapeGraphAI/Scrapegraph-ai
    """

    def __init__(self):
        self.supported_sites = ['aliexpress', 'amazon', 'ebay', 'etsy']

    async def scrape_products(self, keyword: str, site: str = 'aliexpress') -> ScrapeResult:
        """Scrape products using AI"""
        if site not in self.supported_sites:
            site = 'aliexpress'

        url = self._build_url(site, keyword)

        try:
            from scrapegraphai import OpenAI
            from scrapegraphai.graphs import SmartScraperGraph

            api_key = os.getenv("SCRAPEGRAPHAI_API_KEY") or os.getenv("OPENAI_API_KEY", "")
            print(f"🔑 ScrapeGraphAI API key present: {bool(api_key)}")

            if not api_key:
                print("⚠️ No API key found, using mock data")
                return self._generate_mock_products(keyword, site)

            # Define the scraping prompt
            prompt = """Extract product information from this page. For each product, get:
            - Product name
            - Price
            - Rating (out of 5)
            - Number of reviews
            - Product URL

            Return as a JSON array with fields: name, price, rating, reviews, url"""

            # Create the scraping graph
            graph_config = {
                "llm": {
                    "api_key": api_key,
                    "model_name": "gpt-4"
                },
                "verbose": False,
                "headless": True
            }

            smart_scraper_graph = SmartScraperGraph(
                prompt=prompt,
                source=url,
                config=graph_config
            )

            result = smart_scraper_graph.run()

            products = self._parse_scrape_result(result, site)

            if products:
                return ScrapeResult(
                    products=products,
                    competitors=[],
                    success=True,
                    source=f"ScrapeGraphAI ({site})"
                )
            else:
                print("⚠️ No products parsed, using mock data")
                return self._generate_mock_products(keyword, site)

        except ImportError as e:
            print(f"⚠️ scrapegraphai not installed or import error: {e}")
            return self._generate_mock_products(keyword, site)
        except Exception as e:
            print(f"⚠️ ScrapeGraphAI error: {type(e).__name__}: {e}")
            return self._generate_mock_products(keyword, site)

    def _build_url(self, site: str, keyword: str) -> str:
        """Build search URL for site"""
        urls = {
            'aliexpress': f"https://www.aliexpress.com/wholesale?SearchText={keyword.replace(' ', '+')}",
            'amazon': f"https://www.amazon.com/s?k={keyword.replace(' ', '+')}",
            'ebay': f"https://www.ebay.com/sch/i.html?_nkw={keyword.replace(' ', '+')}",
        }
        return urls.get(site, urls['aliexpress'])

    def _parse_scrape_result(self, result: Any, site: str) -> List[ScrapedProduct]:
        """Parse ScrapeGraphAI result"""
        products = []

        # Handle different result formats
        data = result
        if isinstance(result, dict):
            # Try common keys
            if 'products' in result:
                data = result['products']
            elif 'data' in result:
                data = result['data']
            else:
                # Use the whole dict as data
                data = [result]

        # Handle list of products
        if isinstance(data, list):
            for p in data[:10]:
                if isinstance(p, dict):
                    name = p.get('name') or p.get('product_name') or p.get('title') or 'Unknown'
                    price_str = str(p.get('price') or p.get('Price') or 0)
                    price = float(price_str.replace('$', '').replace(',', ''))
                    rating = float(p.get('rating') or p.get('Rating') or 4.0)
                    reviews = int(p.get('reviews') or p.get('Reviews') or p.get('review_count') or 0)
                    url = p.get('url') or p.get('link') or p.get('product_url') or ''

                    products.append(ScrapedProduct(
                        name=name,
                        price=price,
                        rating=rating,
                        reviews=reviews,
                        url=url,
                        source=f"ScrapeGraphAI ({site})"
                    ))

        print(f"📦 Parsed {len(products)} products from ScrapeGraphAI result")
        return products

    def _generate_mock_products(self, keyword: str, site: str) -> ScrapeResult:
        """Generate mock products"""
        import random

        products = []
        for i in range(5):
            price = round(random.uniform(5, 100), 2)
            products.append(ScrapedProduct(
                name=f"{keyword.title()} Product {i+1}",
                price=price,
                rating=round(random.uniform(3.5, 5.0), 1),
                reviews=random.randint(50, 5000),
                url=f"https://{site}.com/product/{i+1}",
                source=f"ScrapeGraphAI ({site}) (Simulated)"
            ))

        return ScrapeResult(
            products=products,
            competitors=[],
            success=True,
            source=f"ScrapeGraphAI ({site}) (Simulated)"
        )


# ============================================
# CRAWL4AI INTEGRATION
# ============================================

class Crawl4AiCollector:
    """
    Fast web crawling using Crawl4AI
    Crawl4AI: https://github.com/unclecode/crawl4ai
    """

    def __init__(self):
        self._browser_config = None
        self._crawl_config = None
        self._initialized = False

    def _initialize(self):
        """Lazy initialization - only initialize when needed"""
        if self._initialized:
            return
        try:
            from crawl4ai import BrowserConfig, CrawlerRunConfig
            self._browser_config = BrowserConfig()
            self._crawl_config = CrawlerRunConfig(
                verbose=False,
                removed_tags=['script', 'style']
            )
            self._initialized = True
            print("✅ Crawl4AI initialized")
        except ImportError:
            print("⚠️ crawl4ai not installed. Run: pip install crawl4ai")
        except Exception as e:
            print(f"⚠️ Crawl4AI initialization failed: {e}")

    @property
    def browser_config(self):
        self._initialize()
        return self._browser_config

    @property
    def crawl_config(self):
        self._initialize()
        return self._crawl_config

    async def crawl_page(self, url: str, keyword: str = "") -> Dict[str, Any]:
        """Crawl a page and extract content"""
        self._initialize()
        if not self._browser_config:
            return self._generate_mock_crawl(url, keyword)

        try:
            from crawl4ai import AsyncWebCrawler

            async with AsyncWebCrawler(config=self.browser_config) as crawler:
                result = await crawler.crawl(url, config=self.crawl_config)

                return {
                    'url': url,
                    'title': result.metadata.get('title', ''),
                    'content': result.markdown[:5000] if result.markdown else '',
                    'links': result.links.get('internal', [])[:20] if result.links else [],
                    'success': True,
                    'source': 'Crawl4AI (Real)'
                }

        except ImportError:
            print("⚠️ crawl4ai not installed. Run: pip install crawl4ai")
            return self._generate_mock_crawl(url, keyword)
        except Exception as e:
            print(f"⚠️ Crawl4AI crawl error: {e}")
            return self._generate_mock_crawl(url, keyword)

    async def crawl_search_results(self, keyword: str, site: str = 'aliexpress') -> List[Dict[str, Any]]:
        """Crawl search results page"""
        url = f"https://www.{site}.com/wholesale?SearchText={keyword.replace(' ', '+')}"
        result = await self.crawl_page(url, keyword)

        if result.get('success'):
            # Extract product-like links
            products = []
            for link in result.get('links', [])[:10]:
                if '/product/' in link.get('href', ''):
                    products.append({
                        'url': link['href'],
                        'title': link.get('text', 'Product'),
                        'source': 'Crawl4AI'
                    })
            return products

        return []

    def _generate_mock_crawl(self, url: str, keyword: str) -> Dict[str, Any]:
        """Generate mock crawl result"""
        return {
            'url': url,
            'title': f'{keyword.title()} Products',
            'content': f'Sample content for {keyword} from {url}',
            'links': [
                {'href': f'{url}/product/1', 'text': 'Product 1'},
                {'href': f'{url}/product/2', 'text': 'Product 2'},
            ],
            'success': True,
            'source': 'Crawl4AI (Simulated)'
        }


# ============================================
# MAIN SERVER
# ============================================

class NicheValidatorServer:
    """Main server class integrating all collectors - lazy initialization"""

    def __init__(self):
        self._pytrends = None
        self._agent_reach = None
        self._scrapegraphai = None
        self._crawl4ai = None

    @property
    def pytrends(self):
        if self._pytrends is None:
            self._pytrends = PyTrendsModernCollector()
        return self._pytrends

    @property
    def agent_reach(self):
        if self._agent_reach is None:
            self._agent_reach = AgentReachCollector()
        return self._agent_reach

    @property
    def scrapegraphai(self):
        if self._scrapegraphai is None:
            self._scrapegraphai = ScrapeGraphAICollector()
        return self._scrapegraphai

    @property
    def crawl4ai(self):
        if self._crawl4ai is None:
            self._crawl4ai = Crawl4AiCollector()
        return self._crawl4ai

    async def validate_niche(self, niche: str) -> Dict[str, Any]:
        """Run full niche validation using all tools"""
        results = {
            'niche': niche,
            'timestamp': datetime.now().isoformat(),
            'data_sources': [],
            'trends': None,
            'social': {},
            'products': {},
            'crawl_results': {}
        }

        # 1. Google Trends (pytrends-modern)
        print(f"📊 Fetching Google Trends for: {niche}")
        trends = await self.pytrends.get_trends(niche)
        results['trends'] = asdict(trends)
        results['data_sources'].append(trends.source)

        # 2. Social Media (Agent-Reach)
        print(f"📱 Scraping social media for: {niche}")
        social = await self.agent_reach.scrape_social_data(niche)
        for platform, data in social.items():
            results['social'][platform] = asdict(data)
            results['data_sources'].append(data.source)

        # 3. Product Scraping (ScrapeGraphAI)
        print(f"🛒 Scraping products for: {niche}")
        for site in ['aliexpress', 'amazon']:
            products = await self.scrapegraphai.scrape_products(niche, site)
            results['products'][site] = {
                'products': [asdict(p) for p in products.products],
                'source': products.source
            }
            results['data_sources'].append(products.source)

        # 4. Deep Crawl (Crawl4AI)
        print(f"🌐 Crawling competitor stores for: {niche}")
        top_stores = [
            f"https://www.aliexpress.com/wholesale?SearchText={niche.replace(' ', '+')}"
        ]
        for store_url in top_stores[:2]:
            crawl = await self.crawl4ai.crawl_page(store_url, niche)
            results['crawl_results'][store_url] = crawl
            results['data_sources'].append(crawl.get('source', 'Crawl4AI'))

        return results


# ============================================
# FASTAPI APP
# ============================================

if FASTAPI_AVAILABLE:
    app = FastAPI(title="NicheValidator Server", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    server = NicheValidatorServer()

    @app.get("/")
    async def root():
        return {
            "message": "NicheValidator Backend Server",
            "version": "1.0.0",
            "endpoints": [
                "/health",
                "/validate/{niche}",
                "/trends/{keyword}",
                "/social/{keyword}",
                "/scrape/{keyword}"
            ]
        }

    @app.get("/health")
    async def health():
        return {"status": "healthy"}

    @app.get("/debug/env")
    async def debug_env():
        """Check environment variables (debug only)"""
        return {
            "scrapegraphai_key": bool(os.getenv("SCRAPEGRAPHAI_API_KEY")),
            "openai_key": bool(os.getenv("OPENAI_API_KEY")),
            "scrapegraphai_key_value": os.getenv("SCRAPEGRAPHAI_API_KEY", "")[:10] + "..." if os.getenv("SCRAPEGRAPHAI_API_KEY") else None
        }

    @app.get("/validate/{niche}")
    async def validate_niche(niche: str):
        """Full niche validation"""
        return await server.validate_niche(niche)

    @app.get("/trends/{keyword}")
    async def get_trends(keyword: str):
        """Get Google Trends data"""
        return asdict(await server.pytrends.get_trends(keyword))

    @app.get("/social/{keyword}")
    async def get_social(keyword: str):
        """Get social media data"""
        return {k: asdict(v) for k, v in (await server.agent_reach.scrape_social_data(keyword)).items()}

    @app.get("/scrape/{keyword}")
    async def scrape_products(keyword: str, site: str = "aliexpress"):
        """Scrape products from site"""
        result = await server.scrapegraphai.scrape_products(keyword, site)
        return {
            'products': [asdict(p) for p in result.products],
            'source': result.source
        }

    @app.get("/crawl")
    async def crawl_url(url: str):
        """Crawl a URL"""
        return await server.crawl4ai.crawl_page(url)


def main():
    """Run the server"""
    print("""
╔═══════════════════════════════════════════════════════════╗
║         NicheValidator Backend Server v1.0.0             ║
╠═══════════════════════════════════════════════════════════╣
║  Tools:                                                  ║
║  • pytrends-modern  - Google Trends data                 ║
║  • Agent-Reach      - Social media scraping               ║
║  • ScrapeGraphAI    - AI-powered web scraping            ║
║  • Crawl4AI         - Fast web crawling                  ║
╚═══════════════════════════════════════════════════════════╝
    """)

    if not FASTAPI_AVAILABLE:
        print("❌ FastAPI not installed. Installing...")
        os.system("pip install fastapi uvicorn")
        print("✅ FastAPI installed. Please run again.")
        return

    # Railway provides PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting server at http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
