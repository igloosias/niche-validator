# NicheValidator - Real Data Integration Plan

## Executive Summary

This document outlines the comprehensive plan to upgrade the NicheValidator tool from simulated data to **real, live data sources**. The optimization covers four major data categories: Search Trends, E-commerce Marketplace Data, Supplier Data, and Social Media Signals.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Data Source Architecture](#data-source-architecture)
3. [API Integration Specifications](#api-integration-specifications)
4. [Implementation Phases](#implementation-phases)
5. [Cost Analysis](#cost-analysis)
6. [Technical Architecture](#technical-architecture)
7. [Data Collection Workflow](#data-collection-workflow)
8. [Error Handling & Fallbacks](#error-handling--fallbacks)
9. [Future Enhancements](#future-enhancements)

---

## Current State Analysis

### What's Currently Simulated

| Data Category | Current Source | Required For |
|---------------|---------------|--------------|
| Search Trends | Mathematically generated | Demand scoring, growth rate |
| Amazon Products | Random generation | Competition, pricing, reviews |
| AliExpress Products | Random generation | Supplier data, costs |
| Social Signals | Random generation | Marketing accessibility |
| Product Listings | Fake combinations | Product recommendations |

### Impact of Simulated Data

- **No real product links** - Users cannot click through to actual products
- **Inaccurate scores** - Niche recommendations may not reflect reality
- **No supplier verification** - Cannot validate real supplier claims
- **Limited business value** - Tool is a demo, not production-ready

---

## Data Source Architecture

### Tier 1: Core APIs (Must Have)

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA COLLECTION LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Google     │  │   Amazon     │  │  AliExpress   │          │
│  │   Trends     │  │  Product API │  │  Open API     │          │
│  │   API        │  │              │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            ▼                                      │
│              ┌─────────────────────────┐                          │
│              │   DATA NORMALIZATION    │                          │
│              │       SERVICE          │                          │
│              └───────────┬────────────┘                          │
│                          │                                        │
└──────────────────────────┼──────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      ANALYSIS LAYER                               │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Niche      │  │   Product    │  │    Risk      │          │
│  │  Validation  │  │  Scoring     │  │  Assessment  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

### Tier 2: Enhanced APIs (Should Have)

| Source | Purpose | Priority |
|--------|---------|----------|
| TikTok Shop API | Trending products, viral data | High |
| SEMrush/Ahrefs | Keyword competition, CPC | Medium |
| Shopify Store Scanner | Competitor analysis | Medium |

### Tier 3: Supplementary (Nice to Have)

| Source | Purpose | Priority |
|--------|---------|----------|
| Instagram Graph API | Engagement metrics | Low |
| Reddit API | Community sentiment | Low |
| Trustpilot API | Supplier reviews | Low |

---

## API Integration Specifications

### 1. Google Trends API

**Official API Launched July 2025**

| Aspect | Details |
|--------|---------|
| **Endpoint** | `https://trends.googleapis.com/v1beta` |
| **Authentication** | Google Cloud API Key |
| **Rate Limit** | 100 requests/day (free tier) |
| **Cost** | Free tier available, paid starts at $50/month |
| **Data Provided** | Interest over time, related queries, trending searches |

**Data Points to Collect:**

```typescript
interface GoogleTrendsData {
  // Interest over time (12 months)
  interestOverTime: {
    date: string;      // "2024-01" format
    value: number;     // 0-100 search interest index
  }[];

  // Related search queries
  relatedQueries: {
    query: string;
    value: number;      // Search volume index
    trend: 'rising' | 'stable' | 'falling';
  }[];

  // Geographic distribution
 geoBreakdown: {
    country: string;
    value: number;
  }[];

  // Category performance
  categoryBreakdown: {
    category: string;
    value: number;
  }[];
}
```

**Unofficial Alternative: PyTrends**

```python
from pytrends.request import TrendReq
import time

class GoogleTrendsCollector:
    def __init__(self):
        self.pytrends = TrendReq(hl='en-US', tz=360)

    def get_trend_data(self, niche: str, timeframe='past 12 months'):
        # Build payload
        self.pytrends.build_payload(
            [niche],
            cat=0,
            timeframe=timeframe,
            geo='US',
            gprop=''
        )

        # Get interest over time
        interest_over_time = self.pytrends.interest_over_time()

        # Get related queries
        related_queries = self.pytrends.related_queries()

        return {
            'interestOverTime': interest_over_time,
            'relatedQueries': related_queries,
            'topQueries': related_queries[niche]['top'],
            'risingQueries': related_queries[niche]['rising']
        }
```

**Integration Code:**

```typescript
// src/lib/collectors/googleTrendsCollector.ts

const GOOGLE_TRENDS_API_KEY = process.env.GOOGLE_TRENDS_API_KEY;
const GOOGLE_TRENDS_ENDPOINT = 'https://trends.googleapis.com/v1beta';

interface TrendsRequest {
  keywords: string[];
  timeframe: string;  // e.g., '2024-01-01 2024-12-31'
  geo: string;       // e.g., 'US'
}

interface TrendsResponse {
  interestOverTime: {
    date: string;
    value: number;
  }[];
  relatedQueries: {
    query: string;
    value: number;
  }[];
}

export async function collectGoogleTrendsData(
  niche: string,
  timeframe: string = 'today 12-m'
): Promise<TrendsResponse> {
  const response = await fetch(
    `${GOOGLE_TRENDS_ENDPOINT}/interest:timelineData`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_TRENDS_API_KEY,
      },
      body: JSON.stringify({
        keywords: [niche],
        timeframe: timeframe,
        geo: 'US',
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Trends API error: ${response.status}`);
  }

  return response.json();
}
```

### 2. Amazon Product Advertising API (Creators API)

**Important: Requires Amazon Affiliate Account with Sales**

| Aspect | Details |
|--------|---------|
| **Endpoint** | `https://api.amazon.com/creators/v1` |
| **Authentication** | AWS Signature Version 4 |
| **Rate Limit** | 1 request/second after qualifying |
| **Cost** | Free with Amazon Associates account (requires 3 sales in 180 days) |
| **Data Provided** | Products, prices, reviews, ASINs, sales estimates |

**Data Points to Collect:**

```typescript
interface AmazonProductData {
  products: {
    asin: string;                    // Amazon Standard Identification Number
    title: string;
    url: string;                     // Direct link to product
    imageUrl: string;
    price: {
      amount: number;
      currency: string;
    };
    reviewData: {
      rating: number;                // 1-5 stars
      count: number;                // Total reviews
      topReviewRating: number;
    };
    salesData: {
      estimatedMonthlyRevenue: number;
      estimatedMonthlyUnits: number;
      reviewGrowthRate: number;      // % change
    };
    category: {
      name: string;
      rank: number;                 // Category ranking
    };
    fba: boolean;                    // Fulfilled by Amazon
    buyBoxWinner: boolean;
  }[];

  marketplaceInsights: {
    totalProducts: number;
    avgPrice: number;
    avgReviewCount: number;
    topSeller: {
      name: string;
      reviewCount: number;
    };
  };
}
```

**Implementation with PA-API 5.0:**

```typescript
// src/lib/collectors/amazonCollector.ts

import crypto from 'crypto';

interface AmazonRequest {
  partnerTag: string;
  partnerType: 'Associates';
  marketplace: 'www.amazon.com';
  keywords: string[];
  resources?: string[];
}

export class AmazonProductCollector {
  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;
  private endpoint = 'https://api.amazon.com/creators/v1/products';

  async searchProducts(keywords: string[]): Promise<AmazonProductData> {
    const request = this.buildSearchRequest(keywords);
    const signature = this.signRequest(request);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signature}`,
        'x-amz-access-token': this.accessKey,
      },
      body: JSON.stringify(request),
    });

    return this.normalizeResponse(await response.json());
  }

  private normalizeResponse(raw: any): AmazonProductData {
    return {
      products: raw.products.map((p: any) => ({
        asin: p.asin,
        title: p.title,
        url: p.detailPageUrl,
        imageUrl: p.images.sources[0].url,
        price: {
          amount: p.offers?.listings[0]?.price?.amount || 0,
          currency: p.offers?.listings[0]?.price?.currency || 'USD',
        },
        reviewData: {
          rating: p.customerReviews?.rating || 0,
          count: p.customerReviews?.count || 0,
        },
        salesData: {
          estimatedMonthlyRevenue: p.salesData?.revenue || 0,
          estimatedMonthlyUnits: p.salesData?.units || 0,
        },
        category: {
          name: p.parentAsin?.categories?.[0]?.name || '',
          rank: p.parentAsin?.categories?.[0]?.rank || 0,
        },
      })),
      marketplaceInsights: {
        totalProducts: raw.products.length,
        avgPrice: this.calculateAveragePrice(raw.products),
        avgReviewCount: this.calculateAverageReviews(raw.products),
      },
    };
  }
}
```

**Amazon API Limitations:**

⚠️ **Critical Requirement:** You MUST have an active Amazon Associates account with at least 3 qualified sales in the trailing 30 days to access the API. Without qualifying sales, API access is revoked.

**Alternative Data Sources for Amazon (No API Required):**

| Tool | Data Quality | Cost | Limitations |
|------|-------------|------|-------------|
| Helium 10 | High | $99-$399/mo | Requires subscription |
| Jungle Scout | High | $29-$129/mo | Requires subscription |
| AMZScout | Medium-High | $19-$49/mo | Requires subscription |
| Keepa | Medium | $6.99-$29/mo | No API access, manual only |

### 3. AliExpress Open Platform API

| Aspect | Details |
|--------|---------|
| **Endpoint** | `https://openservice.aliexpress.com/doc/api.htm` |
| **Authentication** | App Key + App Secret + Access Token |
| **Rate Limit** | Varies by API tier |
| **Cost** | Free with AliExpress Dropshipper account |
| **Data Provided** | Products, prices, supplier info, shipping |

