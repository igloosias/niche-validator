import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, Database, BarChart3, Share2, Globe } from 'lucide-react';

interface BackendStatus {
  connected: boolean;
  url: string;
  checking: boolean;
  tools: {
    pytrends: 'connected' | 'simulated' | 'unavailable';
    agentReach: 'connected' | 'simulated' | 'unavailable';
    scrapegraphai: 'connected' | 'simulated' | 'unavailable';
    crawl4ai: 'connected' | 'simulated' | 'unavailable';
    firecrawl: 'connected' | 'simulated' | 'unavailable';
  };
  lastChecked: Date | null;
}

const BACKEND_URL = import.meta.env.VITE_SCRAPER_SERVER_URL || 'https://niche-validator-production-5c6b.up.railway.app';

export function BackendStatusIndicator() {
  const [status, setStatus] = useState<BackendStatus>({
    connected: false,
    url: BACKEND_URL,
    checking: true,
    tools: {
      pytrends: 'unavailable',
      agentReach: 'unavailable',
      scrapegraphai: 'unavailable',
      crawl4ai: 'unavailable',
      firecrawl: 'connected' // Firecrawl is frontend-based
    },
    lastChecked: null
  });

  useEffect(() => {
    checkBackendStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  async function checkBackendStatus() {
    if (!BACKEND_URL) {
      setStatus(prev => ({
        ...prev,
        checking: false,
        connected: false,
        lastChecked: new Date()
      }));
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        // Backend is running - try to get tools status
        try {
          // Try /status endpoint first (fast)
          let statusResponse = await fetch(`${BACKEND_URL}/status`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });

          // Fallback to /validate/test if /status not available
          if (!statusResponse.ok) {
            statusResponse = await fetch(`${BACKEND_URL}/validate/test`, {
              method: 'GET',
              signal: AbortSignal.timeout(5000)
            });
          }

          if (statusResponse.ok) {
            const data = await statusResponse.json();

            // Get all data sources from response
            const dataSources = data.data_sources || [];

            // Map backend sources to frontend tool status
            // Priority: Real > Simulated > Error > nothing
            // Use the BEST match for each tool category
            const sourceToTool: Record<string, string> = {};

            const getSourcePriority = (source: string): number => {
              const lower = source.toLowerCase();
              if (lower.includes('error')) return 0;
              if (lower.includes('simulated')) return 1;
              if (lower.includes('real')) return 2;
              return -1;
            };

            const betterMatch = (existing: string | undefined, candidate: string): boolean => {
              if (existing === undefined) return true;
              return getSourcePriority(candidate) > getSourcePriority(existing);
            };

            dataSources.forEach((source: string) => {
              const lower = source.toLowerCase();

              // pytrends
              if (lower.includes('pytrends') || lower.includes('trends')) {
                if (betterMatch(sourceToTool['pytrends'], source)) {
                  sourceToTool['pytrends'] = source;
                }
              }

              // Agent-Reach (Reddit, YouTube, Twitter)
              if (lower.includes('praw') || lower.includes('reddit') || lower.includes('youtube') || lower.includes('ytdlp') || lower.includes('yt-dlp') || lower.includes('agent') || lower.includes('twitter')) {
                if (betterMatch(sourceToTool['agentReach'], source)) {
                  sourceToTool['agentReach'] = source;
                }
              }

              // ScrapeGraphAI
              if (lower.includes('scrapegraph')) {
                if (betterMatch(sourceToTool['scrapegraphai'], source)) {
                  sourceToTool['scrapegraphai'] = source;
                }
              }

              // Crawl4AI
              if (lower.includes('crawl4ai') || lower.includes('crawl')) {
                if (betterMatch(sourceToTool['crawl4ai'], source)) {
                  sourceToTool['crawl4ai'] = source;
                }
              }

              // Firecrawl (usually not in backend, but check anyway)
              if (lower.includes('firecrawl')) {
                if (betterMatch(sourceToTool['firecrawl'], source)) {
                  sourceToTool['firecrawl'] = source;
                }
              }
            });

            // Determine status for each tool
            const getToolStatus = (toolKey: string): 'connected' | 'simulated' | 'unavailable' => {
              const source = sourceToTool[toolKey];
              if (source === undefined) return 'unavailable';
              if (source.toLowerCase().includes('error')) return 'unavailable';
              if (source.toLowerCase().includes('simulated')) return 'simulated';
              return 'connected';
            };

            setStatus({
              connected: true,
              url: BACKEND_URL,
              checking: false,
              tools: {
                pytrends: getToolStatus('pytrends'),
                agentReach: getToolStatus('agentReach'),
                scrapegraphai: getToolStatus('scrapegraphai'),
                crawl4ai: getToolStatus('crawl4ai'),
                firecrawl: getToolStatus('firecrawl')
              },
              lastChecked: new Date()
            });
            return;
          }
        } catch {
          // Status check failed - backend is up but tools might be loading
        }

        // Backend is up but tools might be loading
        setStatus(prev => ({
          ...prev,
          connected: true,
          checking: false,
          lastChecked: new Date()
        }));
      }
    } catch {
      // Backend not available
      setStatus(prev => ({
        ...prev,
        connected: false,
        checking: false,
        lastChecked: new Date()
      }));
    }
  }

  const getToolStatus = (status: 'connected' | 'simulated' | 'unavailable') => {
    switch (status) {
      case 'connected':
        return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Real' };
      case 'simulated':
        return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Simulated' };
      case 'unavailable':
        return { color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'N/A' };
    }
  };

  const ToolBadge = ({ name, icon: Icon, status }: { name: string; icon: any; status: 'connected' | 'simulated' | 'unavailable' }) => {
    const style = getToolStatus(status);
    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded ${style.bg}`}>
        <Icon className={`w-3 h-3 ${style.color}`} />
        <span className="text-xs text-gray-300">{name}</span>
        <span className={`text-xs font-medium ${style.color}`}>{style.label}</span>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {status.checking ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : status.connected ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-gray-500" />
          )}
          <div>
            <h3 className="text-sm font-medium text-white">
              {status.checking ? 'Checking Backend...' :
               status.connected ? 'Backend Connected' : 'Backend Offline'}
            </h3>
            <p className="text-xs text-gray-400">
              {status.connected ? status.url : 'Start server: python server/scraper_server.py'}
            </p>
          </div>
        </div>
        <button
          onClick={checkBackendStatus}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs text-gray-300 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Data Sources Status */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-2">Data Sources</h4>
          <div className="flex flex-wrap gap-2">
            <ToolBadge name="Firecrawl" icon={Globe} status={status.tools.firecrawl} />
            <ToolBadge name="pytrends" icon={BarChart3} status={status.tools.pytrends} />
            <ToolBadge name="Agent-Reach" icon={Share2} status={status.tools.agentReach} />
            <ToolBadge name="ScrapeGraphAI" icon={Database} status={status.tools.scrapegraphai} />
            <ToolBadge name="Crawl4AI" icon={Globe} status={status.tools.crawl4ai} />
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-700">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-400">Real data</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-400">Simulated</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span className="text-xs text-gray-400">Unavailable</span>
          </div>
        </div>

        {status.lastChecked && (
          <p className="text-xs text-gray-500">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

// Hook to get backend status
export function useBackendStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    serverUrl: string;
    tools: BackendStatus['tools'];
  }>({
    connected: false,
    serverUrl: BACKEND_URL,
    tools: {
      pytrends: 'unavailable',
      agentReach: 'unavailable',
      scrapegraphai: 'unavailable',
      crawl4ai: 'unavailable',
      firecrawl: 'connected'
    }
  });

  useEffect(() => {
    async function check() {
      if (!BACKEND_URL) {
        setStatus(s => ({ ...s, connected: false }));
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/health`, {
          signal: AbortSignal.timeout(3000)
        });
        setStatus(s => ({ ...s, connected: response.ok }));
      } catch {
        setStatus(s => ({ ...s, connected: false }));
      }
    }

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
