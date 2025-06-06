/**
 * Exports the YouTube Data API key for use across the app to ensure a single source of truth.
 */
export const YOUTUBE_API_KEY = "AIzaSyDiFCOiIRftlin1m8BTbp4jMvNnNy7tPyc"; // Provided API key

/**
 * PUBLIC_INTERFACE
 * Search for music videos on YouTube by query and (optionally) region/language.
 *
 * @param {string} query The search query (song name & artist or language)
 * @param {object} opts { maxResults: number, regionCode: string }
 * @returns {Promise<Array>} Array of YouTube video info objects
 */
export async function fetchYouTubeVideos(query, opts = {}) {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key is not set.");
  }
  const maxResults = opts.maxResults || 8;
  const regionCode = opts.regionCode || ""; // Optional: restrict by country
  const params = new URLSearchParams({
    part: "snippet",
    key: YOUTUBE_API_KEY,
    q: query,
    maxResults,
    type: "video",
    videoCategoryId: "10", // Music
    ...(regionCode ? { regionCode } : {}),
    safeSearch: "moderate"
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.items) return [];
  // Map YouTube response to the app's song item shape
  return data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails && item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : "",
    // Lyrics unavailable by default; demo only
    lyrics: null,
  }));
}
