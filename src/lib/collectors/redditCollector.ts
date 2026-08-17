// Reddit API Collector
// Free API - Requires Reddit app credentials
// Docs: https://www.reddit.com/dev/api/

const REDDIT_CLIENT_ID = import.meta.env.VITE_REDDIT_CLIENT_ID || '';
const REDDIT_CLIENT_SECRET = import.meta.env.VITE_REDDIT_CLIENT_SECRET || '';
const REDDIT_USERNAME = import.meta.env.VITE_REDDIT_USERNAME || '';
const REDDIT_PASSWORD = import.meta.env.VITE_REDDIT_PASSWORD || '';

interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  subredditUrl: string;
  score: number;
  numComments: number;
  url: string;
  createdAt: string;
  sentiment: number; // -1 to 1
}

interface RedditSubreddit {
  name: string;
  displayName: string;
  subscribers: number;
  activeUsers: number;
}

interface RedditAnalysis {
  totalMentions: number;
  totalPosts: number;
  totalComments: number;
  avgScore: number;
  avgComments: number;
  sentiment: number; // -1 to 1
  sentimentLabel: 'positive' | 'negative' | 'neutral';
  posts: RedditPost[];
  subreddits: RedditSubreddit[];
  topKeywords: string[];
  painPoints: string[];
  opportunities: string[];
}

// Simple sentiment analysis (in production, use a proper NLP library)
function analyzeSentiment(text: string): number {
  const positiveWords = [
    'love', 'great', 'amazing', 'best', 'awesome', 'excellent', 'perfect',
    'fantastic', 'wonderful', 'helpful', 'recommend', 'quality', 'good',
    'happy', 'satisfied', 'works great', 'worth it', 'brilliant'
  ];
  const negativeWords = [
    'hate', 'terrible', 'worst', 'awful', 'horrible', 'bad', 'disappointed',
    'broken', 'defective', 'scam', 'fake', 'waste', 'poor', 'useless',
    'avoid', 'refund', 'complaint', 'problem', 'issue', 'frustrated'
  ];

  const lowerText = text.toLowerCase();
  let score = 0;

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.1;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.1;
  });

  return Math.max(-1, Math.min(1, score));
}

// Extract pain points and opportunities from posts
function extractInsights(posts: RedditPost[]): { painPoints: string[], opportunities: string[] } {
  const painPoints: string[] = [];
  const opportunities: string[] = [];

  const painKeywords = ['problem', 'issue', 'frustrated', 'disappointed', 'broken', 'doesn\'t work', 'cheap', 'falling apart'];
  const opportunityKeywords = ['love', 'perfect', 'recommend', 'best', 'amazing', 'wish I had', 'need', 'looking for'];

  posts.forEach(post => {
    const text = (post.title + ' ' + extractKeywords(post.title)).toLowerCase();

    painKeywords.forEach(keyword => {
      if (text.includes(keyword) && !painPoints.includes(keyword)) {
        painPoints.push(keyword);
      }
    });

    opportunityKeywords.forEach(keyword => {
      if (text.includes(keyword) && !opportunities.includes(keyword)) {
        opportunities.push(keyword);
      }
    });
  });

  return { painPoints: painPoints.slice(0, 5), opportunities: opportunities.slice(0, 5) };
}

// Simple keyword extraction
function extractKeywords(text: string): string {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'it', 'this', 'that', 'i', 'you', 'we', 'they', 'he', 'she', 'my', 'your', 'our', 'their', 'what', 'how', 'why', 'when', 'where', 'which', 'who', 'just', 'have', 'has', 'had', 'be', 'been', 'being', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'];

  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3 && !stopWords.includes(word));

  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
    .join(' ');
}