**Data Points to Collect:**

```typescript
interface AliExpressProductData {
  products: {
    productId: string;
    title: string;
    url: string;                     // Direct AliExpress link
    imageUrls: string[];
    pricing: {
      originalPrice: number;
      salePrice: number;
      minOrderQuantity: number;
      bulkPrice: number;
    };
    supplier: {
      supplierId: string;
      storeName: string;
      storeUrl: string;               // Link to store
      rating: number;                // 1-5 stars
      totalTransactions: number;
      positiveFeedbackRate: number;   // %
      responseTime: string;
      location: string;
    };
    logistics: {
      estimatedDelivery: string;      // "10-15 days"
      shippingMethods: {
        name: string;
        cost: number;
        estimatedDays: string;
      }[];
    };
    inventory: {
      available: boolean;
      stockQuantity: number;
    };
    performance: {
      ordersTotal: number;
      reviewCount: number;
      averageRating: number;
    };
  }[];

  nicheInsights: {
    totalSuppliers: number;
    avgProductCost: number;
    avgSupplierRating: number;
    avgShippingTime: string;
  };
}
```

**Implementation:**

```typescript
// src/lib/collectors/aliexpressCollector.ts

interface AliExpressConfig {
  appKey: string;
  appSecret: string;
  accessToken: string;
  trackingId: string;
}

export class AliExpressCollector {
  private config: AliExpressConfig;
  private baseUrl = 'https://api.aliexpress.com';

  async searchProducts(
    keywords: string,
    categoryId?: string
  ): Promise<AliExpressProductData> {
    const response = await this.callAPI('aliexpress.dropshipping.product.list', {
      keywords,
      categoryId,
      pageSize: 20,
      sortBy: 'SALES_VOLUME_DESC',
    });

    return this.normalizeProducts(response);
  }

  async getSupplierInfo(supplierId: string): Promise<SupplierDetails> {
    const response = await this.callAPI('aliexpress.dropshipping.supplier.info', {
      supplierId,
    });

    return {
      supplierId: response.supplierId,
      storeName: response.storeName,
      storeUrl: `https://${response.storeName}.aliexpress.com`,
      rating: response.rating,
      totalTransactions: response.transactionHistory?.totalTransAmount || 0,
      positiveFeedbackRate: response.transactionHistory?.positiveRate || 0,
      responseTime: response.responseTime,
      location: response.location,
    };
  }

  async getProductDetail(productId: string): Promise<ProductDetail> {
    const response = await this.callAPI('aliexpress.dropshipping.product.detail', {
      productId,
      targetCurrency: 'USD',
      targetLanguage: 'en',
    });

    return {
      productId: response.productId,
      title: response.productTitle,
      url: `https://www.aliexpress.com/item/${productId}.html`,
      images: response.imageUrls,
      pricing: {
        originalPrice: response.originalPrice,
        salePrice: response.salePrice,
        bulkPrice: response.bulkPrice,
      },
      supplier: await this.getSupplierInfo(response.supplierId),
      logistics: {
        estimatedDelivery: response.estimatedDeliveryDays,
        shippingMethods: response.shippingOptions,
      },
    };
  }

  private async callAPI(method: string, params: object): Promise<any> {
    const timestamp = new Date().toISOString();
    const sign = this.generateSignature(method, params, timestamp);

    const response = await fetch(`${this.baseUrl}/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': this.config.appKey,
        'X-Timestamp': timestamp,
        'X-Signature': sign,
      },
      body: JSON.stringify({
        method,
        params,
        appKey: this.config.appKey,
        timestamp,
        sign,
        accessToken: this.config.accessToken,
        signMethod: 'sha256',
      }),
    });

    const result = await response.json();

    if (result.errorCode) {
      throw new Error(`AliExpress API error: ${result.errorMessage}`);
    }

    return result.result;
  }

  private generateSignature(
    method: string,
    params: object,
    timestamp: string
  ): string {
    // AliExpress HMAC-SHA256 signature generation
    const sortedParams = Object.keys(params)
      .sort()
      .map(k => `${k}${params[k as keyof typeof params]}`)
      .join('');

    const signString = `POST\n${this.baseUrl}\n/rpc\n${method}${sortedParams}${timestamp}`;

    return crypto
      .createHmac('sha256', this.config.appSecret)
      .update(signString)
      .digest('hex')
      .toUpperCase();
  }
}
```

### 4. TikTok Shop API

| Aspect | Details |
|--------|---------|
| **Endpoint** | `https://partner.tiktokshop.com` |
| **Authentication** | OAuth 2.0 Client Credentials |
| **Rate Limit** | Varies by plan |
| **Cost** | Free with developer account |
| **Data Provided** | Trending products, viral metrics, creator data |

**Data Points to Collect:**

```typescript
interface TikTokData {
  trendingProducts: {
    productId: string;
    title: string;
    url: string;                     // TikTok Shop link
    videoCount: number;
    totalViews: number;
    avgVideoViews: number;
    trendingScore: number;           // 0-100 algorithm score
    relatedHashtags: {
      tag: string;
      viewCount: number;
      videoCount: number;
    }[];
    price: {
      amount: number;
      currency: string;
    };
    creatorCount: number;
    avgEngagementRate: number;
  }[];

  platformInsights: {
    avgEngagementRate: number;
    viralPotential: number;
    trendingCategory: string;
    topHashtags: string[];
  };
}
```

### 5. Third-Party Market Research APIs (Premium)

If direct APIs aren't accessible, these premium services provide aggregated data:

| Service | Best For | Cost | API Available |
|---------|----------|------|---------------|
| **SEMrush** | Keyword research, CPC | $119.95+/mo | Yes (Enterprise) |
| **Ahrefs** | Backlinks, keywords | $99+/mo | Yes (Enterprise $1,499+) |
| **Helium 10** | Amazon product data | $19.99-$99.99/mo | Yes |
| **Jungle Scout** | Amazon sales estimates | $29-$129/mo | API available |
| **Niche Scraper** | Shopify spy | $49.95/mo | Limited |

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)

**Objective:** Set up API connections and data normalization layer

```
Tasks:
├── Set up API credentials for all services
├── Create data collector abstraction layer
├── Implement response caching system
├── Build error handling and retry logic
└── Set up monitoring and logging
```

**Deliverables:**

```typescript
// src/lib/collectors/baseCollector.ts

interface CollectorConfig {
  apiKey: string;
  apiSecret?: string;
  accessToken?: string;
  baseUrl: string;
  rateLimit: {
    requests: number;
    period: number;  // seconds
  };
}

abstract class BaseCollector {
  protected config: CollectorConfig;
  private requestQueue: Promise<any>[] = [];
  private lastRequestTime: number = 0;

  constructor(config: CollectorConfig) {
    this.config = config;
  }

  protected async throttledRequest<T>(
    request: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = (this.config.rateLimit.period * 1000) /
                        this.config.rateLimit.requests;

    if (timeSinceLastRequest < minInterval) {
      await new Promise(r =>
        setTimeout(r, minInterval - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    return request();
  }

  protected async fetchWithRetry<T>(
    request: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.throttledRequest(request);
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;

        // Exponential backoff
        await new Promise(r =>
          setTimeout(r, Math.pow(2, attempt) * 1000)
        );
      }
    }
    throw new Error('Max retries exceeded');
  }
}
```

### Phase 2: Primary API Integration (Week 3-4)

**Objective:** Connect Google Trends, AliExpress, and TikTok APIs

```
Tasks:
├── Implement Google Trends data collection
├── Implement AliExpress product/supplier search
├── Implement TikTok trending products
├── Build data normalization transformers
└── Create cache layer for API responses
```

### Phase 3: Amazon Data Integration (Week 5-6)

**Objective:** Add Amazon product and competition data

```
Tasks:
├── Set up Amazon Associates account (if not done)
├── Implement PA-API or integrate Helium 10 API
├── Build ASIN lookup and sales estimation
├── Implement review and rating tracking
└── Add competitor analysis features
```

### Phase 4: UI Enhancement (Week 7-8)

**Objective:** Update UI to show real links and data

```
Tasks:
├── Add clickable product links to results
├── Display supplier store URLs
├── Show API data source attribution
├── Implement data freshness indicators
└── Add confidence scores based on data completeness
```

### Phase 5: Testing & Optimization (Week 9-10)

**Objective:** Ensure reliability and performance

```
Tasks:
├── Load testing with multiple concurrent requests
├── API cost optimization
├── Implement circuit breakers for failed APIs
├── Create fallback data strategies
└── Performance optimization
```

---

## Cost Analysis

### Monthly Operating Costs

| Service | Tier | Monthly Cost | Limits |
|---------|------|-------------|--------|
| **Google Trends API** | Free | $0 | 100 requests/day |
| **Google Trends API** | Pay-as-you-go | $50+ | Based on usage |
| **AliExpress API** | Dropshipper | $0 | Requires account |
| **TikTok Shop API** | Developer | $0 | Requires approval |
| **Amazon PA-API** | Associates | $0* | Requires 3 sales/30 days |
| **SEMrush** | Pro | $119.95 | Limited API |
| **Helium 10** | Starter | $19.99 | Basic API |
| **Helium 10** | Platinum | $99.99 | Full API access |
| **Jungle Scout** | Suite | $49 | API access included |

*Amazon PA-API is free but requires active affiliate account

### Minimum Viable Stack (Free)

| Source | Data Type | Cost |
|--------|-----------|------|
| Google Trends | PyTrends (unofficial) | $0 |
| AliExpress | Official API | $0 |
| TikTok | Partner API | $0 |
| Amazon | Manual (no API) | $0 |

### Recommended Stack ($50-150/month)

| Source | Data Type | Cost |
|--------|-----------|------|
| Google Trends | Official API | $50 |
| AliExpress | Official API | $0 |
| TikTok | Partner API | $0 |
| Amazon | Helium 10 Starter | $19.99 |
| Keyword Data | SEMrush Lite | $39.95 |

### Enterprise Stack ($200-500/month)

| Source | Data Type | Cost |
|--------|-----------|------|
| Google Trends | Official API | $50 |
| AliExpress | Official API | $0 |
| TikTok | Partner API | $0 |
| Amazon | Helium 10 Platinum | $99.99 |
| Keyword Data | SEMrush Pro | $119.95 |
| Competition | Ahrefs Lite | $99 |

---

## Technical Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE (React)                      │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  NicheInput → ValidationForm → ResultsDisplay           │     │
│  └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Node.js)                      │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Rate Limiter → Auth Middleware → Cache Layer           │     │
│  │  Error Handler → Request Validator                      │     │
│  └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Google     │    │   Amazon      │    │  AliExpress   │
│   Trends     │    │   PA-API      │    │   Open API    │
│   Service    │    │   Service     │    │   Service     │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA PROCESSING LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Normalizer │  │  Validator   │  │  Calculator  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CACHE LAYER (Redis)                         │
│  - Niche data: TTL 1 hour                                       │
│  - Product data: TTL 30 minutes                                  │
│  - Supplier data: TTL 24 hours                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input: "outdoor solar lighting"
    │
    ▼
