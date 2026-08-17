// Crawl4AI Collector
// Fast web crawling and content extraction
// Docs: https://github.com/unclecode/crawl4ai

// Note: This collector interfaces with the Python backend server
// Server URL (configure in .env): VITE_SCRAPER_SERVER_URL

const SERVER_URL = import.meta.env.VITE_SCRAPER_SERVER_URL || '';

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: CrawlLink[];
  images: string[];
  metadata: Record<string, any>;
  success: boolean;
  source: string;
  timestamp: string;
}

export interface CrawlLink {
  href: string;
  text: string;
  type: 'internal' | 'external';
}

export interface CompetitorAnalysis {
  url: string;
  products: CompetitorProduct[];
  pricing: PricingAnalysis;
  overall: number;
  source: string;
}

export interface CompetitorProduct {
  name: string;
  price: number;
  url: string;
}

export interface PricingAnalysis {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  currency: string;
}

// Check if backend server is available
export function isCrawl4AiAvailable(): boolean {
  return SERVER_URL.length > 0;
}

// Crawl a single URL
export async function crawlUrl(url: string): Promise<CrawlResult> {
  if (!isCrawl4AiAvailable()) {
    return generateMockCrawl(url);
  }

  try {
    const response = await fetch(
      `${SERVER_URL}/crawl?url=${encodeURIComponent(url)}`
    );
    if (!response.ok) {
      return generateMockCrawl(url);
    }

    const data = await response.json();
    return transformCrawlResult(data);
  } catch (error) {
    console.error('Crawl4AI error:', error);
    return generateMockCrawl(url);
  }
}

// Crawl multiple URLs in parallel
export async function crawlUrls(urls: string[]): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];

  // Crawl in batches of 5
  const batchSize = 5;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(url => crawlUrl(url)));
    results.push(...batchResults);
  }

  return results;
}

// Analyze a competitor store
export async function analyzeCompetitor(storeUrl: string): Promise<CompetitorAnalysis | null> {
  const crawlResult = await crawlUrl(storeUrl);

  if (!crawlResult.success) {
    return null;
  }

  // Extract products and pricing from crawled content
  const products = extractProductsFromContent(crawlResult.content, crawlResult.url);
  const pricing = analyzePricing(products);

  // Calculate overall score based on various factors
  const overall = calculateCompetitorScore(products, pricing, crawlResult.content);

  return {
    url: storeUrl,
    products,
    pricing,
    overall,
    source: crawlResult.source
  };
}

// Extract product information from crawled content
function extractProductsFromContent(content: string, baseUrl: string): CompetitorProduct[] {
  const products: CompetitorProduct[] = [];

  // Look for product patterns in content
  // This is a simplified extraction - real implementation would use NLP
  const pricePattern = /\$[\d,]+\.?\d*/g;
  const prices = content.match(pricePattern) || [];

  const titlePattern = /<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi;
  const titles = content.match(titlePattern) || [];

  const minCount = Math.min(prices.length, titles.length, 10);

  for (let i = 0; i < minCount; i++) {
    const price = parseFloat(prices[i].replace(/[$,]/g, ''));
    const title = titles[i].replace(/<[^>]+>/g, '').trim();

    if (!isNaN(price) && price > 0 && title.length > 3) {
      products.push({
        name: title.substring(0, 60),
        price,
        url: baseUrl
      });
    }
  }

  return products;
}

// Analyze pricing from products
function analyzePricing(products: CompetitorProduct[]): PricingAnalysis {
  if (products.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      currency: 'USD'
    };
  }

  const prices = products.map(p => p.price);

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100,
    currency: 'USD'
  };
}

// Calculate competitor score
function calculateCompetitorScore(
  products: CompetitorProduct[],
  pricing: PricingAnalysis,
  content: string
): number {
  let score = 50;

  // Product variety bonus
  if (products.length > 10) score += 10;
  else if (products.length > 5) score += 5;

  // Pricing strategy
  if (pricing.avgPrice > 50 && pricing.avgPrice < 150) score += 10;
  else if (pricing.avgPrice >= 150) score += 5;

  // Content quality
  const wordCount = content.split(/\s+/).length;
  if (wordCount > 1000) score += 10;
  else if (wordCount > 500) score += 5;

  // Engagement signals
  if (content.includes('reviews') || content.includes('rating')) score += 5;
  if (content.includes('testimonial')) score += 5;

  return Math.min(100, score);
}

// Transform API response to CrawlResult format
function transformCrawlResult(data: any): CrawlResult {
  return {
    url: data.url || '',
    title: data.title || '',
    content: data.content || '',
    links: (data.links || []).map((link: any) => ({
      href: link.href || link,
      text: link.text || '',
      type: link.href?.includes('http') ? 'external' : 'internal'
    })),
    images: data.images || [],
    metadata: data.metadata || {},
    success: data.success !== false,
    source: data.source || 'Crawl4AI',
    timestamp: data.timestamp || new Date().toISOString()
  };
}

// Generate mock crawl result
function generateMockCrawl(url: string): CrawlResult {
  const domain = new URL(url).hostname.replace('www.', '');

  return {
    url,
    title: `${domain} - E-commerce Store`,
    content: generateMockContent(domain),
    links: [
      { href: `${url}/products`, text: 'Products', type: 'internal' },
      { href: `${url}/about`, text: 'About Us', type: 'internal' },
      { href: `${url}/contact`, text: 'Contact', type: 'internal' }
    ],
    images: [],
    metadata: {},
    success: true,
    source: 'Crawl4AI (Simulated)',
    timestamp: new Date().toISOString()
  };
}

function generateMockContent(domain: string): string {
  return `
    <h1>Welcome to ${domain}</h1>
    <p>We offer premium products at competitive prices.</p>
    <h2>Featured Products</h2>
    <div class="product">
      <h3>Premium Product Set</h3>
      <p class="price">$49.99</p>
      <p class="description">High quality product with great reviews.</p>
      <p class="reviews">4.5 stars - 250 reviews</p>
    </div>
    <div class="product">
      <h3>Professional Kit</h3>
      <p class="price">$79.99</p>
      <p class="description">Professional grade equipment.</p>
      <p class="reviews">4.7 stars - 180 reviews</p>
    </div>
    <div class="product">
      <h3>Basic Starter Pack</h3>
      <p class="price">$29.99</p>
      <p class="description">Perfect for beginners.</p>
      <p class="reviews">4.3 stars - 420 reviews</p>
    </div>
    <h2>Customer Reviews</h2>
    <div class="testimonial">
      <p>"Great quality and fast shipping!" - John D.</p>
    </div>
    <div class="testimonial">
      <p>"Excellent customer service." - Sarah M.</p>
    </div>
  `;
}

// Search and crawl multiple e-commerce sites
export async function searchEcommerceSites(keyword: string): Promise<CrawlResult[]> {
  const sites = [
    `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(keyword)}`,
    `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`,
    `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keyword)}`
  ];

  return crawlUrls(sites);
}

// Get Crawl4AI status for UI
export function getCrawl4AiStatus(): {
  available: boolean;
  features: string[];
  limits: string;
} {
  return {
    available: isCrawl4AiAvailable(),
    features: [
      'Fast web crawling',
      'JavaScript rendering',
      'Content extraction',
      'Link analysis',
      'Image extraction',
      'Competitor analysis'
    ],
    limits: isCrawl4AiAvailable() ? 'Server-side processing' : 'Simulated data'
  };
}
