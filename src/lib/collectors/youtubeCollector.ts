// YouTube Data API v3 Collector
// Free API - Requires YouTube Data API v3 key from Google Cloud Console

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
}

interface YouTubeChannelData {
  channelId: string;
  title: string;
  subscriberCount: number;
  videoCount: number;
}

interface YouTubeAnalysis {
  totalVideos: number;
  totalViews: number;
  avgViewCount: number;
  avgLikeCount: number;
  topVideos: YouTubeSearchResult[];
  channels: YouTubeChannelData[];
  contentScore: number;
  trendIndicator: 'rising' | 'stable' | 'declining';
}

export async function collectYouTubeData(keyword: string): Promise<YouTubeAnalysis> {
  if (!YOUTUBE_API_KEY) {
    // Return simulated data if no API key
    return generateSimulatedYouTubeData(keyword);
  }

  try {
    // Step 1: Search for videos
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?q=${encodeURIComponent(keyword)}&part=snippet&type=video&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return generateSimulatedYouTubeData(keyword);
    }

    // Step 2: Get video IDs
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // Step 3: Get video statistics
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?id=${videoIds}&part=statistics,contentDetails&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosResponse.json();

    // Step 4: Get channel information
    const channelIds = [...new Set(searchData.items.map((item: any) => item.snippet.channelId))].join(',');
    const channelsResponse = await fetch(
      `${YOUTUBE_API_BASE}/channels?id=${channelIds}&part=snippet,statistics&key=${YOUTUBE_API_KEY}`
    );
    const channelsData = await channelsResponse.json();

    // Process results
    const videos: YouTubeSearchResult[] = searchData.items.map((item: any, index: number) => {
      const stats = videosData.items?.[index]?.statistics || {};
      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        viewCount: parseInt(stats.viewCount || '0'),
        likeCount: parseInt(stats.likeCount || '0'),
        commentCount: parseInt(stats.commentCount || '0'),
        publishedAt: item.snippet.publishedAt,
      };
    });

    const channels: YouTubeChannelData[] = channelsData.items?.map((channel: any) => ({
      channelId: channel.id,
      title: channel.snippet.title,
      subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
      videoCount: parseInt(channel.statistics?.videoCount || '0'),
    })) || [];

    // Calculate metrics
    const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);
    const avgViewCount = videos.length > 0 ? totalViews / videos.length : 0;

    // Calculate trend (based on publication dates)
    const now = new Date();
    const recentVideos = videos.filter(v => {
      const pubDate = new Date(v.publishedAt);
      const daysDiff = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff < 30;
    });
    const trendIndicator = recentVideos.length > videos.length * 0.3 ? 'rising' :
                          recentVideos.length < videos.length * 0.1 ? 'declining' : 'stable';

    // Content score based on views and engagement
    const engagementRate = videos.length > 0 ?
      (totalLikes + videos.reduce((sum, v) => sum + v.commentCount, 0)) / totalViews : 0;
    const contentScore = Math.min(100, (avgViewCount / 10000) * 50 + engagementRate * 100);

    return {
      totalVideos: videos.length,
      totalViews,
      avgViewCount,
      avgLikeCount: videos.length > 0 ? totalLikes / videos.length : 0,
      topVideos: videos.sort((a, b) => b.viewCount - a.viewCount).slice(0, 10),
      channels,
      contentScore: Math.round(contentScore),
      trendIndicator,
    };
  } catch (error) {
    console.error('YouTube API error:', error);
    return generateSimulatedYouTubeData(keyword);
  }
}

// Simulated data fallback
function generateSimulatedYouTubeData(keyword: string): YouTubeAnalysis {
  const seed = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => Math.floor((Math.sin(seed) * 10000) % 1 * (max - min)) + min;

  const videoCount = random(50, 500);
  const avgViews = random(5000, 50000);

  return {
    totalVideos: videoCount,
    totalViews: videoCount * avgViews,
    avgViewCount: avgViews,
    avgLikeCount: Math.round(avgViews * 0.03),
    topVideos: Array.from({ length: 5 }, (_, i) => ({
      videoId: `sim_${i}`,
      title: `Best ${keyword} Review ${i + 1}`,
      channelTitle: `Tech Reviewer ${i + 1}`,
      viewCount: Math.round(avgViews * (1.5 - i * 0.2)),
      likeCount: Math.round(avgViews * 0.03 * (1.5 - i * 0.2)),
      commentCount: Math.round(avgViews * 0.005),
      publishedAt: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
    channels: Array.from({ length: 3 }, (_, i) => ({
      channelId: `ch_${i}`,
      title: `${keyword} Channel ${i + 1}`,
      subscriberCount: random(10000, 500000),
      videoCount: random(20, 200),
    })),
    contentScore: random(40, 80),
    trendIndicator: random(0, 2) > 1 ? 'rising' : random(0, 2) > 1 ? 'declining' : 'stable',
  };
}

export function getYouTubeVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYouTubeChannelUrl(channelId: string): string {
  return `https://www.youtube.com/channel/${channelId}`;
}
