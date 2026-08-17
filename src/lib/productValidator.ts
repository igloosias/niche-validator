// Product Validation Engine
import { Product, ProductValidationResult, ProductPricing, SupplierInfo, ProductMetrics, ProductRisk, PRODUCT_WEIGHTS, SCORE_THRESHOLDS } from '../types';
import { ProductData } from './dataCollector';

// Extended ProductData interface with URL fields
export interface ExtendedProductData extends ProductData {
  supplierStoreUrl?: string;
  productUrl?: string;
  imageUrl?: string;
}

export function validateProducts(productData: ProductData[]): ProductValidationResult {
  const products = productData.map((data, index) => validateSingleProduct(data as ExtendedProductData, index));
  products.sort((a, b) => b.overallScore - a.overallScore);
  products.forEach((product) => {
    if (product.overallScore >= SCORE_THRESHOLDS.product.tier1) product.tier = 1;
    else if (product.overallScore >= SCORE_THRESHOLDS.product.tier2) product.tier = 2;
    else if (product.overallScore >= SCORE_THRESHOLDS.product.tier3) product.tier = 3;
  });
  return { products, analyzedAt: new Date() };
}

function validateSingleProduct(data: ExtendedProductData, index: number): Product {
  const pricing = calculatePricing(data);
  const supplier = calculateSupplierInfo(data);
  const metrics = calculateMetrics(data);
  const risks = identifyRisks(data, pricing, metrics);
  const differentiators = identifyDifferentiators(data, metrics);
  const score = calculateProductScore(data, pricing, supplier, metrics, risks);
  const recommendation = generateRecommendation(score, pricing, risks);

  return {
    id: `product_${index}_${Date.now()}`,
    name: data.name,
    category: data.category,
    tier: 3,
    overallScore: score,
    prices: pricing,
    supplier,
    metrics,
    differentiators,
    risks,
    recommendation,
  };
}

function calculatePricing(data: ExtendedProductData): ProductPricing {
  const shipping = data.cost > 20 ? 0 : 3.99;
  const paymentFees = data.sellingPrice * 0.029 + 0.30;
  const adCost = data.sellingPrice * 0.25;
  const grossProfit = data.sellingPrice - data.cost - shipping;
  const netProfit = grossProfit - paymentFees - adCost;
  const grossMargin = (grossProfit / data.sellingPrice) * 100;
  const profitMargin = (netProfit / data.sellingPrice) * 100;

  return {
    cost: data.cost,
    sellingPrice: data.sellingPrice,
    shipping,
    grossMargin: Math.round(grossMargin * 10) / 10,
    paymentFees: Math.round(paymentFees * 100) / 100,
    adCost: Math.round(adCost * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 10) / 10,
  };
}

function calculateSupplierInfo(data: ExtendedProductData): SupplierInfo {
  return {
    name: data.supplierName || 'Verified Supplier',
    rating: data.supplierRating,
    transactions: data.supplierTransactions,
    location: 'China',
    responseTime: data.supplierRating >= 4.5 ? '< 12 hours' : '< 24 hours',
  };
}

function calculateMetrics(data: ProductData): ProductMetrics {
  return {
    weight: data.weight,
    returnRate: data.returnRate,
    competitors: data.competitorCount,
    socialMentions: data.socialMentions,
    trendDirection: data.socialMentions > 1000 ? 'up' : data.socialMentions > 500 ? 'stable' : 'down',
  };
}

function identifyRisks(data: ProductData, pricing: ProductPricing, metrics: ProductMetrics): ProductRisk[] {
  const risks: ProductRisk[] = [];

  if (metrics.returnRate > 10) {
    risks.push({ type: 'returns', severity: 'high', description: `High return rate of ${metrics.returnRate}%.` });
  } else if (metrics.returnRate > 5) {
    risks.push({ type: 'returns', severity: 'medium', description: `Moderate return rate of ${metrics.returnRate}%.` });
  }

  if (metrics.competitors > 80) {
    risks.push({ type: 'competition', severity: 'high', description: `Heavy competition with ${metrics.competitors}+ similar products.` });
  } else if (metrics.competitors > 40) {
    risks.push({ type: 'competition', severity: 'medium', description: 'Moderate competition. Focus on unique positioning.' });
  }

  if (pricing.profitMargin < 15) {
    risks.push({ type: 'logistics', severity: 'high', description: `Thin profit margin of ${pricing.profitMargin}%.` });
  } else if (pricing.profitMargin < 25) {
    risks.push({ type: 'logistics', severity: 'medium', description: `Moderate margins of ${pricing.profitMargin}%.` });
  }

  if (data.supplierRating < 4.2) {
    risks.push({ type: 'quality', severity: 'medium', description: `Supplier rating of ${data.supplierRating}/5 may indicate quality concerns.` });
  }

  return risks;
}

