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
 *
 * Enhanced with debug logging and stricter checks for API key and response integrity.
 */
export async function fetchYouTubeVideos(query, opts = {}) {
  // Always use the exported API key variable for consistency.
  if (!YOUTUBE_API_KEY) {
    console.error("[YouTubeAPI] No API key set.");
    throw new Error("YouTube API key is not set.");
  }

  // Query normalization: strip extra quotes/unicode and compress whitespace
  function normalizeQuery(q) {
    return q
      .replace(/["'‘’“”´`]/g, "")            // remove all quote marks
      .replace(/[^\w\sÀ-ſ\-\&\(\)]/g, "") // keep broad Unicode for music names
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  const normalizedQuery = normalizeQuery(query);

  const maxResults = opts.maxResults || 8;
  const regionCode = opts.regionCode || ""; // Optional: restrict by country
  const params = new URLSearchParams({
    part: "snippet",
    key: YOUTUBE_API_KEY,
    q: normalizedQuery,
    maxResults,
    type: "video",
    videoCategoryId: "10", // Music
    ...(regionCode ? { regionCode } : {}),
    safeSearch: "moderate"
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  let response, debugInfo = {};
  try {
    response = await fetch(url);
    debugInfo.status = response.status;
  } catch (err) {
    console.error(`[YouTubeAPI] Network error: ${err && err.message}`);
    throw new Error("Failed to connect to YouTube API: " + (err && err.message));
  }
  if (!response.ok) {
    // Detect API quota errors (YouTube sends 403 w/ details in .error.errors[0].reason) or generic errors
    let errMsg = `YouTube API error: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error && errJson.error.errors && errJson.error.errors[0] && errJson.error.errors[0].reason) {
        errMsg = `YouTube API error: ${errJson.error.errors[0].reason}`;
        console.error(`[YouTubeAPI] API error response:`, errJson.error);
        debugInfo.errorReason = errJson.error.errors[0].reason;
      }
    } catch (errParse) {
      console.error("[YouTubeAPI] Failed to parse error response from API.", errParse);
    }
    console.error(`[YouTubeAPI] Response not ok (${response.status}): ${errMsg}`);
    throw new Error(errMsg);
  }
  let data;
  try {
    data = await response.json();
  } catch (err) {
    console.error("[YouTubeAPI] Could not parse JSON response.", err);
    throw new Error("YouTube API: invalid response format.");
  }
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    console.warn("[YouTubeAPI] No search results for query:", query);
    return [];
  }
  // Map YouTube response to the app's song item shape
  // Also provide logging for each videoId resolved (for debug)
  const videoList = data.items
    .filter((item) => item.id && item.id.videoId && item.snippet)
    .map((item) => {
      const id = item.id.videoId;
      const title = item.snippet.title;
      const channel = item.snippet.channelTitle;
      const thumb = item.snippet.thumbnails && item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : "";
      if (!id) {
        console.warn(`[YouTubeAPI] Item missing videoId for query:`, query, item);
      }
      return {
        videoId: id,
        title: title,
        artist: channel,
        thumbnail: thumb,
        lyrics: null
      };
    });
  if (!videoList.length) {
    console.warn("[YouTubeAPI] All API items missing videoId or snippet for query:", query, data);
  } else {
    console.debug(
      `[YouTubeAPI] Query "${query}" got videoId(s): ${videoList.map(x => x.videoId).join(", ")}`
    );
  }
  return videoList;
}
