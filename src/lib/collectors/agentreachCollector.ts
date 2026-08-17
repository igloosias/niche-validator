// Agent-Reach Collector
// Social media scraping for Twitter, Reddit, YouTube, GitHub
// Docs: https://github.com/Panniantong/Agent-Reach

// Note: This collector interfaces with the Python backend server
// Server URL (configure in .env): VITE_SCRAPER_SERVER_URL

const SERVER_URL = import.meta.env.VITE_SCRAPER_SERVER_URL || '';

export interface SocialPost {
  id?: string;
  title: string;
  content?: string;
  score: number;
  comments: number;
  url?: string;
  author?: string;
  platform: Platform;
  sentiment?: 'positive' | 'negative' | 'neutral';
  engagement?: number;
  createdAt?: string;
}

export type Platform = 'reddit' | 'twitter' | 'youtube' | 'github' | 'bilibili' | 'xiaohongshu';

export interface SocialAnalysis {
  platform: Platform;
  posts: SocialPost[];
  totalMentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  avgScore: number;
  engagementRate: number;
  painPoints: string[];
  opportunities: string[];
  source: string;
}

export interface FullSocialAnalysis {
  reddit: SocialAnalysis | null;
  twitter: SocialAnalysis | null;
  youtube: SocialAnalysis | null;
  github: SocialAnalysis | null;
  timestamp: string;
  overallSentiment: 'positive' | 'negative' | 'neutral';
  totalMentions: number;
}

// Check if backend server is available
export function isAgentReachAvailable(): boolean {
  return SERVER_URL.length > 0;
}