┌──────────────────────────────────────┐
│  1. Niche Validation                  │
│  ┌──────────────────────────────────┐ │
│  │ Google Trends → Demand Score      │ │
│  │ Keyword Data → Competition Score  │ │
│  │ Market Size → Profitability Score │ │
│  └──────────────────────────────────┘ │
└──────────────────┬───────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
    Score >= 50?        Score < 50?
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│ 2. Product       │  │ Return Low      │
│    Discovery     │  │ Score Result    │
│ ┌──────────────┐ │  └─────────────────┘
│ │ AliExpress   │ │
│ │ Product      │ │
│ │ Search       │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Amazon       │ │
│ │ Competition  │ │
│ │ Analysis     │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ TikTok       │ │
│ │ Virality     │ │
│ │ Score        │ │
│ └──────────────┘ │
└────────┬──────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  3. Product Scoring                   │
│  ┌──────────────────────────────────┐ │
│  │ Margin Calculator                │ │
│  │ Supplier Reliability Checker     │ │
│  │ Competition Analyzer             │ │
│  │ Risk Assessor                    │ │
│  └──────────────────────────────────┘ │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  4. Results Assembly                  │
│  ┌──────────────────────────────────┐ │
│  │ Ranked Product List              │ │
│  │ with Direct Links                │ │
│  │ + Confidence Scores             │ │
│  │ + Data Source Attribution        │ │
│  └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## Data Collection Workflow

