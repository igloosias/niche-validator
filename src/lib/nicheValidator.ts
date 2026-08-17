// Niche Validation Engine
import { NicheValidationResult, NicheDimensions, DimensionScore, DimensionMetric, KeyInsight, ManualCheck, NICHE_WEIGHTS, SCORE_THRESHOLDS } from '../types';
import { CollectedData } from './dataCollector';

export function validateNiche(data: CollectedData): NicheValidationResult {
  const dimensions = calculateDimensions(data);
  const overallScore = calculateOverallScore(dimensions);
  const recommendation = getRecommendation(overallScore);
  const confidence = calculateConfidence(data);
  const keyInsights = generateKeyInsights(data, dimensions);
  const manualChecks = generateManualChecks(data);

  return {
    nicheId: `niche_${data.niche.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    niche: data.niche,
    overallScore,
    recommendation,
    confidence,
    dimensions,
    trends: data.trends,
    keyInsights,
    dataSources: data.dataSources,
    manualChecks,
    analyzedAt: new Date(),
  };
}

function generateManualChecks(data: CollectedData): ManualCheck[] {
  const checks: ManualCheck[] = [];

  // Supplier Verification
  checks.push({
    id: 'supplier_communication',
    title: 'Contact Suppliers',
    description: 'Message 3+ AliExpress suppliers. Test response time, communication quality, and customization capabilities.',
    completed: false,
  });

  // Legal Check
  checks.push({
    id: 'trademark_search',
    title: 'Trademark Search',
    description: 'Search USPTO (uspto.gov) for trademarked terms in your product names and marketing phrases.',
    completed: false,
  });

  // Sample Order
  checks.push({
    id: 'sample_order',
    title: 'Order Product Sample',
    description: 'Order 1-2 samples to your address. Verify product quality, packaging, and shipping time.',
    completed: false,
  });

  // Competitor Research
  checks.push({
    id: 'competitor_analysis',
    title: 'Analyze Competitors',
    description: 'Find 5 successful Shopify stores in your niche. Note their pricing, marketing, and what makes them work.',
    completed: false,
  });

  // Test Ad
  checks.push({
    id: 'test_ad',
    title: 'Run Test Advertisement',
    description: 'Launch a $10-20 test ad on Facebook/Instagram. Validate click-through rate before scaling.',
    completed: false,
  });

  // Buyer Journey
  checks.push({
    id: 'buyer_journey',
    title: 'Test Buyer Experience',
    description: 'Buy from 2-3 competitors. Note their checkout, shipping time, packaging, and follow-up emails.',
    completed: false,
  });

  // Product Certification
  if (data.niche.toLowerCase().includes('electronic') || data.niche.toLowerCase().includes('beauty') || data.niche.toLowerCase().includes('kids')) {
    checks.push({
      id: 'product_certification',
      title: 'Verify Product Certifications',
      description: 'Ensure products have required certifications (FCC, CE, CPC, FDA) for your target market.',
      completed: false,
    });
  }

  return checks;
}

function calculateDimensions(data: CollectedData): NicheDimensions {
  return {
    demand: calculateDemandScore(data),
    competition: calculateCompetitionScore(data),
    profitability: calculateProfitabilityScore(data),
    accessibility: calculateAccessibilityScore(data),
    feasibility: calculateFeasibilityScore(data),
  };
}

function calculateDemandScore(data: CollectedData): DimensionScore {
  const metrics: DimensionMetric[] = [];
  let score = 0;

  const searches = data.keywordData.monthlySearches;
  let searchScore: number;
  if (searches >= 2000 && searches <= 10000) searchScore = 100;
  else if (searches < 2000) searchScore = Math.max(20, (searches / 2000) * 100);
  else searchScore = Math.max(60, 100 - ((searches - 10000) / 50000) * 40);
  metrics.push({ name: 'Monthly Searches', value: searches.toLocaleString(), status: searchScore >= 80 ? 'positive' : searchScore >= 50 ? 'neutral' : 'negative', trend: data.trends.growthRate > 5 ? 'up' : data.trends.growthRate < -5 ? 'down' : 'stable' });
  score += searchScore * 0.4;

  const growthScore = Math.max(0, Math.min(100, 50 + data.trends.growthRate * 2));
  metrics.push({ name: 'YoY Growth', value: `${data.trends.growthRate > 0 ? '+' : ''}${data.trends.growthRate}%`, trend: data.trends.growthRate > 0 ? 'up' : data.trends.growthRate < 0 ? 'down' : 'stable', status: data.trends.growthRate > 10 ? 'positive' : data.trends.growthRate > 0 ? 'neutral' : 'negative' });
  score += growthScore * 0.3;

  let seasonalityScore = 100;
  if (data.trends.seasonality === 'seasonal') seasonalityScore = 60;
  if (data.trends.seasonality === 'declining') seasonalityScore = 30;
  metrics.push({ name: 'Demand Stability', value: data.trends.seasonality.charAt(0).toUpperCase() + data.trends.seasonality.slice(1), trend: data.trends.seasonality === 'growing' ? 'up' : data.trends.seasonality === 'declining' ? 'down' : 'stable', status: data.trends.seasonality === 'growing' ? 'positive' : data.trends.seasonality === 'stable' ? 'neutral' : 'negative' });
  score += seasonalityScore * 0.15;

  const socialScore = Math.min(100, data.socialData.trendingScore);
  metrics.push({ name: 'Social Momentum', value: data.socialData.trendingScore.toString(), status: socialScore >= 70 ? 'positive' : socialScore >= 40 ? 'neutral' : 'negative' });
  score += socialScore * 0.15;

  return { score: Math.round(score), weight: NICHE_WEIGHTS.demand * 100, metrics, summary: score >= 70 ? 'Strong demand indicators with consistent search volume.' : score >= 50 ? 'Moderate demand with some growth potential.' : 'Weak demand signals. Limited search volume.' };
}

function calculateCompetitionScore(data: CollectedData): DimensionScore {
  const metrics: DimensionMetric[] = [];
  let score = 0;

  const compIndex = data.keywordData.competitionIndex;
  const compScore = Math.max(0, 100 - compIndex);
  metrics.push({ name: 'Keyword Competition', value: data.keywordData.competition.toUpperCase(), status: compScore >= 70 ? 'positive' : compScore >= 40 ? 'neutral' : 'negative' });
  score += compScore * 0.3;

  const reviews = data.amazonData.topProductReviews;
  let reviewScore: number;
  if (reviews < 1000) reviewScore = 100;
  else if (reviews < 3000) reviewScore = 80;
  else if (reviews < 5000) reviewScore = 60;
  else if (reviews < 10000) reviewScore = 40;
  else reviewScore = 20;
  metrics.push({ name: 'Market Leader Reviews', value: reviews.toLocaleString(), status: reviewScore >= 60 ? 'positive' : reviewScore >= 40 ? 'neutral' : 'negative' });
  score += reviewScore * 0.3;

  const supplierCount = data.aliExpressData.supplierCount;
  let supplierScore: number = supplierCount > 100 ? 80 : supplierCount > 50 ? 60 : 40;
  metrics.push({ name: 'Supplier Options', value: supplierCount.toString(), status: supplierScore >= 70 ? 'positive' : 'neutral' });
  score += supplierScore * 0.2;

  const topBid = data.keywordData.topBid;
  let bidScore: number = topBid < 2 ? 100 : topBid < 3 ? 80 : topBid < 4 ? 60 : 40;
  metrics.push({ name: 'Ad Competition (CPC)', value: `$${topBid.toFixed(2)}`, status: bidScore >= 70 ? 'positive' : bidScore >= 50 ? 'neutral' : 'negative' });
  score += bidScore * 0.2;

  return { score: Math.round(score), weight: NICHE_WEIGHTS.competition * 100, metrics, summary: score >= 60 ? 'Manageable competition with room for new entrants.' : score >= 40 ? 'Moderate competition. Success depends on differentiation.' : 'High competition from established players.' };
}

function calculateProfitabilityScore(data: CollectedData): DimensionScore {
  const metrics: DimensionMetric[] = [];
  let score = 0;

  const avgPrice = data.amazonData.avgPrice;
  let priceScore: number = avgPrice >= 25 && avgPrice <= 150 ? 100 : avgPrice >= 15 && avgPrice < 25 ? 70 : avgPrice > 150 && avgPrice <= 250 ? 70 : avgPrice < 15 ? 40 : 50;
  metrics.push({ name: 'Avg. Selling Price', value: `$${avgPrice.toFixed(2)}`, status: priceScore >= 80 ? 'positive' : 'neutral' });
  score += priceScore * 0.3;

  const costRatio = data.aliExpressData.avgCost / avgPrice;
  let marginScore: number = costRatio <= 0.25 ? 100 : costRatio <= 0.35 ? 85 : costRatio <= 0.45 ? 70 : 50;
  metrics.push({ name: 'Product Cost', value: `$${data.aliExpressData.avgCost.toFixed(2)}`, status: marginScore >= 80 ? 'positive' : 'neutral' });
  score += marginScore * 0.35;

  const grossMargin = (1 - costRatio - 0.03) * 100;
  metrics.push({ name: 'Est. Gross Margin', value: `${grossMargin.toFixed(1)}%`, status: grossMargin >= 50 ? 'positive' : grossMargin >= 35 ? 'neutral' : 'negative' });
  score += Math.min(100, Math.max(0, grossMargin * 1.5)) * 0.25;

  const revenueScore = Math.min(100, (data.amazonData.monthlyRevenue / 100000) * 50 + 50);
  metrics.push({ name: 'Market Revenue', value: `$${(data.amazonData.monthlyRevenue / 1000).toFixed(0)}K/mo`, status: revenueScore >= 70 ? 'positive' : 'neutral' });
  score += revenueScore * 0.1;

  return { score: Math.round(score), weight: NICHE_WEIGHTS.profitability * 100, metrics, summary: score >= 70 ? 'Excellent price points with healthy margins.' : score >= 50 ? 'Reasonable profitability with room for optimization.' : 'Tight margins. Need careful cost management.' };
}

function calculateAccessibilityScore(data: CollectedData): DimensionScore {
  const metrics: DimensionMetric[] = [];
  let score = 0;

  const activePlatforms = data.socialData.platforms.filter(p => p.active).length;
  const platformScore = (activePlatforms / 4) * 100;
  metrics.push({ name: 'Social Platforms', value: `${activePlatforms}/4`, status: platformScore >= 75 ? 'positive' : 'neutral' });
  score += platformScore * 0.3;

  const influencers = data.socialData.influencers;
  let influencerScore: number = influencers > 200 ? 100 : influencers > 100 ? 80 : influencers > 50 ? 60 : 40;
  metrics.push({ name: 'Micro-Influencers', value: influencers.toString(), status: influencerScore >= 70 ? 'positive' : 'neutral' });
  score += influencerScore * 0.25;

  const engagement = data.socialData.engagementRate;
  const engagementScore = Math.min(100, engagement * 15);
  metrics.push({ name: 'Avg. Engagement', value: `${engagement.toFixed(1)}%`, status: engagementScore >= 60 ? 'positive' : 'neutral' });
  score += engagementScore * 0.25;

  const hashtagGrowth = data.socialData.hashtags[0]?.growth || 0;
  const hashtagScore = Math.min(100, hashtagGrowth * 2 + 50);
  metrics.push({ name: 'Hashtag Growth', value: `+${hashtagGrowth.toFixed(1)}%`, trend: hashtagGrowth > 10 ? 'up' : 'stable', status: hashtagScore >= 60 ? 'positive' : 'neutral' });
  score += hashtagScore * 0.2;

  return { score: Math.round(score), weight: NICHE_WEIGHTS.accessibility * 100, metrics, summary: score >= 70 ? 'Good marketing accessibility with active social presence.' : score >= 50 ? 'Moderate reach potential. Building presence requires effort.' : 'Limited organic reach. Paid advertising may be primary channel.' };
}

function calculateFeasibilityScore(data: CollectedData): DimensionScore {
  const metrics: DimensionMetric[] = [];
  let score = 0;

  const supplierRating = data.aliExpressData.avgRating;
  const ratingScore = Math.min(100, (supplierRating / 5) * 100);
  metrics.push({ name: 'Avg. Supplier Rating', value: `${supplierRating.toFixed(1)}/5`, status: ratingScore >= 90 ? 'positive' : 'neutral' });
  score += ratingScore * 0.35;

  const supplierCount = data.aliExpressData.supplierCount;
  const supplierScore = Math.min(100, (supplierCount / 150) * 100);
  metrics.push({ name: 'Supplier Options', value: supplierCount.toString(), status: supplierScore >= 60 ? 'positive' : 'neutral' });
  score += supplierScore * 0.25;

  const shippingDays = parseInt(data.aliExpressData.avgShippingTime.split('-')[0]);
  let shippingScore: number = shippingDays <= 10 ? 100 : shippingDays <= 15 ? 80 : shippingDays <= 20 ? 60 : 40;
  metrics.push({ name: 'Avg. Shipping Time', value: data.aliExpressData.avgShippingTime, status: shippingScore >= 80 ? 'positive' : shippingScore >= 60 ? 'neutral' : 'negative' });
  score += shippingScore * 0.25;

  const reviewGrowth = data.amazonData.reviewGrowth;
  const reviewScore = Math.max(0, Math.min(100, 50 + reviewGrowth * 3));
  metrics.push({ name: 'Review Growth', value: `${reviewGrowth > 0 ? '+' : ''}${reviewGrowth.toFixed(1)}%`, trend: reviewGrowth > 0 ? 'up' : 'down', status: reviewGrowth > 10 ? 'positive' : reviewGrowth > 0 ? 'neutral' : 'negative' });
  score += reviewScore * 0.15;

  return { score: Math.round(score), weight: NICHE_WEIGHTS.feasibility * 100, metrics, summary: score >= 75 ? 'Reliable supplier network with acceptable shipping times.' : score >= 55 ? 'Operational feasibility varies. Due diligence recommended.' : 'Potential operational challenges. Supplier verification essential.' };
}

function calculateOverallScore(dimensions: NicheDimensions): number {
  return Math.round(
    dimensions.demand.score * NICHE_WEIGHTS.demand +
    dimensions.competition.score * NICHE_WEIGHTS.competition +
    dimensions.profitability.score * NICHE_WEIGHTS.profitability +
    dimensions.accessibility.score * NICHE_WEIGHTS.accessibility +
    dimensions.feasibility.score * NICHE_WEIGHTS.feasibility
  );
}

function getRecommendation(score: number): 'excellent' | 'good' | 'moderate' | 'poor' {
  if (score >= SCORE_THRESHOLDS.niche.excellent) return 'excellent';
  if (score >= SCORE_THRESHOLDS.niche.good) return 'good';
  if (score >= SCORE_THRESHOLDS.niche.moderate) return 'moderate';
  return 'poor';
}

function calculateConfidence(data: CollectedData): number {
  let confidence = 80;
  if (data.aliExpressData.supplierCount > 100) confidence += 10;
  else if (data.aliExpressData.supplierCount < 30) confidence -= 15;
  if (data.trends.seasonality === 'stable' || data.trends.seasonality === 'growing') confidence += 5;
  if (data.socialData.trendingScore > 60) confidence += 5;
  return Math.min(95, Math.max(50, confidence));
}

function generateKeyInsights(data: CollectedData, dimensions: NicheDimensions): KeyInsight[] {
  const insights: KeyInsight[] = [];

  if (data.trends.growthRate > 15) {
    insights.push({ type: 'opportunity', title: 'Rising Demand', description: `${data.niche} shows strong growth momentum with ${data.trends.growthRate.toFixed(1)}% increase in search interest.`, impact: 'high' });
  }
  if (dimensions.competition.score >= 70) {
    insights.push({ type: 'opportunity', title: 'Lower Competition Entry', description: 'This niche has relatively low keyword competition, making it easier to rank.', impact: 'high' });
  }
  if (data.socialData.influencers > 150 && data.socialData.engagementRate > 3) {
    insights.push({ type: 'opportunity', title: 'Influencer Marketing Potential', description: `Active micro-influencer community with ${data.socialData.influencers} potential partners.`, impact: 'medium' });
  }
  if (data.amazonData.topProductReviews > 5000) {
    insights.push({ type: 'warning', title: 'Established Competition', description: 'Market leaders have significant reviews. Differentiation is essential.', impact: 'high' });
  }
  if (data.trends.seasonality === 'seasonal') {
    insights.push({ type: 'warning', title: 'Seasonal Demand', description: 'This niche shows strong seasonal patterns. Plan around peak periods.', impact: 'medium' });
  }
  if (dimensions.profitability.score < 50) {
    insights.push({ type: 'warning', title: 'Margin Pressure', description: 'Current pricing dynamics may result in lower margins.', impact: 'medium' });
  }
  if (data.aliExpressData.supplierCount > 100) {
    insights.push({ type: 'info', title: 'Multiple Suppliers Available', description: `${data.aliExpressData.supplierCount} suppliers provide flexibility in sourcing.`, impact: 'low' });
  }
  return insights.slice(0, 6);
}
