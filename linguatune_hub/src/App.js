import React, { useState, useEffect } from "react";
import "./App.css";
import { fetchYouTubeVideos } from "./youtubeApi";
import { fetchLyrics } from "./lyricsApi";

// --- Constants for Theme and Language Columns ---
const COLORS = {
  primary: "#fe86d8",
  secondary: "#fffafa",
  accent: "#121111",
  lightBg: "#fffafa",
  lightText: "#121111",
  songCard: "#fff6fc",
  searchBar: "#f3eff7",
  border: "#eee"
};

const LANGUAGES = [
  { label: "English", key: "en", query: "english pop music" },
  { label: "Tamil", key: "ta", query: "tamil songs" },
  { label: "Hindi", key: "hi", query: "hindi bollywood music" },
  { label: "Telugu", key: "te", query: "telugu songs" },
  { label: "Malayalam", key: "ml", query: "malayalam songs" },
  { label: "Kannada", key: "kn", query: "kannada songs" }
];

// Mock lyrics for English and Hindi above; others do not get lyrics tab.
const canShowLyrics = (langKey) => langKey === "en" || langKey === "hi";

function fakeAuth({ username, password, isSignup }) {
  // Simple mock authentication – always succeeds if non-empty
  if (username.trim() && password.trim()) {
    return {
      username,
      // For demo purposes, not for real auth!
    };
  }
  return null;
}

// === COMPONENTS ===

// PUBLIC_INTERFACE
function App() {
  const [user, setUser] = useState(null);

  // Auth screen
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.lightBg }}>
        <Navbar isAuth={false} />
        <div style={{ marginTop: 90 }}>
          <AuthForm onAuthComplete={setUser} />
        </div>
      </div>
    );
  }

  // If authenticated, show dashboard
  return (
    <div style={{ minHeight: "100vh", background: COLORS.lightBg }}>
      <Navbar isAuth={true} user={user} onLogout={() => setUser(null)} />
      <Dashboard username={user.username} />
    </div>
  );
}

// PUBLIC_INTERFACE
function Navbar({ isAuth, user, onLogout }) {
  return (
    <nav
      className="navbar"
      style={{
        background: COLORS.primary,
        color: COLORS.lightText,
        borderBottom: `2px solid ${COLORS.primary}`,
      }}
    >
      <div className="container" style={{ maxWidth: 1400, width: "98%" }}>
        <div className="logo" style={{ color: COLORS.accent, fontWeight: 700 }}>
          <span style={{ fontSize: 30 }}>♫</span>{" "}
          <span style={{ color: COLORS.accent }}>LinguaTune Hub</span>
        </div>
        <div>
          {!isAuth ? (
            <a
              style={{
                textDecoration: "none",
                color: COLORS.accent,
                fontSize: 17,
                fontWeight: 600
              }}
              href="https://kavia.ai" target="_blank" rel="noreferrer"
            >by KAVIA AI
            </a>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ color: COLORS.accent, fontWeight: 500, fontSize: 15 }}>
                Hi, {user.username}
              </span>
              <button
                className="btn"
                style={{
                  background: COLORS.primary,
                  color: COLORS.lightText,
                  border: `1px solid ${COLORS.accent}`,
                  fontWeight: 600
                }}
                onClick={onLogout}
              >Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// PUBLIC_INTERFACE
function AuthForm({ onAuthComplete }) {
  const [form, setForm] = useState("login"); // or "signup"
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [fields, setFields] = useState({ username: "", password: "" });

  const onChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    setErr("");
  };

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const authed = fakeAuth({
        username: fields.username,
        password: fields.password,
        isSignup: form === "signup"
      });
      setLoading(false);
      if (authed) {
        onAuthComplete(authed);
      } else {
        setErr("Username and password required.");
      }
    }, 500);
  };

  return (
    <div
      style={{
        background: "#f8f8fc",
        borderRadius: 20,
        maxWidth: 370,
        margin: "50px auto",
        padding: "40px 32px",
        boxShadow: "0 4px 20px #ecebf880"
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontWeight: 700,
          marginBottom: 8,
          color: COLORS.accent
        }}
      >
        {form === "login" ? "Sign in to LinguaTune Hub" : "Create account"}
      </h2>
      <div style={{ textAlign: "center", marginBottom: 18, color: "#9b84a4" }}>
        {form === "login"
          ? "Welcome back! Enter your details to continue"
          : "Sign up to access the multilingual music dashboard."}
      </div>
      <form autoComplete="off" onSubmit={submit}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: 500, color: COLORS.accent, fontSize: 15 }}>
            Username
          </label>
          <input
            name="username"
            value={fields.username}
            onChange={onChange}
            className="input"
            style={inputStyle}
            autoFocus
            required
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: 500, color: COLORS.accent, fontSize: 15 }}>
            Password
          </label>
          <input
            name="password"
            value={fields.password}
            onChange={onChange}
            className="input"
            style={inputStyle}
            type="password"
            required
          />
        </div>
        {err && (
          <div style={{ color: "#e34040", fontSize: 14, marginBottom: 12 }}>{err}</div>
        )}
        <button
          className="btn"
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: COLORS.primary,
            color: COLORS.lightText,
            fontWeight: 600,
            border: `1px solid ${COLORS.accent}`,
            marginTop: 2
          }}
        >
          {loading
            ? (form === "login" ? "Signing In..." : "Registering...")
            : form === "login"
              ? "Login"
              : "Sign Up"}
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        {form === "login"
          ? <>Don&apos;t have an account?{" "}
            <button
              className="link-btn"
              type="button"
              onClick={() => { setForm("signup"); setErr(""); setFields({ username: "", password: "" }); }}
              style={linkBtnStyle}
            >Sign up</button></>
          : <>Already have an account?{" "}
            <button
              className="link-btn"
              type="button"
              onClick={() => { setForm("login"); setErr(""); setFields({ username: "", password: "" }); }}
              style={linkBtnStyle}
            >Login</button></>
        }
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Dashboard showing language names in a 3x2 row-wise grid, using theme colors,
 * OR (if a language is selected), show that language's search bar, curated artist/song list, Back button.
 *
 * All React hooks now appear unconditionally, outside conditional branches to avoid "Rendered more hooks" errors.
 */