### Complete Flow Diagram

```
                    ┌─────────────────┐
                    │   User Input    │
                    │ "outdoor solar  │
                    │    lighting"    │
                    └────────┬────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   STEP 1: Keyword Expansion   │
              │  ┌────────────────────────┐  │
              │  │ • Main keyword         │  │
              │  │ • Related queries      │  │
              │  │ • Category mapping    │  │
              │  │ • Synonyms             │  │
              │  └────────────────────────┘  │
              └────────────┬─────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Google      │   │   SEMrush     │   │  Amazon       │
│   Trends      │   │   Keyword     │   │  Search       │
│   API         │   │   API         │   │  Results      │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
              ┌──────────────────────────────┐
              │   STEP 2: Data Normalization  │
              │  ┌────────────────────────┐  │
              │  │ • Scale to 0-100       │  │
              │  │ • Remove outliers      │  │
              │  │ • Calculate growth %   │  │
              │  │ • Assign confidence    │  │
              │  └────────────────────────┘  │
              └────────────┬─────────────────┘
                            │
                            ▼
              ┌──────────────────────────────┐
              │   STEP 3: Niche Scoring      │
              │  ┌────────────────────────┐  │
              │  │ Demand Score (30%)     │  │
              │  │ Competition Score (25%)│  │
              │  │ Profitability (25%)    │  │
              │  │ Accessibility (10%)    │  │
              │  │ Feasibility (10%)      │  │
              │  └────────────────────────┘  │
              │         │                    │
              │         ▼                    │
              │    ┌────────────┐             │
              │    │  FINAL    │             │
              │    │  NICHE    │             │
              │    │  SCORE    │             │
              │    └────────────┘             │
              └────────────┬─────────────────┘
                            │
                   ┌────────┴────────┐
                   │  Score >= 50?  │
                   └────────┬────────┘
                            │
          ┌─────────────────┤─────────────────┐
          │ NO              │ YES             │
          ▼                 ▼                 ▼
   ┌────────────┐    ┌───────────────┐  ┌───────────────┐
   │ Return     │    │ AliExpress    │  │ TikTok Shop  │
   │ Low Score  │    │ Product       │  │ Trending      │
   │ Result     │    │ Search        │  │ Products      │
   └────────────┘    └───────┬───────┘  └───────┬───────┘
                              │                  │
                              └────────┬─────────┘
                                       ▼
                          ┌─────────────────────┐
                          │ STEP 4: Product     │
                          │ Analysis            │
                          │ ┌─────────────────┐ │
                          │ │ Margin Calc     │ │
                          │ │ Supplier Rating │ │
                          │ │ Competition     │ │
                          │ │ Return Rate     │ │
                          │ │ Social Proof   │ │
                          │ └─────────────────┘ │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │ STEP 5: Product     │
                          │ Ranking & Linking   │
                          │ ┌─────────────────┐ │
                          │ │ Tier 1 (80+)    │ │
                          │ │   → REAL LINKS  │ │
                          │ │ Tier 2 (65-79)  │ │
                          │ │   → REAL LINKS  │ │
                          │ │ Tier 3 (50-64)  │ │
                          │ │   → REAL LINKS  │ │
                          │ └─────────────────┘ │
                          └─────────────────────┘
```