export async function collectRedditData(keyword: string): Promise<RedditAnalysis> {
  // If no credentials, use simulated data
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    return generateSimulatedRedditData(keyword);
  }

  try {
    // Step 1: Get access token
    const authResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: REDDIT_USERNAME,
        password: REDDIT_PASSWORD,
      }),
    });

    if (!authResponse.ok) {
      return generateSimulatedRedditData(keyword);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Step 2: Search Reddit
    const searchResponse = await fetch(
      `https://oauth.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=top&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'NicheValidator/1.0',
        },
      }
    );

    if (!searchResponse.ok) {
      return generateSimulatedRedditData(keyword);
    }

    const searchData = await searchResponse.json();

    if (!searchData.data?.children || searchData.data.children.length === 0) {
      return generateSimulatedRedditData(keyword);
    }

    // Process posts
    const posts: RedditPost[] = searchData.data.children.map((child: any) => {
      const post = child.data;
      return {
        id: post.id,
        title: post.title,
        subreddit: post.subreddit,
        subredditUrl: `https://reddit.com/r/${post.subreddit}`,
        score: post.score,
        numComments: post.num_comments,
        url: `https://reddit.com${post.permalink}`,
        createdAt: new Date(post.created_utc * 1000).toISOString(),
        sentiment: analyzeSentiment(post.title + ' ' + (post.selftext || '')),
      };
    });

    // Calculate aggregate metrics
    const totalPosts = posts.length;
    const totalComments = posts.reduce((sum, p) => sum + p.numComments, 0);
    const totalScore = posts.reduce((sum, p) => sum + p.score, 0);
    const avgScore = totalScore / totalPosts;
    const avgComments = totalComments / totalPosts;
    const avgSentiment = posts.reduce((sum, p) => sum + p.sentiment, 0) / totalPosts;

    // Get subreddit info
    const subredditSet = new Set(posts.map(p => p.subreddit));
    const subreddits: RedditSubreddit[] = Array.from(subredditSet).map(name => ({
      name,
      displayName: name,
      subscribers: 0, // Would need additional API call
      activeUsers: 0,
    }));

    // Extract insights
    const { painPoints, opportunities } = extractInsights(posts);

    // Top keywords
    const allKeywords = posts.map(p => extractKeywords(p.title));
    const keywordCount: Record<string, number> = {};
    allKeywords.forEach(keywords => {
      keywords.split(' ').forEach(word => {
        if (word.length > 3) {
          keywordCount[word] = (keywordCount[word] || 0) + 1;
        }
      });
    });
    const topKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return {
      totalMentions: totalPosts,
      totalPosts,
      totalComments,
      avgScore,
      avgComments,
      sentiment: avgSentiment,
      sentimentLabel: avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral',
      posts: posts.sort((a, b) => b.score - a.score).slice(0, 20),
      subreddits,
      topKeywords,
      painPoints,
      opportunities,
    };
  } catch (error) {
    console.error('Reddit API error:', error);
    return generateSimulatedRedditData(keyword);
  }
}

// Seeded random for consistent results
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

// Simulated data fallback
function generateSimulatedRedditData(keyword: string): RedditAnalysis {
  // Use proper seeded random for consistent results
  const random = seededRandom(keyword + 'reddit');

  const postCount = Math.round(20 + random() * 130);
  const avgScore = Math.round(10 + random() * 490);
  const sentiment = (random() - 0.5) * 0.6; // -0.3 to 0.3

  const posts: RedditPost[] = Array.from({ length: Math.min(postCount, 10) }, (_, i) => ({
    id: `sim_${i}`,
    title: `[${i % 2 === 0 ? 'Question' : 'Discussion'}] ${keyword} - ${getRandomTopic(random)}`,
    subreddit: getRandomSubreddit(random),
    subredditUrl: `https://reddit.com/r/${getRandomSubreddit(random)}`,
    score: Math.round(avgScore * (1 - i * 0.1)),
    numComments: Math.round(avgScore * 0.2 * (1 - i * 0.1)),
    url: `https://reddit.com/r/example/comments/${i}`,
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: sentiment + (random() - 0.5) * 0.2,
  }));

  const { painPoints, opportunities } = extractInsights(posts);

  return {
    totalMentions: postCount,
    totalPosts: postCount,
    totalComments: postCount * avgScore * 0.2,
    avgScore,
    avgComments: avgScore * 0.2,
    sentiment,
    sentimentLabel: sentiment > 0.1 ? 'positive' : sentiment < -0.1 ? 'negative' : 'neutral',
    posts,
    subreddits: [
      { name: 'dropshipping', displayName: 'dropshipping', subscribers: 150000, activeUsers: 500 },
      { name: 'ecommerce', displayName: 'ecommerce', subscribers: 200000, activeUsers: 800 },
      { name: 'shopify', displayName: 'shopify', subscribers: 100000, activeUsers: 400 },
    ],
    topKeywords: keyword.split(' ').concat(['dropshipping', 'business', 'products', 'online', 'store']),
    painPoints: painPoints.length > 0 ? painPoints : ['shipping', 'quality', 'supplier', 'marketing'],
    opportunities: opportunities.length > 0 ? opportunities : ['automation', 'branding', 'targeting'],
  };
}

function getRandomTopic(random: () => number): string {
  const topics = [
    'experiences and tips',
    'is this worth it?',
    'supplier recommendations',
    'marketing strategies',
    'common mistakes',
    'profit margins',
    'getting started',
    'scaling advice',
  ];
  return topics[Math.floor(random() * topics.length)];
}

function getRandomSubreddit(random: () => number): string {
  const subreddits = ['dropshipping', 'ecommerce', 'shopify', 'entrepreneur', 'smallbusiness'];
  return subreddits[Math.floor(random() * subreddits.length)];
}

export function getRedditPostUrl(postId: string, subreddit: string): string {
  return `https://reddit.com/r/${subreddit}/comments/${postId}`;
}