function Dashboard({ username }) {
  // Always declare React state hooks at the top level.
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [searchVal, setSearchVal] = useState("");

  // Static or placeholder curated data for each language
  const CURATED = {
    en: [
      { artist: "Taylor Swift", title: "Love Story" },
      { artist: "Ed Sheeran", title: "Shape of You" },
      { artist: "Adele", title: "Hello" },
      { artist: "The Weeknd", title: "Blinding Lights" },
      { artist: "Beyoncé", title: "Halo" }
    ],
    hi: [
      { artist: "Arijit Singh", title: "Tum Hi Ho" },
      { artist: "Shreya Ghoshal", title: "Teri Meri" },
      { artist: "Sonu Nigam", title: "Kal Ho Naa Ho" },
      { artist: "KK", title: "Zara Sa" },
      { artist: "Atif Aslam", title: "Tu Jaane Na" }
    ],
    ta: [
      { artist: "Anirudh Ravichander", title: "Why This Kolaveri Di" },
      { artist: "Sid Sriram", title: "Ennodu Nee Irundhaal" },
      { artist: "Shreya Ghoshal", title: "Munbe Vaa" },
      { artist: "S.P. Balasubrahmanyam", title: "Nilaave Vaa" },
      { artist: "Chinmayi", title: "Sara Sara" }
    ],
    te: [
      { artist: "Devi Sri Prasad", title: "Seeti Maar" },
      { artist: "Sid Sriram", title: "Inkem Inkem Inkem Kaavaale" },
      { artist: "S. P. Balasubrahmanyam", title: "Priya Priya" },
      { artist: "Chinmayi", title: "Yem Sandeham Ledu" },
      { artist: "Shreya Ghoshal", title: "Hey Pillagada" }
    ],
    ml: [
      { artist: "Sithara Krishnakumar", title: "Vaanam Thilathilakkanu" },
      { artist: "Vijay Yesudas", title: "Malare" },
      { artist: "K. S. Chithra", title: "Anuraga Vilochananayi" },
      { artist: "Shreya Ghoshal", title: "Mizhiyoram" },
      { artist: "Hesham Abdul Wahab", title: "Darshana" }
    ],
    kn: [
      { artist: "Sonu Nigam", title: "Neene Neene" },
      { artist: "Armaan Malik", title: "Ondu Malebillu" },
      { artist: "Vijay Prakash", title: "Raajakumara" },
      { artist: "Chandan Shetty", title: "3 Peg" },
      { artist: "Shreya Ghoshal", title: "Ninnindale" }
    ],
  };

  // We always render EITHER single-language detail view, or the main grid.
  // Compute vars outside conditional for best eligibility checking.
  const lang =
    selectedLanguage !== null
      ? LANGUAGES.find((l) => l.key === selectedLanguage)
      : null;
  const curatedList =
    selectedLanguage !== null && CURATED[selectedLanguage]
      ? CURATED[selectedLanguage]
      : [];
  const filtered =
    selectedLanguage !== null && searchVal.trim()
      ? curatedList.filter(
          (s) =>
            s.artist.toLowerCase().includes(searchVal.trim().toLowerCase()) ||
            s.title.toLowerCase().includes(searchVal.trim().toLowerCase())
        )
      : curatedList;

  // If a language is selected, show the single-language detail view
  if (selectedLanguage) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - 85px)",
          marginTop: 75,
          background: COLORS.lightBg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            boxShadow: "0 4px 32px #f4e2eb2c",
            maxWidth: 430,
            width: "96vw",
            margin: "35px auto 0",
            padding: "37px 18px 22px 18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 15,
            }}
          >
            <h2
              style={{
                color: COLORS.primary,
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: "0.01em",
                margin: 0,
                flex: 1,
                lineHeight: 1.18,
              }}
            >
              {lang && lang.label} Songs
            </h2>
            <button
              className="btn"
              style={{
                padding: "8px 22px",
                background: COLORS.primary,
                color: COLORS.lightText,
                border: `1px solid ${COLORS.accent}`,
                fontWeight: 600,
                borderRadius: 8,
                minWidth: 0,
                fontSize: 16,
              }}
              onClick={() => {
                setSelectedLanguage(null);
                setSearchVal(""); // reset search for next entry
              }}
            >
              ← Back
            </button>
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={`Search by artist or song in ${lang ? lang.label : ""}`}
            className="input"
            style={{
              ...inputStyle,
              background: COLORS.searchBar,
              border: `1.4px solid ${COLORS.primary}`,
              color: COLORS.accent,
              marginBottom: 19,
              fontSize: 16,
            }}
            autoFocus
          />
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                color: "#b694bc",
                fontWeight: 500,
                fontSize: 15,
                marginBottom: 9,
              }}
            >
              Curated Artists & Songs
            </div>
            {filtered.length === 0 ? (
              <div style={{ color: "#aaa", fontSize: 15, textAlign: "center" }}>
                No songs found.
              </div>
            ) : (
              filtered.map((s, i) => (
                <div
                  key={s.artist + s.title + i}
                  style={{
                    background: COLORS.songCard,
                    borderRadius: 9,
                    boxShadow: "0 2px 10px #fe86d812",
                    marginBottom: 13,
                    padding: "14px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    border: `1.6px solid ${COLORS.primary}25`,
                  }}
                >
                  <div style={{ fontWeight: 600, color: COLORS.accent, fontSize: 17 }}>
                    {s.title}
                  </div>
                  <div style={{ color: "#a084a7", fontWeight: 500, fontSize: 14 }}>
                    {s.artist}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    );
  }

  // Otherwise, show the grid of language tiles.
  return (
    <main
      style={{
        minHeight: "calc(100vh - 70px)",
        marginTop: 75,
        background: COLORS.lightBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="lang-grid">
        {LANGUAGES.map((lang) => (
          <div
            className="lang-tile"
            key={lang.key}
            style={{ cursor: "pointer" }}
            tabIndex={0}
            role="button"
            aria-label={`Show ${lang.label} music`}
            onClick={() => {
              setSelectedLanguage(lang.key);
              setSearchVal(""); // clear search value whenever new lang selected
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedLanguage(lang.key);
                setSearchVal("");
              }
            }}
          >
            {lang.label}
          </div>
        ))}
      </div>
    </main>
  );
}

/**
 * PUBLIC_INTERFACE
 * Renders a column for a language: shows YouTube-fetched suggestions,
 * offers search-per-language, and displays loading/error feedback.
 */
function LanguageColumn({
  language,
  songSuggestions,
  onSongClick,
  showLyricsTab,
  selectedLyricsSongIdx,
  onCloseLyrics,
  loading,
  error,
  fetchLyricsApi
}) {
  const [searchStr, setSearchStr] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  // --- Lyrics panel async state (for EN/HI) ---
  const [lyricsState, setLyricsState] = useState({
    text: "",
    status: "idle", // "idle" | "loading" | "done" | "error"
    error: ""
  });

  // Refetch lyrics on new tab open/selection (only for EN/HI columns)
  useEffect(() => {
    let cancel = false;
    if (
      showLyricsTab &&
      typeof selectedLyricsSongIdx === "number" &&
      canShowLyrics(language.key)
    ) {
      const songList = searchStr.trim() ? searchResult : songSuggestions;
      const currSong = songList[selectedLyricsSongIdx];
      if (!currSong) {
        setLyricsState({ text: "", status: "idle", error: "" });
        return;
      }
      setLyricsState({ text: "", status: "loading", error: "" });
      fetchLyricsApi(currSong.artist, currSong.title)
        .then((lyrics) => {
          if (!cancel)
            setLyricsState({ text: lyrics, status: "done", error: "" });
        })
        .catch((e) => {
          if (!cancel)
            setLyricsState({
              text: "",
              status: "error",
              error:
                typeof e === "object" && e && e.message
                  ? e.message
                  : "Lyrics not found"
            });
        });
    } else {
      setLyricsState({ text: "", status: "idle", error: "" });
    }
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line
  }, [showLyricsTab, selectedLyricsSongIdx, searchStr, searchResult, songSuggestions, language.key, fetchLyricsApi]);

  // Handle search on user input
  useEffect(() => {
    let cancelled = false;
    async function doSearch() {
      if (!searchStr.trim()) {
        setSearchResult([]);
        setSearchLoading(false);
        setSearchError("");
        return;
      }
      setSearchLoading(true);
      setSearchError("");
      try {
        const videos = await fetchYouTubeVideos(
          `${searchStr} ${language.label} music`,
          { maxResults: 7 }
        );
        if (!cancelled) setSearchResult(videos);
      } catch (err) {
        if (!cancelled) setSearchError("Error fetching results");
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }
    doSearch();
    return () => { cancelled = true; };
    // Only run effect when searchStr or language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchStr, language.label]);

  // Show search results if searching, otherwise suggestions
  let songList = searchStr.trim()
    ? searchResult
    : songSuggestions;

  let isLoading = searchStr.trim() ? searchLoading : loading;
  let showError = searchStr.trim() ? searchError : error;

  return (
    <section
      style={{
        background: "#fff",
        borderRadius: 19,
        boxShadow: "0 2px 15px #f4e2eb44",
        padding: "14px 8px 16px 8px",
        width: 1,
        minWidth: 230,
        maxWidth: 265,
        flex: "1 1 220px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        position: "relative"
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontWeight: 600,
          color: COLORS.primary,
          fontSize: 20,
          margin: "6px 0 6px 0",
          letterSpacing: "0.01em"
        }}
      >
        {language.label}
      </div>
      <input
        type="text"
        value={searchStr}
        placeholder={`Search in ${language.label}...`}
        onChange={(e) => setSearchStr(e.target.value)}
        style={{
          ...inputStyle,
          background: COLORS.searchBar,
          color: COLORS.accent,
          border: `1px solid ${COLORS.primary}`,
          fontWeight: 500,
          padding: "8px 8px",
          marginBottom: 12,
          fontSize: 16
        }}
      />
      <div style={{ flex: "1 1 auto", minHeight: 50, marginBottom: 5 }}>
        {isLoading ? (
          <div style={{ color: "#af78c2", textAlign: "center", fontSize: 15 }}>
            Loading...
          </div>
        ) : showError ? (
          <div style={{ color: "#d33a4a", textAlign: "center", fontSize: 14 }}>
            {showError}
          </div>
        ) : songList.length === 0 ? (
          <div style={{ color: "#aaa", textAlign: "center", fontSize: 15 }}>
            No results found.
          </div>
        ) : (
          songList.map((song, idx) => (
            <SongCard
              key={(song.title || "") + (song.artist || "") + (song.videoId || idx)}
              song={song}
              langKey={language.key}
              idx={idx}
              canShowLyrics={canShowLyrics(language.key) && !!song.lyrics}
              onClick={() => onSongClick(idx)}
            />
          ))
        )}
      </div>
      {/* Lyrics Tab - only for columns that support it and have a selected song */}
      {showLyricsTab && typeof selectedLyricsSongIdx === "number" && (
        <LyricsPanel
          song={{
            ...songList[selectedLyricsSongIdx],
            lyrics:
              lyricsState.status === "done"
                ? lyricsState.text
                : undefined
          }}
          languageLabel={language.label}
          onClose={onCloseLyrics}
          lyricsStatus={lyricsState.status}
          lyricsError={lyricsState.error}
        />
      )}
    </section>
  );
}

// PUBLIC_INTERFACE
function SongCard({ song, canShowLyrics, onClick }) {
  return (
    <div
      onClick={canShowLyrics ? onClick : undefined}
      style={{
        background: COLORS.songCard,
        margin: "7px 4px",
        borderRadius: 9,
        padding: "12px 13px",
        marginBottom: 7,
        cursor: canShowLyrics ? "pointer" : "default",
        border: canShowLyrics ? `2px solid ${COLORS.primary}` : `1px solid #ececec`,
        boxShadow: canShowLyrics
          ? `0 2px 10px ${COLORS.primary}18`
          : "0 1px 4px #eee",
        transition: "background 0.13s"
      }}
      title={canShowLyrics ? "Select to see lyrics" : undefined}
    >
      <div style={{ fontWeight: 600, fontSize: 16, color: COLORS.accent }}>
        {song.title}
      </div>
      <div style={{ color: "#a084a7", fontSize: 13, fontWeight: 500 }}>
        {song.artist}
      </div>
      {canShowLyrics && (
        <div
          style={{
            marginTop: 4,
            fontSize: 13.5,
            color: COLORS.primary,
            fontWeight: 400
          }}
        >
          {/* Song provides lyrics */}
          <span
            style={{
              background: "#fff3ff",
              padding: "1.5px 7px",
              borderRadius: 9,
              fontSize: 12.3,
              marginLeft: 2
            }}
          >
            View Lyrics
          </span>
        </div>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function LyricsPanel({ song, languageLabel, onClose, lyricsStatus, lyricsError }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 61,
        left: 8,
        right: 8,
        zIndex: 99,
        background: COLORS.secondary,
        border: `2px solid ${COLORS.primary}`,
        borderRadius: 15,
        boxShadow: "0 8px 30px #bc6aa058",
        padding: "23px 18px 14px 18px",
        minHeight: 200,
        maxHeight: 310,
        overflowY: "auto",
        color: COLORS.accent,
        transition: "all 0.18s ease"
      }}
      tabIndex={0}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{ fontWeight: 700, fontSize: 19, color: COLORS.primary, marginBottom: 4 }}
        >
          Lyrics: <span style={{ color: COLORS.accent }}>{song.title}</span>
        </div>
        <button
          className="btn"
          style={{
            minWidth: 0,
            padding: "4px 10px",
            fontSize: 15,
            background: COLORS.primary,
            color: COLORS.lightText,
            border: `1px solid ${COLORS.accent}`,
            borderRadius: 8
          }}
          onClick={onClose}
        >Close</button>
      </div>
      <div style={{
        marginBottom: 7,
        color: "#906575",
        fontWeight: 500,
        fontSize: 14
      }}>
        {song.artist} &mdash; {languageLabel}
      </div>
      <pre
        style={{
          fontFamily: "inherit",
          fontSize: 15.2,
          background: "#faf7fa",
          padding: 12,
          borderRadius: 9,
          marginTop: 7,
          whiteSpace: "pre-wrap",
          color: COLORS.accent
        }}
      >
        {lyricsStatus === "loading"
          ? "Loading lyrics..."
          : lyricsStatus === "error"
          ? (lyricsError || "Lyrics not available.")
          : song.lyrics
          ? song.lyrics
          : "Lyrics not available."
        }
      </pre>
    </div>
  );
}

// -- General UI styles --
const inputStyle = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 8,
  border: `1.2px solid #ded3e7`,
  background: "#fff",
  color: COLORS.accent,
  fontSize: 16,
  marginTop: 3,
  outline: "none",
  marginBottom: 3,
  transition: "border 0.15s"
};

const linkBtnStyle = {
  border: "none",
  background: "none",
  color: COLORS.primary,
  cursor: "pointer",
  textDecoration: "underline",
  fontWeight: 600,
  fontSize: 15,
  padding: 0
};

export default App;
