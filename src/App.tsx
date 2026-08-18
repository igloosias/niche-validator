import { useState, useCallback } from 'react';
import { Sparkles, Search, Lightbulb, ArrowRight, Database, Brain, TrendingUp, Package, RefreshCw, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, Circle, AlertCircle, ExternalLinkIcon, Globe, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { NicheValidationResult, ProductValidationResult, KeyInsight } from './types';
import { collectNicheData, collectProductData } from './lib/dataCollector';
import { validateNiche } from './lib/nicheValidator';
import { validateProducts } from './lib/productValidator';
import { BackendStatusIndicator } from './components/BackendStatus';

type AppState = 'idle' | 'loading' | 'results' | 'error';

const popularNiches = ['outdoor solar lighting', 'pet grooming tools', 'kitchen organization', 'wireless charging', 'fitness accessories', 'portable storage', 'smart home devices', 'eco-friendly products'];

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [currentNiche, setCurrentNiche] = useState('');
  const [nicheResult, setNicheResult] = useState<NicheValidationResult | null>(null);
  const [productResult, setProductResult] = useState<ProductValidationResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'products' | 'insights' | 'verification'>('overview');

  const handleValidate = useCallback(async (niche: string) => {
    if (!niche.trim()) return;
    setCurrentNiche(niche);
    setAppState('loading');
    setLoadingMessage('Initializing validation...');

    try {
      setLoadingMessage('Collecting market data...');
      const nicheData = await collectNicheData(niche);
      setLoadingMessage('Analyzing niche viability...');
      await new Promise(r => setTimeout(r, 500));
      const nicheValResult = validateNiche(nicheData);

      if (nicheValResult.overallScore < 40) {
        setNicheResult(nicheValResult);
        setProductResult({ products: [], analyzedAt: new Date() });
        setAppState('results');
        return;
      }

      setLoadingMessage('Discovering top products...');
      const productData = await collectProductData(niche, 15);
      setLoadingMessage('Scoring and ranking products...');
      await new Promise(r => setTimeout(r, 300));
      const prodResult = validateProducts(productData);

      setNicheResult(nicheValResult);
      setProductResult(prodResult);
      setAppState('results');
    } catch (error) {
      console.error('Validation error:', error);
      setAppState('error');
    }
  }, []);

  const handleReset = () => {
    setAppState('idle');
    setCurrentNiche('');
    setNicheResult(null);
    setProductResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Market Validation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">NicheValidator</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">Validate your dropshipping niche and discover high-potential products with data-driven insights.</p>
        </header>

        {/* Backend Status Indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <BackendStatusIndicator />
        </div>

        <main>
          {appState === 'idle' && <IdleState onValidate={handleValidate} />}
          {appState === 'loading' && <LoadingState message={loadingMessage} />}
          {appState === 'results' && nicheResult && <ResultsState nicheResult={nicheResult} productResult={productResult!} niche={currentNiche} activeTab={activeTab} setActiveTab={setActiveTab} onNewSearch={handleReset} />}
          {appState === 'error' && <ErrorState onReset={handleReset} />}
        </main>

        <footer className="mt-16 pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>Data sources: Google Trends, YouTube, Reddit, AliExpress, Amazon (Simulated)</p>
            <p>Built for Shopify Dropshipping Entrepreneurs</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function IdleState({ onValidate }: { onValidate: (niche: string) => void }) {
  const [input, setInput] = useState('');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
        <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) onValidate(input.trim()); }} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter a niche to validate (e.g., 'outdoor solar lighting')" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pl-12 pr-12 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" autoFocus />
          </div>
          <button type="submit" disabled={!input.trim()} className="mt-4 w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
            <span>Analyze Niche</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">Popular niches to explore:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularNiches.map((niche) => (
            <button key={niche} onClick={() => onValidate(niche)} className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-700/50 hover:border-slate-600/50 hover:text-white transition-all">
              {niche}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} title="Multi-Source Analysis" description="Combines Google Trends, YouTube, Reddit, and AliExpress data." />
        <FeatureCard icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} title="Guided Manual Checks" description="Interactive verification steps to complete before launching." />
        <FeatureCard icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} title="Real Product Links" description="Clickable links to actual products on AliExpress and suppliers." />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  const stages = [
    { icon: Database, label: 'Collecting data' },
    { icon: Brain, label: 'Analyzing patterns' },
    { icon: TrendingUp, label: 'Calculating scores' },
    { icon: Package, label: 'Ranking products' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{message}</h2>
        <p className="text-slate-400 text-sm mb-8">Powered by AI market intelligence</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stages.map((stage) => (
            <div key={stage.label} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-800/50">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <stage.icon className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs text-slate-400">{stage.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Validation Failed</h2>
      <p className="text-slate-400 mb-6">Please try again.</p>
      <button onClick={onReset} className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 mx-auto">
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}

function ResultsState({ nicheResult, productResult, niche, activeTab, setActiveTab, onNewSearch }: {
  nicheResult: NicheValidationResult;
  productResult: ProductValidationResult;
  niche: string;
  activeTab: 'overview' | 'dimensions' | 'products' | 'insights' | 'verification';
  setActiveTab: (tab: 'overview' | 'dimensions' | 'products' | 'insights' | 'verification') => void;
  onNewSearch: () => void;
}) {
  const tier1Products = productResult.products.filter(p => p.tier === 1);
  const getRecommendationBg = (rec: string) => rec === 'excellent' ? 'bg-green-500/10 border-green-500/20 text-green-400' : rec === 'good' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : rec === 'moderate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Validation Results for <span className="text-purple-400">"{niche}"</span></h2>
          <p className="text-slate-400 text-sm mt-1">Analyzed on {new Date(nicheResult.analyzedAt).toLocaleDateString()} - {nicheResult.dataSources.length} data sources</p>
        </div>
        <button onClick={onNewSearch} className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg transition-all border border-slate-600 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          New Search
        </button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <ScoreGauge score={nicheResult.overallScore} />
          <div className="flex-1 text-center lg:text-left">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getRecommendationBg(nicheResult.recommendation)} mb-4`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span className="font-semibold capitalize">{nicheResult.recommendation}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {nicheResult.recommendation === 'excellent' ? 'Strong go recommendation' : nicheResult.recommendation === 'good' ? 'Proceed with standard execution' : nicheResult.recommendation === 'moderate' ? 'Proceed with caution' : 'Consider alternative niches'}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
              <div className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-purple-500" />Confidence: {nicheResult.confidence}%</div>
              <div className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-green-500" />{productResult.products.length} products analyzed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-700 overflow-x-auto">
        {(['overview', 'dimensions', 'products', 'insights', 'verification'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
            {tab === 'verification' ? 'Manual Checks' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab nicheResult={nicheResult} tier1Products={tier1Products} setActiveTab={setActiveTab} />}
        {activeTab === 'dimensions' && <DimensionsTab nicheResult={nicheResult} />}
        {activeTab === 'products' && <ProductsTab productResult={productResult} tier1Products={tier1Products} />}
        {activeTab === 'insights' && <InsightsTab insights={nicheResult.keyInsights} />}
        {activeTab === 'verification' && <VerificationTab nicheResult={nicheResult} />}
      </div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const colors = score >= 75 ? { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)' } : score >= 55 ? { stroke: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' } : score >= 40 ? { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' } : { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' };
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="70" fill="none" stroke="#334155" strokeWidth="8" />
        <circle cx="80" cy="80" r="70" fill="none" stroke={colors.stroke} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1s ease-out', filter: `drop-shadow(0 0 6px ${colors.glow})` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white font-mono">{score}</span>
        <span className="text-base text-slate-400 mt-1">Niche Score</span>
      </div>
    </div>
  );
}

function OverviewTab({ nicheResult, tier1Products, setActiveTab }: { nicheResult: NicheValidationResult; tier1Products: any[]; setActiveTab: (tab: any) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Search Interest Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={nicheResult.trends.interestOverTime}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-400">Growth: <span className={nicheResult.trends.growthRate >= 0 ? 'text-green-400' : 'text-red-400'}>{nicheResult.trends.growthRate > 0 ? '+' : ''}{nicheResult.trends.growthRate}%</span></span>
          <span className="text-slate-400 capitalize">{nicheResult.trends.seasonality} demand</span>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <MetricBox label="Monthly Searches" value={nicheResult.dimensions.demand.metrics[0].value} trend={nicheResult.dimensions.demand.metrics[0].trend} />
          <MetricBox label="Competition" value={nicheResult.dimensions.competition.metrics[0].value} status={nicheResult.dimensions.competition.metrics[0].status} />
          <MetricBox label="Avg. Price" value={`$${nicheResult.dimensions.profitability.metrics[0].value}`} />
          <MetricBox label="Est. Margin" value={nicheResult.dimensions.profitability.metrics[2].value} status="positive" />
          <MetricBox label="Suppliers" value={nicheResult.dimensions.feasibility.metrics[1].value} />
          <MetricBox label="Social Score" value={nicheResult.dimensions.accessibility.metrics[0].value} />
        </div>
      </div>

      {tier1Products.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Rated Products</h3>
            <button onClick={() => setActiveTab('products')} className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">View all <ExternalLink className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tier1Products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 lg:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Data Sources</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nicheResult.dataSources.map((source, index) => (
            <div key={index} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${source.type === 'api' ? 'bg-green-400' : 'bg-amber-400'}`} />
                <span className="text-sm font-medium text-white">{source.name}</span>
              </div>
              <span className="text-xs text-slate-500 capitalize">{source.type}</span>
              {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="block mt-1 text-xs text-purple-400 hover:text-purple-300">
                  View source <ExternalLinkIcon className="w-3 h-3 inline" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, status, trend }: { label: string; value: string | number; status?: string; trend?: string }) {
  const valueColor = status === 'positive' ? 'text-green-400' : status === 'negative' ? 'text-red-400' : 'text-white';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="p-4 rounded-lg bg-slate-800/50">
      <div className="text-sm text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${valueColor}`}>{value}{trend && <span className={`ml-2 text-sm ${trendColor}`}>{trendIcon}</span>}</div>
    </div>
  );
}

function DimensionsTab({ nicheResult }: { nicheResult: NicheValidationResult }) {
  const dimensionLabels: Record<string, string> = { demand: 'Demand', competition: 'Competition', profitability: 'Profitability', accessibility: 'Accessibility', feasibility: 'Feasibility' };
  const dimensionColors: Record<string, string> = { demand: '#a855f7', competition: '#3b82f6', profitability: '#22c55e', accessibility: '#f59e0b', feasibility: '#ec4899' };

  const data = Object.entries(nicheResult.dimensions).map(([key, value]) => ({ name: dimensionLabels[key], score: value.score, key, weight: value.weight }));

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Score Breakdown by Dimension</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#e2e8f0', fontSize: 13, fontWeight: 500 }} width={95} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {data.map((entry) => <Cell key={entry.key} fill={dimensionColors[entry.key]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(nicheResult.dimensions).map(([key, score]) => (
          <DimensionCard key={key} title={dimensionLabels[key]} score={score} />
        ))}
      </div>
    </div>
  );
}

function DimensionCard({ title, score }: { title: string; score: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <span className="text-xs text-slate-500">{score.weight}% weight</span>
          </div>
        </div>
        <div className={`text-2xl font-bold font-mono ${score.score >= 70 ? 'text-green-400' : score.score >= 50 ? 'text-blue-400' : score.score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{score.score}</div>
      </div>
      <p className="text-sm text-slate-400 mb-4">{score.summary}</p>
      <button onClick={() => setExpanded(!expanded)} className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">
        {expanded ? 'Hide' : 'Show'} metrics {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
          {score.metrics.map((metric: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{metric.name}</span>
              <span className={metric.status === 'positive' ? 'text-green-400' : metric.status === 'negative' ? 'text-red-400' : 'text-white'}>{metric.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductsTab({ productResult, tier1Products }: { productResult: ProductValidationResult; tier1Products: any[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayProducts = showAll ? productResult.products : tier1Products;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center"><div className="text-3xl font-bold text-green-400">{tier1Products.length}</div><div className="text-sm text-slate-400">Tier 1 Products</div></div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center"><div className="text-3xl font-bold text-blue-400">{productResult.products.filter(p => p.tier === 2).length}</div><div className="text-sm text-slate-400">Tier 2 Products</div></div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center"><div className="text-3xl font-bold text-amber-400">{productResult.products.filter(p => p.tier === 3).length}</div><div className="text-sm text-slate-400">Tier 3 Products</div></div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center"><div className="text-3xl font-bold text-purple-400">{productResult.products.length}</div><div className="text-sm text-slate-400">Total Analyzed</div></div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{showAll ? 'All Products' : 'Top Products (Tier 1)'}</h3>
          {!showAll && productResult.products.length > tier1Products.length && (
            <button onClick={() => setShowAll(true)} className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">Show all {productResult.products.length} products <ChevronDown className="w-4 h-4" /></button>
          )}
          {showAll && <button onClick={() => setShowAll(false)} className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">Show top products <ChevronUp className="w-4 h-4" /></button>}
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 text-center">
            <p className="text-slate-400">No products passed minimum viability threshold.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, compact = false }: { product: any; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const tierBadgeClass = product.tier === 1 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : product.tier === 2 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30';

  // Get product link - use direct link if available, otherwise build from source
  const getProductLink = () => {
    if (product.supplier?.url && product.supplier.url.startsWith('http')) {
      return product.supplier.url;
    }
    if (product.url && product.url.startsWith('http')) {
      return product.url;
    }
    // Build AliExpress search link from niche keyword
    return `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(product.name.replace(' - Option', '').trim())}`;
  };

  const productLink = getProductLink();

  if (compact) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-all cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-white text-sm">{product.name}</h4>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tierBadgeClass}`}>Tier {product.tier}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400"><span className="text-white font-semibold">${product.prices.sellingPrice}</span></span>
          <span className="text-green-400">{product.prices.profitMargin}% margin</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{product.name}</h4>
          <p className="text-sm text-slate-400">{product.category}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tierBadgeClass}`}>Tier {product.tier}</span>
          <span className={`text-2xl font-bold font-mono ${product.overallScore >= 80 ? 'text-green-400' : product.overallScore >= 65 ? 'text-blue-400' : 'text-amber-400'}`}>{product.overallScore}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-slate-800/50"><div className="text-lg font-bold text-white">${product.prices.sellingPrice}</div><div className="text-xs text-slate-500">Price</div></div>
        <div className="text-center p-2 rounded-lg bg-slate-800/50"><div className="text-lg font-bold text-green-400">{product.prices.profitMargin}%</div><div className="text-xs text-slate-500">Margin</div></div>
        <div className="text-center p-2 rounded-lg bg-slate-800/50"><div className="text-lg font-bold text-purple-400">${product.prices.netProfit}</div><div className="text-xs text-slate-500">Profit</div></div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-slate-400"><span className="text-amber-400">★</span> {product.supplier.rating.toFixed(1)}/5</div>
        <div className="flex items-center gap-1.5 text-sm text-slate-400">{product.supplier.transactions.toLocaleString()} orders</div>
        <div className="flex items-center gap-1.5 text-sm text-slate-400">📦 {product.metrics.weight}</div>
      </div>

      {/* Product Link Button */}
      <a
        href={productLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/25"
      >
        <span>Find on AliExpress</span>
        <ExternalLink className="w-4 h-4" />
      </a>

      {product.risks.filter((r: any) => r.severity === 'high').length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">⚠️ High Risk Factors</div>
          {product.risks.filter((r: any) => r.severity === 'high').map((risk: any, i: number) => <p key={i} className="text-xs text-slate-400">{risk.description}</p>)}
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">{expanded ? 'Hide' : 'Show'} details {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
          {product.differentiators.length > 0 && (
            <div><h5 className="text-sm font-medium text-white mb-2">Differentiators</h5><ul className="space-y-1">{product.differentiators.map((d: string, i: number) => <li key={i} className="text-sm text-green-400 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />{d}</li>)}</ul></div>
          )}
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"><h5 className="text-sm font-medium text-purple-400 mb-1">Recommendation</h5><p className="text-sm text-slate-300">{product.recommendation}</p></div>
        </div>
      )}
    </div>
  );
}

function InsightsTab({ insights }: { insights: KeyInsight[] }) {
  const opportunities = insights.filter(i => i.type === 'opportunity');
  const warnings = insights.filter(i => i.type === 'warning');
  const info = insights.filter(i => i.type === 'info');

  const getIcon = (type: string) => type === 'opportunity' ? '📈' : type === 'warning' ? '⚠️' : 'ℹ️';
  const getBgColor = (type: string) => type === 'opportunity' ? 'bg-green-500/10 border-green-500/20' : type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20';
  const getImpactColor = (impact: string) => impact === 'high' ? 'text-red-400' : impact === 'medium' ? 'text-amber-400' : 'text-slate-400';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" />Opportunities</h3>
          <div className="space-y-4">{opportunities.map((insight, i) => (
            <div key={i} className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-5 ${getBgColor(insight.type)}`}>
              <div className="flex items-start gap-4">
                <div className="text-xl">{getIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2"><h4 className="font-semibold text-white">{insight.title}</h4><span className={`text-xs font-medium ${getImpactColor(insight.impact)}`}>{insight.impact.toUpperCase()} IMPACT</span></div>
                  <p className="text-slate-400 text-sm leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}</div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" />Warnings</h3>
          <div className="space-y-4">{warnings.map((insight, i) => (
            <div key={i} className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-5 ${getBgColor(insight.type)}`}>
              <div className="flex items-start gap-4">
                <div className="text-xl">{getIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2"><h4 className="font-semibold text-white">{insight.title}</h4><span className={`text-xs font-medium ${getImpactColor(insight.impact)}`}>{insight.impact.toUpperCase()} IMPACT</span></div>
                  <p className="text-slate-400 text-sm leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}</div>
        </div>
      </div>
      {info.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" />Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {info.map((insight, i) => (
              <div key={i} className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-4 ${getBgColor(insight.type)}`}>
                <div className="flex items-start gap-3">
                  <div className="text-lg">{getIcon(insight.type)}</div>
                  <div><h4 className="font-medium text-white text-sm mb-1">{insight.title}</h4><p className="text-xs text-slate-400">{insight.description}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VerificationTab({ nicheResult }: { nicheResult: NicheValidationResult }) {
  const completedChecks = nicheResult.manualChecks.filter(c => c.completed).length;
  const totalChecks = nicheResult.manualChecks.length;
  const progressPercent = (completedChecks / totalChecks) * 100;

  const handleToggleCheck = (checkId: string) => {
    // In a real app, this would update state
    console.log('Toggle check:', checkId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Manual Verification Checklist</h3>
            <p className="text-sm text-slate-400 mt-1">Complete these steps to validate your niche thoroughly</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">{completedChecks}/{totalChecks}</div>
            <div className="text-xs text-slate-500">completed</div>
          </div>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {nicheResult.manualChecks.map((check) => (
          <div key={check.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <button
                onClick={() => handleToggleCheck(check.id)}
                className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  check.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-slate-500 hover:border-purple-400'
                }`}
              >
                {check.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </button>
              <div className="flex-1">
                <h4 className={`font-semibold ${check.completed ? 'text-green-400 line-through' : 'text-white'}`}>{check.title}</h4>
                <p className="text-sm text-slate-400 mt-1">{check.description}</p>
                {check.completed && check.completedAt && (
                  <p className="text-xs text-slate-500 mt-2">Completed: {new Date(check.completedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-400">Why Manual Verification Matters</h4>
            <p className="text-sm text-slate-400 mt-1">
              Automated data can show you what's popular, but it cannot verify product quality, supplier reliability, or legal compliance. These manual steps are essential to reduce risk before investing in inventory and marketing.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-purple-400" />
          <h4 className="font-semibold text-white">Quick Links for Verification</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <a href="https://uspto.gov" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-colors flex items-center gap-2">
            <span className="text-sm text-white">USPTO Trademark Search</span>
            <ExternalLinkIcon className="w-4 h-4 text-slate-500" />
          </a>
          <a href="https://keepa.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-colors flex items-center gap-2">
            <span className="text-sm text-white">Keepa - Amazon Tracker</span>
            <ExternalLinkIcon className="w-4 h-4 text-slate-500" />
          </a>
          <a href="https://aliexpress.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-colors flex items-center gap-2">
            <span className="text-sm text-white">AliExpress - Find Suppliers</span>
            <ExternalLinkIcon className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
