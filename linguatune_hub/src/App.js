import React, { useState, useEffect } from "react";
import "./App.css";
import { fetchYouTubeVideos } from "./youtubeApi";

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

// PUBLIC_INTERFACE
function Dashboard({ username }) {
  // State: Which column/language is lyrics tab open for (if any) and what song is selected
  const [selectedLyrics, setSelectedLyrics] = useState(null);
  // Structure: { langKey, songIndex }

  // Called when a song is selected
  const handleSongClick = (langKey, idx) => {
    if (canShowLyrics(langKey)) {
      setSelectedLyrics({ langKey, songIndex: idx });
    }
  };

  // Called when lyrics panel is closed
  const closeLyrics = () => setSelectedLyrics(null);

  return (
    <main style={{
      minHeight: "calc(100vh - 70px)",
      marginTop: 75, // For navbar
      background: COLORS.lightBg,
      padding: "0",
      overflowX: "auto"
    }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          width: "100%",
          maxWidth: 1450,
          margin: "0 auto",
          gap: 18,
          boxSizing: "border-box",
          padding: "18px 16px 30px 16px"
        }}
      >
        {LANGUAGES.map((lang, cIdx) => (
          <LanguageColumn
            key={lang.key}
            language={lang}
            songSuggestions={CURATED_SONGS[lang.key] || []}
            onSongClick={(idx) => handleSongClick(lang.key, idx)}
            showLyricsTab={
              selectedLyrics &&
              selectedLyrics.langKey === lang.key &&
              canShowLyrics(lang.key)
            }
            selectedLyricsSongIdx={
              selectedLyrics && selectedLyrics.langKey === lang.key
                ? selectedLyrics.songIndex
                : undefined
            }
            onCloseLyrics={closeLyrics}
          />
        ))}
      </div>
    </main>
  );
}

// PUBLIC_INTERFACE
function LanguageColumn({
  language,
  songSuggestions,
  onSongClick,
  showLyricsTab,
  selectedLyricsSongIdx,
  onCloseLyrics
}) {
  const [searchStr, setSearchStr] = useState("");
  const filteredSongs = searchStr.trim()
    ? songSuggestions.filter(
        (song) =>
          (song.title &&
            song.title.toLowerCase().includes(searchStr.trim().toLowerCase())) ||
          (song.artist &&
            song.artist.toLowerCase().includes(searchStr.trim().toLowerCase()))
      )
    : songSuggestions;

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
        {filteredSongs.length === 0 ? (
          <div style={{ color: "#aaa", textAlign: "center", fontSize: 15 }}>
            No results found.
          </div>
        ) : (
          filteredSongs.map((song, idx) => (
            <SongCard
              key={song.title + song.artist}
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
          song={songSuggestions[selectedLyricsSongIdx]}
          languageLabel={language.label}
          onClose={onCloseLyrics}
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
function LyricsPanel({ song, languageLabel, onClose }) {
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
        {song.lyrics || "Lyrics not available."}
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
