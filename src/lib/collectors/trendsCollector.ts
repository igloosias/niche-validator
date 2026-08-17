// Google Trends Data Collector
// Free API - Uses unofficial PyTrends-like approach or official API
// For production, run PyTrends on server side

// Since we can't use PyTrends directly in browser, we'll simulate Google Trends data
// based on keyword analysis and provide integration points for server-side calls

interface TrendData {
  interestOverTime: { date: string; value: number }[];
  currentInterest: number;
  trendDirection: 'rising' | 'stable' | 'falling';
  relatedQueries: { query: string; value: number; trend: 'rising' | 'falling' | 'stable' }[];
  relatedTopics: { topic: string; value: number; type: string }[];
  geoDistribution: { country: string; code: string; value: number }[];
  seasonality: 'none' | 'mild' | 'strong';
  seasonalityMonths: string[];
  growthRate: number;
}

interface TrendAnalysis {
  score: number;
  demandLevel: 'high' | 'medium' | 'low';
  trendIndicator: 'rising' | 'stable' | 'declining';
  seasonality: string;
  topQueries: string[];
  recommendations: string[];
}

// Simulate Google Trends data based on keyword characteristics
export async function collectGoogleTrendsData(keyword: string): Promise<TrendData> {
  // In production, this would call a server-side endpoint running PyTrends
  // For now, generate realistic simulated data based on keyword analysis

  // Use seeded random for consistent results
  const random = seededRandom(keyword);
  const baseInterest = calculateBaseInterest(keyword, random);
  const trendDirection = calculateTrendDirection(keyword, random);
  const growthRate = calculateGrowthRate(keyword, random);

  // Generate 12 months of data
  const interestOverTime = generateTrendTimeSeries(baseInterest, trendDirection, growthRate, random);

  // Generate related queries
  const relatedQueries = generateRelatedQueries(keyword, baseInterest, random);

  return {
    interestOverTime,
    currentInterest: interestOverTime[interestOverTime.length - 1]?.value || baseInterest,
    trendDirection,
    relatedQueries,
    relatedTopics: generateRelatedTopics(keyword),
    geoDistribution: generateGeoDistribution(),
    seasonality: detectSeasonality(keyword),
    seasonalityMonths: getSeasonalityMonths(keyword),
    growthRate,
  };
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

// Calculate base interest score (0-100) based on keyword analysis
function calculateBaseInterest(keyword: string, random: () => number): number {
  const lowerKeyword = keyword.toLowerCase();

  // High-demand keywords
  const highDemandPatterns = [
    'phone', 'watch', 'shoes', 'clothes', 'gift', 'home', 'kitchen',
    'beauty', 'skin', 'hair', 'fitness', 'exercise', 'pet', 'dog', 'cat'
  ];

  // Medium-demand keywords
  const mediumDemandPatterns = [
    'organizer', 'holder', 'charger', 'light', 'lamp', 'case', 'bag',
    'storage', 'cleaning', 'kitchen', 'garden', 'outdoor', 'camping'
  ];

  // Check for product-related terms
  const productTerms = ['best', 'top', 'review', 'cheap', 'affordable', 'sale', 'discount'];
  const hasProductTerms = productTerms.some(term => lowerKeyword.includes(term));

  // Check for question-based searches (higher intent)
  const questionTerms = ['how to', 'what is', 'why', 'best way to'];
  const hasQuestionTerms = questionTerms.some(term => lowerKeyword.includes(term));

  let baseScore = 40; // Default medium

  // Adjust based on patterns
  if (highDemandPatterns.some(p => lowerKeyword.includes(p))) {
    baseScore = 70 + random() * 20;
  } else if (mediumDemandPatterns.some(p => lowerKeyword.includes(p))) {
    baseScore = 50 + random() * 20;
  }

  // Boost for product-related searches
  if (hasProductTerms) baseScore += 10;
  if (hasQuestionTerms) baseScore += 15;

  // Add some randomness based on keyword hash
  const hash = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  baseScore += (hash % 20) - 10;

  return Math.max(20, Math.min(95, Math.round(baseScore)));
}

// Calculate trend direction
function calculateTrendDirection(keyword: string, random: () => number): 'rising' | 'stable' | 'falling' {
  const lowerKeyword = keyword.toLowerCase();

  // Trending patterns (2024-2025)
  const risingPatterns = [
    'solar', 'eco', 'sustainable', 'wireless', 'bluetooth', 'smart',
    'led', 'portable', 'mini', 'compact', 'travel', 'fitness', 'wellness',
    'self-care', 'skincare', 'pet', 'organize', 'minimalist'
  ];

  const decliningPatterns = [
    'vintage', 'retro', 'classic', 'traditional', 'basic'
  ];

  if (risingPatterns.some(p => lowerKeyword.includes(p))) {
    return random() > 0.3 ? 'rising' : 'stable';
  }

  if (decliningPatterns.some(p => lowerKeyword.includes(p))) {
    return random() > 0.3 ? 'falling' : 'stable';
  }

  const directions: ('rising' | 'stable' | 'falling')[] = ['rising', 'stable', 'falling'];
  const weights = [0.35, 0.4, 0.25];
  const rand = random();

  if (rand < weights[0]) return 'rising';
  if (rand < weights[0] + weights[1]) return 'stable';
  return 'falling';
}

// Calculate growth rate percentage
function calculateGrowthRate(keyword: string, random: () => number): number {
  const direction = calculateTrendDirection(keyword, random);

  if (direction === 'rising') {
    return 5 + random() * 25; // 5-30% growth
  } else if (direction === 'stable') {
    return (random() - 0.5) * 10; // -5% to +5%
  } else {
    return -5 - random() * 20; // -5% to -25% decline
  }
}

// Generate time series data
function generateTrendTimeSeries(
  baseInterest: number,
  direction: 'rising' | 'stable' | 'falling',
  growthRate: number,
  random: () => number
): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  const now = new Date();
  const monthlyGrowth = growthRate / 12 / 100;

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const dateStr = date.toISOString().slice(0, 7); // YYYY-MM format

    // Calculate value with growth and seasonality
    let value = baseInterest;

    // Apply growth
    if (direction === 'rising') {
      value = baseInterest * (1 + monthlyGrowth * (11 - i));
    } else if (direction === 'falling') {
      value = baseInterest * (1 - Math.abs(monthlyGrowth) * (11 - i));
    }

    // Add seasonality
    const month = date.getMonth();
    const seasonalMultiplier = getSeasonalMultiplier(month, baseInterest);
    value *= seasonalMultiplier;

    // Add random noise
    value += (random() - 0.5) * 10;

    data.push({
      date: dateStr,
      value: Math.max(0, Math.min(100, Math.round(value))),
    });
  }

  return data;
}