---

## Error Handling & Fallbacks

### API Failure Strategy

```typescript
// src/lib/collectors/fallbackStrategy.ts

interface FallbackChain {
  primary: () => Promise<Data>;
  fallbacks: Array<{
    source: string;
    fetcher: () => Promise<Data>;
    weight: number;  // How much to trust this source
  }>;
}

async function collectWithFallbacks(chain: FallbackChain): Promise<Data> {
  let lastError: Error | null = null;
  const results: Data[] = [];

  // Try primary source
  try {
    return await chain.primary();
  } catch (error) {
    lastError = error as Error;
    console.warn(`Primary source failed: ${lastError.message}`);
  }

  // Try fallback sources
  for (const fallback of chain.fallbacks) {
    try {
      const data = await fallback.fetcher();
      results.push(data);

      // If we have enough data from fallbacks, combine them
      if (results.length >= 2) {
        return weightedAverage(results, chain.fallbacks);
      }
    } catch (error) {
      console.warn(`Fallback ${fallback.source} failed:`, error);
    }
  }

  // All sources failed - return cached data or error
  throw new Error(
    `All data sources failed. Last error: ${lastError?.message}`
  );
}

// Data source fallbacks for each category
const FALLBACK_STRATEGY = {
  searchTrends: {
    primary: () => googleTrendsAPI.getTrends(niche),
    fallbacks: [
      {
        source: 'pytrends',
        fetcher: () => pytrendsService.getTrends(niche),
        weight: 0.8,
      },
      {
        source: 'semrush',
        fetcher: () => semrushAPI.getKeywordData(niche),
        weight: 0.5,
      },
    ],
  },

  productData: {
    primary: () => aliExpressAPI.searchProducts(niche),
    fallbacks: [
      {
        source: 'amazon',
        fetcher: () => amazonAPI.searchProducts(niche),
        weight: 0.6,
      },
      {
        source: 'helium10',
        fetcher: () => helium10API.getProducts(niche),
        weight: 0.7,
      },
    ],
  },

  supplierData: {
    primary: () => aliExpressAPI.getSupplierInfo(supplierId),
    fallbacks: [
      {
        source: 'manual',
        fetcher: () => scrapeSupplierPage(supplierId),
        weight: 0.3,
      },
    ],
  },
};
```

