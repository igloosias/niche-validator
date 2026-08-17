// Types for NicheValidator

export interface DataSource {
  name: string;
  type: 'api' | 'scraped' | 'simulated';
  collectedAt: Date;
  url?: string;
}

export interface ManualCheck {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface NicheValidationResult {
  nicheId: string;
  niche: string;
  overallScore: number;
  recommendation: 'excellent' | 'good' | 'moderate' | 'poor';
  confidence: number;
  dimensions: NicheDimensions;
  trends: TrendData;
  keyInsights: KeyInsight[];
  dataSources: DataSource[];
  manualChecks: ManualCheck[];
  analyzedAt: Date;
}

export interface NicheDimensions {
  demand: DimensionScore;
  competition: DimensionScore;
  profitability: DimensionScore;
  accessibility: DimensionScore;
  feasibility: DimensionScore;
}

export interface DimensionScore {
  score: number;
  weight: number;
  metrics: DimensionMetric[];
  summary: string;
}

export interface DimensionMetric {
  name: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  status: 'positive' | 'neutral' | 'negative';
}

export interface TrendData {
  searchInterest: number[];
  interestOverTime: { date: string; value: number }[];
  relatedQueries: string[];
  growthRate: number;
  seasonality: 'stable' | 'growing' | 'declining' | 'seasonal';
}

export interface KeyInsight {
  type: 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ProductValidationResult {
  products: Product[];
  analyzedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  tier: 1 | 2 | 3;
  overallScore: number;
  prices: ProductPricing;
  supplier: SupplierInfo;
  metrics: ProductMetrics;
  differentiators: string[];
  risks: ProductRisk[];
  recommendation: string;
}

export interface ProductPricing {
  cost: number;
  sellingPrice: number;
  shipping: number;
  grossMargin: number;
  paymentFees: number;
  adCost: number;
  netProfit: number;
  profitMargin: number;
}

export interface SupplierInfo {
  name: string;
  rating: number;
  transactions: number;
  location: string;
  responseTime: string;
}

export interface ProductMetrics {
  weight: string;
  returnRate: number;
  competitors: number;
  socialMentions: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface ProductRisk {
  type: 'ip' | 'logistics' | 'competition' | 'returns' | 'quality';
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export const NICHE_WEIGHTS = {
  demand: 0.30,
  competition: 0.25,
  profitability: 0.25,
  accessibility: 0.10,
  feasibility: 0.10,
} as const;

export const PRODUCT_WEIGHTS = {
  margin: 0.25,
  supplier: 0.20,
  shipping: 0.15,
  returnRisk: 0.15,
  differentiation: 0.10,
  trend: 0.10,
  complexity: 0.05,
} as const;

export const SCORE_THRESHOLDS = {
  niche: { excellent: 75, good: 55, moderate: 40 },
  product: { tier1: 80, tier2: 65, tier3: 50 },
} as const;
