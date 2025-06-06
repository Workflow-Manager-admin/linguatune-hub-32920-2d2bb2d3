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
  // Always use the exported API key variable for consistency.
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
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    // Network error or similar
    return [];
  }
  if (!response.ok) {
    // Detect API quota errors (YouTube sends 403 w/ details in .error.errors[0].reason) or generic errors
    let errMsg = `YouTube API error: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error && errJson.error.errors && errJson.error.errors[0] && errJson.error.errors[0].reason) {
        errMsg = `YouTube API error: ${errJson.error.errors[0].reason}`;
      }
    } catch {}
    // Graceful fallback: treat as "no results"
    return [];
  }
  let data;
  try {
    data = await response.json();
  } catch {
    return [];
  }
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    return [];
  }
  // Map YouTube response to the app's song item shape
  return data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails && item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : "",
    lyrics: null
  }));
}