// Get seasonal multiplier based on month
function getSeasonalMultiplier(month: number, baseInterest: number): number {
  // Peak seasons
  const peaks = [10, 11]; // Nov, Dec (holiday)
  const highSeasons = [1, 2, 7, 8]; // Post-holiday, Summer

  if (peaks.includes(month)) {
    return 1.2 + (baseInterest / 100) * 0.3;
  }

  if (highSeasons.includes(month)) {
    return 1.1 + (baseInterest / 100) * 0.2;
  }

  // Low seasons
  const lowSeasons = [4, 5]; // Spring lull
  if (lowSeasons.includes(month)) {
    return 0.9;
  }

  return 1.0;
}

// Detect seasonality
function detectSeasonality(keyword: string): 'none' | 'mild' | 'strong' {
  const lowerKeyword = keyword.toLowerCase();

  const seasonalKeywords: Record<string, string[]> = {
    holiday: ['christmas', 'halloween', 'easter', 'valentine', 'gift', 'holiday'],
    summer: ['swim', 'beach', 'pool', 'camping', 'garden', 'outdoor', 'bbq'],
    winter: ['coat', 'jacket', 'warm', 'scarf', 'gloves', 'heating'],
    fitness: ['fitness', 'gym', 'workout', 'exercise', 'yoga', 'running'],
    spring: ['clean', 'organize', 'storage', 'spring'],
  };

  for (const [season, keywords] of Object.entries(seasonalKeywords)) {
    if (keywords.some(k => lowerKeyword.includes(k))) {
      return season === 'holiday' || season === 'summer' ? 'strong' : 'mild';
    }
  }

  return 'none';
}