### Circuit Breaker Implementation

```typescript
// src/lib/circuitBreaker.ts

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000  // 1 minute
  ) {}

  async execute<T>(request: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await request();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}

// Usage in API services
const googleTrendsCircuit = new CircuitBreaker(3, 30000);
const amazonCircuit = new CircuitBreaker(5, 60000);
const aliExpressCircuit = new CircuitBreaker(5, 60000);
```

---

## Future Enhancements

### Phase 6: AI Integration

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| **GPT-4 Analysis** | AI-generated niche reports | High |
| **Sentiment Analysis** | Reddit/social sentiment on products | Medium |
| **Predictive Scoring** | ML models for trend prediction | Medium |
| **Competitor Detection** | Identify successful Shopify stores | Medium |

### Phase 7: Advanced Features

| Feature | Description |
|---------|-------------|
| **Watchlist** | Monitor niches over time |
| **Alerts** | Notify when niches hit thresholds |
| **Export** | CSV/PDF reports for clients |
| **API Access** | Let users integrate via API |
| **White Label** | Branded versions for agencies |

### Phase 8: Marketplace Integration

| Integration | Data Shared |
|-------------|-------------|
| **DSers** | Auto-import winning products |
| **AutoDS** | Automated order fulfillment |
| **Spocket** | US/EU suppliers |
| **Shopify** | Direct product import |

