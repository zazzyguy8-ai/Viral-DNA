const YT_API = "https://www.googleapis.com/youtube/v3";

export interface YouTubeChannelData {
  channelId: string;
  displayName: string;
  subscribers: number | null;
  totalViews: number | null;
  videoCount: number | null;
  recentVideos: Array<{
    title: string;
    views: number;
    likes: number;
    comments: number;
    publishedAt: string;
  }>;
}

interface YTChannelItem {
  id: string;
  snippet: { title: string; customUrl?: string };
  statistics: {
    subscriberCount?: string;
    viewCount?: string;
    videoCount?: string;
    hiddenSubscriberCount?: boolean;
  };
  contentDetails: { relatedPlaylists: { uploads: string } };
}

interface YTVideoItem {
  snippet: { title: string; publishedAt: string };
  statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
}

export async function fetchYouTubeChannel(handle: string): Promise<YouTubeChannelData | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  try {
    // Handle is either a UCxxxx channel ID or a @handle / username
    const isChannelId = /^UC[\w-]{22}$/.test(handle);
    const channelParam = isChannelId
      ? `id=${encodeURIComponent(handle)}`
      : `forHandle=${encodeURIComponent(handle)}`;

    const channelRes = await fetch(
      `${YT_API}/channels?part=snippet,statistics,contentDetails&${channelParam}&key=${key}`
    );
    if (!channelRes.ok) return null;

    const channelData = await channelRes.json() as { items?: YTChannelItem[] };
    const channel = channelData.items?.[0];
    if (!channel) return null;

    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
    let recentVideos: YouTubeChannelData["recentVideos"] = [];

    if (uploadsPlaylistId) {
      const playlistRes = await fetch(
        `${YT_API}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=15&key=${key}`
      );

      if (playlistRes.ok) {
        const playlistData = await playlistRes.json() as {
          items?: Array<{ contentDetails: { videoId: string } }>;
        };
        const videoIds = playlistData.items
          ?.map((i) => i.contentDetails?.videoId)
          .filter(Boolean)
          .join(",");

        if (videoIds) {
          const videosRes = await fetch(
            `${YT_API}/videos?part=snippet,statistics&id=${videoIds}&key=${key}`
          );
          if (videosRes.ok) {
            const videosData = await videosRes.json() as { items?: YTVideoItem[] };
            recentVideos = (videosData.items ?? []).map((v) => ({
              title: v.snippet?.title ?? "",
              views: parseInt(v.statistics?.viewCount ?? "0"),
              likes: parseInt(v.statistics?.likeCount ?? "0"),
              comments: parseInt(v.statistics?.commentCount ?? "0"),
              publishedAt: v.snippet?.publishedAt ?? "",
            }));
          }
        }
      }
    }

    const stats = channel.statistics;
    return {
      channelId: channel.id,
      displayName: channel.snippet?.title ?? handle,
      subscribers: stats?.hiddenSubscriberCount
        ? null
        : stats?.subscriberCount
        ? parseInt(stats.subscriberCount)
        : null,
      totalViews: stats?.viewCount ? parseInt(stats.viewCount) : null,
      videoCount: stats?.videoCount ? parseInt(stats.videoCount) : null,
      recentVideos,
    };
  } catch (err) {
    console.error("YouTube API error:", err);
    return null;
  }
}

export function formatYouTubeDataForPrompt(data: YouTubeChannelData): string {
  const fmt = (n: number | null) =>
    n === null ? "hidden" : n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

  const topVideos = [...data.recentVideos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const avgViews =
    data.recentVideos.length > 0
      ? Math.round(data.recentVideos.reduce((s, v) => s + v.views, 0) / data.recentVideos.length)
      : null;

  return `REAL YOUTUBE DATA (from YouTube API — use these exact numbers):
- Channel: ${data.displayName}
- Subscribers: ${fmt(data.subscribers)}
- Total channel views: ${fmt(data.totalViews)}
- Total videos: ${fmt(data.videoCount)}
- Avg views per recent video: ${avgViews !== null ? fmt(avgViews) : "unknown"}

Recent videos (last 15, sorted by views):
${topVideos.map((v, i) => `  ${i + 1}. "${v.title}" — ${fmt(v.views)} views, ${fmt(v.likes)} likes (${v.publishedAt.slice(0, 10)})`).join("\n")}
${data.recentVideos.length > 5 ? `  ... and ${data.recentVideos.length - 5} more recent videos` : ""}`;
}