// Get seasonality months
function getSeasonalityMonths(keyword: string): string[] {
  const lowerKeyword = keyword.toLowerCase();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (lowerKeyword.includes('christmas') || lowerKeyword.includes('gift')) {
    return ['Nov', 'Dec'];
  }
  if (lowerKeyword.includes('halloween')) {
    return ['Sep', 'Oct'];
  }
  if (lowerKeyword.includes('summer') || lowerKeyword.includes('beach')) {
    return ['Jun', 'Jul', 'Aug'];
  }
  if (lowerKeyword.includes('fitness') || lowerKeyword.includes('gym')) {
    return ['Jan', 'Feb', 'Mar']; // New Year resolutions
  }
  if (lowerKeyword.includes('garden') || lowerKeyword.includes('outdoor')) {
    return ['Apr', 'May', 'Jun'];
  }

  return [];
}

// Generate related queries
function generateRelatedQueries(
  keyword: string,
  baseInterest: number,
  random: () => number
): { query: string; value: number; trend: 'rising' | 'falling' | 'stable' }[] {
  const prefixes = ['best', 'top', 'cheap', 'affordable', 'review', 'vs', 'how to', 'what is', 'where to buy'];
  const suffixes = ['for men', 'for women', '2024', '2025', 'mini', 'portable', 'wireless', 'led'];

  const queries: { query: string; value: number; trend: 'rising' | 'falling' | 'stable' }[] = [];

  // Generate 8-12 related queries
  const count = 8 + Math.floor(random() * 5);

  for (let i = 0; i < count; i++) {
    const usePrefix = random() > 0.5;
    const query = usePrefix
      ? `${prefixes[Math.floor(random() * prefixes.length)]} ${keyword}`
      : `${keyword} ${suffixes[Math.floor(random() * suffixes.length)]}`;

    const value = Math.round(baseInterest * (0.3 + random() * 0.7));
    const trends: ('rising' | 'falling' | 'stable')[] = ['rising', 'stable', 'stable', 'stable', 'falling'];
    const trend = trends[Math.floor(random() * trends.length)];

    queries.push({ query: query.trim(), value, trend });
  }

  // Sort by value
  return queries.sort((a, b) => b.value - a.value);
}

// Generate related topics
function generateRelatedTopics(keyword: string): { topic: string; value: number; type: string }[] {
  return [
    { topic: keyword, value: 100, type: 'TOPIC' },
    { topic: 'Amazon', value: 85, type: 'BRAND' },
    { topic: 'E-commerce', value: 70, type: 'TOPIC' },
    { topic: 'Shopping', value: 65, type: 'CATEGORY' },
    { topic: 'Consumer Electronics', value: 55, type: 'CATEGORY' },
    { topic: 'Aliexpress', value: 50, type: 'BRAND' },
  ];
}

// Generate geographic distribution
function generateGeoDistribution(): { country: string; code: string; value: number }[] {
  return [
    { country: 'United States', code: 'US', value: 45 },
    { country: 'United Kingdom', code: 'GB', value: 12 },
    { country: 'Canada', code: 'CA', value: 8 },
    { country: 'Australia', code: 'AU', value: 7 },
    { country: 'Germany', code: 'DE', value: 6 },
    { country: 'France', code: 'FR', value: 5 },
    { country: 'Other', code: 'XX', value: 17 },
  ];
}

// Analyze trends and return scoring
export function analyzeTrends(trendData: TrendData): TrendAnalysis {
  const score = trendData.currentInterest;

  let demandLevel: 'high' | 'medium' | 'low';
  if (score >= 70) demandLevel = 'high';
  else if (score >= 40) demandLevel = 'medium';
  else demandLevel = 'low';

  const recommendations: string[] = [];

  if (trendData.trendDirection === 'rising') {
    recommendations.push('Keyword is trending upward - good time to enter');
  } else if (trendData.trendDirection === 'falling') {
    recommendations.push('Keyword is declining - consider alternatives or pivot');
  }

  if (trendData.growthRate > 15) {
    recommendations.push('Strong growth rate - high potential market');
  }

  if (trendData.seasonality !== 'none') {
    recommendations.push(`Seasonal pattern detected - plan inventory around ${trendData.seasonalityMonths.join(', ')}`);
  }

  return {
    score,
    demandLevel,
    trendIndicator: trendData.trendDirection === 'falling' ? 'declining' : trendData.trendDirection,
    seasonality: trendData.seasonality,
    topQueries: trendData.relatedQueries.slice(0, 5).map(q => q.query),
    recommendations,
  };
}

// Export for server-side integration
export const trendsCollectorConfig = {
  // When running on server with PyTrends, set this URL
  serverEndpoint: '/api/trends',
  cacheTTL: 60 * 60 * 1000, // 1 hour
};
