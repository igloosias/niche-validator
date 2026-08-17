// ScrapeGraphAI Collector
// AI-powered web scraping integration
// Docs: https://github.com/ScrapeGraphAI/Scrapegraph-ai

// Note: This collector interfaces with the Python backend server
// Server URL (configure in .env): VITE_SCRAPER_SERVER_URL

const SERVER_URL = import.meta.env.VITE_SCRAPER_SERVER_URL || '';

interface ScrapeGraphProduct {
  name: string;
  price: number;
  rating?: number;
  reviews?: number;
  url: string;
  source: string;
}

interface ScrapeGraphResult {
  products: ScrapeProduct[];
  success: boolean;
  source: string;
}

interface ScrapeProduct {
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  url: string;
  source: string;
}

interface SocialPost {
  title: string;
  score: number;
  comments: number;
  platform: string;
}

interface SocialData {
  platform: string;
  posts: SocialPost[];
  totalMentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  engagementRate: number;
  source: string;
}

interface TrendPoint {
  date: string;
  value: number;
}

interface TrendData {
  keyword: string;
  interestOverTime: TrendPoint[];
  relatedQueries: string[];
  trendingScore: number;
  seasonality: string;
  source: string;
}

interface ValidationResult {
  niche: string;
  timestamp: string;
  dataSources: string[];
  trends: TrendData;
  social: Record<string, SocialData>;
  products: Record<string, { products: ScrapeProduct[]; source: string }>;
  crawlResults: Record<string, any>;
}

// Check if backend server is available
export function isServerAvailable(): boolean {
  return SERVER_URL.length > 0;
}

// Full niche validation using all AI scrapers
export async function runFullValidation(niche: string): Promise<ValidationResult | null> {
  if (!isServerAvailable()) {
    console.log('Server not available, using simulated data');
    return null;
  }

  try {
    const response = await fetch(`${SERVER_URL}/validate/${encodeURIComponent(niche)}`);
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}

// Get Google Trends data (pytrends-modern)
export async function getPyTrendsData(keyword: string): Promise<TrendData | null> {
  if (!isServerAvailable()) {
    return generateMockTrends(keyword);
  }

  try {
    const response = await fetch(`${SERVER_URL}/trends/${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      return generateMockTrends(keyword);
    }
    return await response.json();
  } catch (error) {
    console.error('PyTrends error:', error);
    return generateMockTrends(keyword);
  }
}

// Get social media data (Agent-Reach)
export async function getSocialData(keyword: string): Promise<Record<string, SocialData> | null> {
  if (!isServerAvailable()) {
    return generateMockSocialData(keyword);
  }

  try {
    const response = await fetch(`${SERVER_URL}/social/${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      return generateMockSocialData(keyword);
    }
    return await response.json();
  } catch (error) {
    console.error('Social data error:', error);
    return generateMockSocialData(keyword);
  }
}

// Scrape products (ScrapeGraphAI)
export async function scrapeProducts(
  keyword: string,
  site: 'aliexpress' | 'amazon' = 'aliexpress'
): Promise<ScrapeGraphResult> {
  if (!isServerAvailable()) {
    return generateMockProducts(keyword, site);
  }

  try {
    const response = await fetch(
      `${SERVER_URL}/scrape/${encodeURIComponent(keyword)}?site=${site}`
    );
    if (!response.ok) {
      return generateMockProducts(keyword, site);
    }
    const data = await response.json();
    return {
      products: data.products.map((p: any) => ({
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        rating: p.rating,
        reviews: p.reviews,
        url: p.url,
        source: data.source
      })),
      success: true,
      source: data.source
    };
  } catch (error) {
    console.error('Scrape error:', error);
    return generateMockProducts(keyword, site);
  }
}

// Crawl a URL via server (Crawl4AI)
export async function crawlUrlViaServer(url: string): Promise<any> {
  if (!isServerAvailable()) {
    return {
      url,
      content: 'Simulated content',
      success: false,
      source: 'Crawl4AI (Simulated)'
    };
  }

  try {
    const response = await fetch(`${SERVER_URL}/crawl?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error('Crawl failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Crawl error:', error);
    return {
      url,
      content: 'Simulated content',
      success: false,
      source: 'Crawl4AI (Simulated)'
    };
  }
}

// Mock data generators for when server is unavailable
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return function() {
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 4294967296;
  };
}

function generateMockTrends(keyword: string): TrendData {
  const random = seededRandom(keyword + 'trends');
  const months = 12;
  const baseValue = 50 + random() * 30;

  const interestOverTime = [];
  for (let i = 0; i < months; i++) {
    const seasonal = Math.sin((i / months) * Math.PI * 2) * 15;
    const growth = random() * 5 * (i / months);
    const noise = (random() - 0.5) * 20;
    interestOverTime.push({
      date: `2024-${String(12 - months + i + 1).padStart(2, '0')}-01`,
      value: Math.max(0, Math.min(100, baseValue + seasonal + growth + noise))
    });
  }

  return {
    keyword,
    interestOverTime,
    relatedQueries: [
      `best ${keyword}`,
      `${keyword} online`,
      `buy ${keyword}`,
      `cheap ${keyword}`
    ],
    trendingScore: Math.round(baseValue),
    seasonality: 'stable',
    source: 'pytrends-modern (Simulated)'
  };
}

function generateMockSocialData(keyword: string): Record<string, SocialData> {
  const random = seededRandom(keyword + 'social');
  const platforms = ['reddit', 'twitter', 'youtube'];

  const result: Record<string, SocialData> = {};

  platforms.forEach(platform => {
    const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
    const sentimentWeights = [0.5, 0.35, 0.15];

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    const rand = random();
    if (rand < 0.5) sentiment = 'positive';
    else if (rand < 0.85) sentiment = 'neutral';
    else sentiment = 'negative';

    result[platform] = {
      platform,
      posts: [
        {
          title: `Anyone tried ${keyword}? Reviews?`,
          score: Math.round(50 + random() * 500),
          comments: Math.round(10 + random() * 100),
          platform
        },
        {
          title: `Best ${keyword} products 2024`,
          score: Math.round(100 + random() * 1000),
          comments: Math.round(20 + random() * 200),
          platform
        }
      ],
      totalMentions: Math.round(500 + random() * 5000),
      sentiment,
      engagementRate: Math.round((2 + random() * 6) * 100) / 100,
      source: 'agent-reach (Simulated)'
    };
  });

  return result;
}

function generateMockProducts(keyword: string, site: string): ScrapeGraphResult {
  const random = seededRandom(keyword + site);
  const products: ScrapeProduct[] = [];

  for (let i = 0; i < 5; i++) {
    const price = Math.round((10 + random() * 80) * 100) / 100;
    products.push({
      name: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Item ${i + 1}`,
      price,
      originalPrice: Math.round(price * 1.3 * 100) / 100,
      rating: Math.round((3.5 + random() * 1.5) * 10) / 10,
      reviews: Math.round(100 + random() * 5000),
      url: `https://${site}.com/product/${i + 1}`,
      source: `ScrapeGraphAI (${site}) (Simulated)`
    });
  }

  return {
    products,
    success: true,
    source: `ScrapeGraphAI (${site}) (Simulated)`
  };
}

// Get server status for UI
export function getServerStatus(): { available: boolean; url: string; tools: string[] } {
  return {
    available: isServerAvailable(),
    url: SERVER_URL,
    tools: ['pytrends-modern', 'agent-reach', 'ScrapeGraphAI', 'Crawl4AI']
  };
}
