 // PUBLIC_INTERFACE
/**
 * Fetch lyrics for a given artist and song title using lyrics.ovh API.
 * @param {string} artist
 * @param {string} title
 * @returns {Promise<string>} Lyrics text, or throws error if unavailable.
 */
export async function fetchLyrics(artist, title) {
  const safeArtist = encodeURIComponent(artist.trim());
  const safeTitle = encodeURIComponent(title.trim());
  const url = `https://api.lyrics.ovh/v1/${safeArtist}/${safeTitle}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Lyrics not found");
    }
    const data = await res.json();
    if (data && typeof data.lyrics === "string" && data.lyrics.trim()) {
      return data.lyrics.trim();
    }
    throw new Error("Lyrics not available.");
  } catch (err) {
    throw new Error("Failed to fetch lyrics.");
  }
}