// Get social media data for a keyword
export async function getSocialAnalysis(keyword: string): Promise<FullSocialAnalysis> {
  if (!isAgentReachAvailable()) {
    return generateMockAnalysis(keyword);
  }

  try {
    const response = await fetch(`${SERVER_URL}/social/${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      return generateMockAnalysis(keyword);
    }

    const data = await response.json();
    return transformToAnalysis(data);
  } catch (error) {
    console.error('Agent-Reach error:', error);
    return generateMockAnalysis(keyword);
  }
}

// Get platform-specific data
export async function getPlatformData(
  keyword: string,
  platform: Platform
): Promise<SocialAnalysis | null> {
  if (!isAgentReachAvailable()) {
    const mock = generateMockAnalysis(keyword);
    const platformData = mock[platform as keyof Omit<FullSocialAnalysis, 'timestamp' | 'overallSentiment' | 'totalMentions'>];
    return platformData || null;
  }

  try {
    const response = await fetch(`${SERVER_URL}/social/${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const platformData = data[platform];
    if (platformData) {
      return transformPlatformData(platformData, platform);
    }
    return null;
  } catch (error) {
    console.error(`Agent-Reach ${platform} error:`, error);
    return null;
  }
}

// Get Reddit data specifically
export async function getRedditData(keyword: string): Promise<SocialAnalysis | null> {
  return getPlatformData(keyword, 'reddit');
}

// Get Twitter data specifically
export async function getTwitterData(keyword: string): Promise<SocialAnalysis | null> {
  return getPlatformData(keyword, 'twitter');
}

// Get YouTube data specifically
export async function getYouTubeData(keyword: string): Promise<SocialAnalysis | null> {
  return getPlatformData(keyword, 'youtube');
}

// Transform API response to SocialAnalysis format
function transformToAnalysis(data: Record<string, any>): FullSocialAnalysis {
  const result: FullSocialAnalysis = {
    reddit: null,
    twitter: null,
    youtube: null,
    github: null,
    timestamp: new Date().toISOString(),
    overallSentiment: 'neutral',
    totalMentions: 0
  };

  const sentiments: ('positive' | 'negative' | 'neutral')[] = [];
  let totalMentions = 0;

  for (const [platform, platformData] of Object.entries(data)) {
    if (platform === 'timestamp') continue;

    const analysis = transformPlatformData(platformData, platform as Platform);
    if (analysis) {
      result[platform as keyof Pick<FullSocialAnalysis, 'reddit' | 'twitter' | 'youtube' | 'github'>] = analysis;
      sentiments.push(analysis.sentiment);
      totalMentions += analysis.totalMentions;
    }
  }

  // Calculate overall sentiment
  const positiveCount = sentiments.filter(s => s === 'positive').length;
  const negativeCount = sentiments.filter(s => s === 'negative').length;

  if (positiveCount > negativeCount) {
    result.overallSentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    result.overallSentiment = 'negative';
  } else {
    result.overallSentiment = 'neutral';
  }

  result.totalMentions = totalMentions;

  return result;
}

function transformPlatformData(data: any, platform: Platform): SocialAnalysis | null {
  if (!data) return null;

  return {
    platform,
    posts: data.posts?.map((p: any) => ({
      title: p.title || p.content || 'Untitled',
      score: p.score || 0,
      comments: p.comments || 0,
      url: p.url,
      platform
    })) || [],
    totalMentions: data.total_mentions || data.totalMentions || 0,
    sentiment: data.sentiment || 'neutral',
    avgScore: data.avg_score || data.avgScore || 0,
    engagementRate: data.engagement_rate || data.engagementRate || 0,
    painPoints: extractPainPoints(data.posts || []),
    opportunities: extractOpportunities(data.posts || []),
    source: data.source || `agent-reach (${platform})`
  };
}

// Extract pain points from posts
function extractPainPoints(posts: any[]): string[] {
  const painKeywords = ['problem', 'issue', 'broken', 'cheap', 'bad', 'hate', 'worst', 'disappointed', 'defective', 'waste'];
  const painPoints: string[] = [];

  posts.forEach(post => {
    const text = `${post.title || ''} ${post.content || ''}`.toLowerCase();
    painKeywords.forEach(keyword => {
      if (text.includes(keyword) && !painPoints.includes(keyword)) {
        painPoints.push(`Quality concerns: ${keyword}`);
      }
    });
  });

  return painPoints.slice(0, 5);
}

// Extract opportunities from posts
function extractOpportunities(posts: any[]): string[] {
  const opportunityKeywords = ['love', 'best', 'amazing', 'perfect', 'great', 'recommend', 'awesome', 'fantastic', 'excellent'];
  const opportunities: string[] = [];

  posts.forEach(post => {
    const text = `${post.title || ''} ${post.content || ''}`.toLowerCase();
    opportunityKeywords.forEach(keyword => {
      if (text.includes(keyword) && !opportunities.includes(keyword)) {
        opportunities.push(`Customer satisfaction: ${keyword}`);
      }
    });
  });

  return opportunities.slice(0, 5);
}

// Generate mock data when server is unavailable
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

function generateMockAnalysis(keyword: string): FullSocialAnalysis {
  const random = seededRandom(keyword + 'social');
  const platforms: Platform[] = ['reddit', 'twitter', 'youtube'];

  const analyses: Record<Platform, SocialAnalysis> = {} as any;
  const sentiments: ('positive' | 'negative' | 'neutral')[] = [];
  let totalMentions = 0;

  platforms.forEach(platform => {
    const sentiment: 'positive' | 'negative' | 'neutral' = random() > 0.5 ? 'positive' : random() > 0.3 ? 'neutral' : 'negative';
    sentiments.push(sentiment);

    const posts: SocialPost[] = [];
    const topicTitles: Record<Platform, string[]> = {
      reddit: [
        `Anyone have experience with ${keyword}?`,
        `Best ${keyword} products - Honest review`,
        `Warning about ${keyword} - Read before buying`,
        `${keyword} dropshipping - My journey`
      ],
      twitter: [
        `Just got my ${keyword} - WOW!`,
        `${keyword} review - 1 week later`,
        `Why ${keyword} is trending`,
        `${keyword} unboxing`
      ],
      youtube: [
        `Complete ${keyword} Buying Guide`,
        `Top 5 ${keyword} Products Review`,
        `${keyword} vs Brand Name - Comparison`,
        `Honest ${keyword} Review 2024`
      ],
      github: [],
      bilibili: [],
      xiaohongshu: []
    };

    const titles = topicTitles[platform] || [];
    titles.forEach((title, i) => {
      posts.push({
        title,
        score: Math.round(100 + random() * 2000),
        comments: Math.round(20 + random() * 500),
        platform,
        sentiment
      });
    });

    const mentions = Math.round(500 + random() * 5000);
    totalMentions += mentions;

    analyses[platform] = {
      platform,
      posts,
      totalMentions: mentions,
      sentiment,
      avgScore: Math.round((500 + random() * 1000) * 100) / 100,
      engagementRate: Math.round((2 + random() * 8) * 100) / 100,
      painPoints: sentiment === 'negative' ? [
        'Quality inconsistencies',
        'Shipping delays reported',
        'Customer service concerns'
      ] : [],
      opportunities: sentiment === 'positive' ? [
        'High customer satisfaction',
        'Growing demand',
        'Repeat purchase potential'
      ] : [],
      source: 'agent-reach (Simulated)'
    };
  });

  // Calculate overall sentiment
  const positiveCount = sentiments.filter(s => s === 'positive').length;
  const overallSentiment: 'positive' | 'negative' | 'neutral' =
    positiveCount > sentiments.length / 2 ? 'positive' :
    positiveCount < sentiments.length / 2 ? 'negative' : 'neutral';

  return {
    ...analyses,
    timestamp: new Date().toISOString(),
    overallSentiment,
    totalMentions
  };
}

// Get Agent-Reach status for UI
export function getAgentReachStatus(): {
  available: boolean;
  platforms: Platform[];
  features: string[];
} {
  return {
    available: isAgentReachAvailable(),
    platforms: ['reddit', 'twitter', 'youtube', 'github'],
    features: [
      'Multi-platform scraping',
      'Sentiment analysis',
      'Pain point extraction',
      'Opportunity identification',
      'Engagement metrics'
    ]
  };
}