function identifyDifferentiators(data: ProductData, metrics: ProductMetrics): string[] {
  const diffs: string[] = [];
  if (data.supplierRating >= 4.7) diffs.push('Premium supplier with excellent ratings');
  if (metrics.socialMentions > 1000) diffs.push('Already has social proof and awareness');
  if (metrics.competitors < 30) diffs.push('Lower competition, easier to stand out');
  const bundlePatterns = ['organizer', 'storage', 'kit', 'set', 'tool'];
  if (bundlePatterns.some(p => data.name.toLowerCase().includes(p))) diffs.push('Strong bundle and upsell potential');
  if (metrics.returnRate < 5) diffs.push('Low return rate category, reducing operational risk');
  if (metrics.trendDirection === 'up') diffs.push('Upward demand trend, riding market momentum');
  return diffs.slice(0, 3);
}

function calculateProductScore(data: ProductData, pricing: ProductPricing, supplier: SupplierInfo, metrics: ProductMetrics, risks: ProductRisk[]): number {
  let score = 0;

  let marginScore: number = pricing.profitMargin >= 30 ? 100 : pricing.profitMargin >= 20 ? 80 : pricing.profitMargin >= 15 ? 60 : pricing.profitMargin >= 10 ? 40 : 20;
  score += marginScore * PRODUCT_WEIGHTS.margin;

  const supplierScore = Math.min(100, (supplier.rating / 5) * 100);
  score += supplierScore * PRODUCT_WEIGHTS.supplier;

  let shippingScore = 80;
  if (data.shippingTime.includes('7-12')) shippingScore = 100;
  else if (data.shippingTime.includes('10-15')) shippingScore = 85;
  else if (data.shippingTime.includes('15-20')) shippingScore = 70;
  score += shippingScore * PRODUCT_WEIGHTS.shipping;

  let returnScore: number = metrics.returnRate <= 3 ? 100 : metrics.returnRate <= 5 ? 85 : metrics.returnRate <= 8 ? 70 : metrics.returnRate <= 12 ? 50 : 30;
  score += returnScore * PRODUCT_WEIGHTS.returnRisk;

  let diffScore = 50;
  if (metrics.competitors < 20) diffScore = 100;
  else if (metrics.competitors < 40) diffScore = 80;
  else if (metrics.competitors < 60) diffScore = 60;
  else if (metrics.competitors < 80) diffScore = 40;
  else diffScore = 20;
  score += diffScore * PRODUCT_WEIGHTS.differentiation;

  let trendScore: number = metrics.trendDirection === 'up' ? 100 : metrics.trendDirection === 'stable' ? 70 : 40;
  if (metrics.socialMentions > 1000) trendScore = Math.min(100, trendScore + 20);
  score += trendScore * PRODUCT_WEIGHTS.trend;

  const weight = parseFloat(metrics.weight);
  let complexityScore = weight < 0.5 ? 100 : weight < 1 ? 85 : weight < 2 ? 70 : 60;
  score += complexityScore * PRODUCT_WEIGHTS.complexity;

  const highRisks = risks.filter(r => r.severity === 'high').length;
  const mediumRisks = risks.filter(r => r.severity === 'medium').length;
  score -= highRisks * 5;
  score -= mediumRisks * 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function generateRecommendation(score: number, pricing: ProductPricing, risks: ProductRisk[]): string {
  if (score >= 80) return `Strong product with ${pricing.profitMargin}% margin. ${pricing.netProfit > 10 ? 'Excellent' : 'Good'} profit potential.`;
  if (score >= 65) return `Viable product with ${pricing.profitMargin}% margin. Consider differentiation strategies.`;
  if (score >= 50) return `Marginal product requiring careful evaluation. Focus on reducing costs.`;
  return `Low recommendation score. Consider alternatives.`;
}