---

## Quick Start: Minimum Viable Real Data

For immediate implementation with minimal cost:

```bash
# 1. Get Free API Keys
- Google: https://console.cloud.google.com/apis/library/trends.googleapis.com
- AliExpress: https://openservice.aliexpress.com
- TikTok: https://partner.tiktokshop.com

# 2. Install Dependencies
npm install @google-cloud/trends axios redis

# 3. Set Environment Variables
export GOOGLE_TRENDS_API_KEY=your_key
export ALIEXPRESS_APP_KEY=your_key
export ALIEXPRESS_APP_SECRET=your_secret
```

The minimum viable implementation requires:
1. **Google Trends** - For search demand data
2. **AliExpress API** - For supplier and product data
3. **Manual Amazon data** - Via Helium 10 or Jungle Scout manual tools

This gives you 80% of the functionality at near-zero cost.

---

## Conclusion

The path from simulated data to real, live data sources requires:

1. **Time Investment:** 8-10 weeks for full implementation
2. **Monetary Investment:** $50-150/month for premium APIs
3. **Technical Investment:** API integration, caching, error handling
4. **Account Requirements:** Amazon Associates, AliExpress Dropshipper, TikTok Partner

The most cost-effective approach is to start with:
- Free APIs (Google Trends unofficial, AliExpress, TikTok)
- Manual Amazon data (Helium 10 Starter)
- Scale up as the tool generates revenue

Would you like me to proceed with implementing any specific phase of this optimization plan?
