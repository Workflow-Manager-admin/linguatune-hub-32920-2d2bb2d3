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
  { label: "Tamil", key: "ta", query: "tamil songs" }
];

/**
 * Demo Artist DB for refactor: 
 * Map of artistType: { name, songs[] }
 * In a real app, fetch from backend/db. Here, we synthesize ~50 artists per role/language.
 */
function makeDemoArtists(langKey) {
  const SINGER_SEED = {
    en: [
      { name: "Taylor Swift", songs: ["Love Story", "Cardigan", "Blank Space", "Shake It Off", "Cruel Summer"] },
      { name: "Ed Sheeran", songs: ["Shape of You", "Perfect", "Thinking Out Loud", "Photograph", "Castle on the Hill"] },
      { name: "Adele", songs: ["Hello", "Someone Like You", "Rolling in the Deep", "Set Fire to the Rain", "Skyfall"] },
      { name: "Bruno Mars", songs: ["Uptown Funk", "Grenade", "Just The Way You Are", "That's What I Like", "When I Was Your Man"] },
      { name: "Beyoncé", songs: ["Halo", "Single Ladies", "Crazy In Love", "Irreplaceable", "Love On Top"] },
      { name: "The Weeknd", songs: ["Blinding Lights", "Starboy", "Save Your Tears", "Can't Feel My Face", "Earned It"] }
    ],
    ta: [
      { name: "Sean Roldan", songs: ["Vaanam Kottattum", "Pariyerum Perumal Theme", "Mayakka Ponna"] },
      { name: "Pradeep Kumar", songs: ["Aagayam Theepidicha", "Maya Nadhi", "Naan Nee", "Kannamma"] },
      { name: "Dhanush", songs: ["Rowdy Baby", "Kolaveri Di", "Amma Amma", "Po Indru Neeyaga", "Thulli Thulli"] },
      { name: "Karthik", songs: ["Ava Enna", "Unakkena Iruppen", "Usure Pogudhey", "Oru Naalil", "Vizhi Moodi"] },
      { name: "Sid Sriram", songs: ["Ennodu Nee Irundhaal", "Maruvaarthai", "Thalli Pogathey", "Unakku Thaan", "Adiye"] },
      { name: "Chinmayi", songs: ["Sara Sara", "Oh Penne"] }
    ]
  };

  const MUSIC_DIRECTOR_SEED = {
    en: [
      { name: "Max Martin", songs: ["Shake It Off", "Blank Space", "Can't Stop The Feeling", "Roar", "I Kissed a Girl"] },
      { name: "Mark Ronson", songs: ["Uptown Funk", "Nothing Breaks Like a Heart", "Daffodils", "Somebody to Love Me", "Valerie"] },
      { name: "Greg Kurstin", songs: ["Hello", "Chasing Pavements", "Send My Love", "Water Under the Bridge", "Stronger"] },
      { name: "Ryan Tedder", songs: ["Halo", "Rumour Has It", "Counting Stars", "Apologize", "Bleeding Love"] },
      { name: "Pharrell Williams", songs: ["Happy", "Get Lucky", "Blurred Lines", "Freedom", "Frontin'"] },
      { name: "Finneas O'Connell", songs: ["bad guy", "everything i wanted", "lovely", "When the Party's Over", "Bury a Friend"] }
    ],
    ta: [
      { name: "Ilaiyaraaja", songs: ["Mandram Vandha", "Nilaave Vaa", "Ennulle Ennulle", "Anandha Raagam", "Valaiyosai", "En Iniya Pon Nilave"] },
      { name: "A. R. Rahman", songs: ["New York Nagaram", "Munbe Vaa", "Ennodu Nee Irundhal", "Uyire Uyire", "Vennilave Vennilave"] },
      { name: "Anirudh Ravichander", songs: ["Vaathi Coming", "Why This Kolaveri Di", "Chellamma", "Kaadhal Kan Kattudhe", "Neeyum Naanum"] },
      { name: "Sean Roldan", songs: ["Vaanam Kottattum", "Mayakka Ponna", "Paraak Paraak", "Kaalam Ingu Sari Illai"] },
      { name: "Ghibran", songs: ["Maara Theme", "Sara Sara", "Vikram Title Track", "Neeye", "Raja Raja Chozhan"] },
      { name: "D. Imman", songs: ["Kannaana Kanney"] },
      { name: "Harris Jayaraj", songs: ["Un Perai Sollum", "Neethane En Ponvasantham", "Vaarayo Vaarayo", "Vaseegara", "Uyirin Uyire"] },
      { name: "Yuvan Shankar Raja", songs: ["Idhu Varai", "Pudhu Metro Rail", "Ninaithu Ninaithu"] },
      { name: "Srikanth Deva", songs: ["Saravana", "Ulagam Unnai", "Dhanushka", "Madura Veeran", "Kadhal Virus"] }
    ]
  };

  return {
    singers: SINGER_SEED[langKey] || [],
    musicDirectors: MUSIC_DIRECTOR_SEED[langKey] || []
  };
}

// Lyrics tab: now only English (en)
const canShowLyrics = (langKey) => langKey === "en";

function fakeAuth({ username, password, isSignup }) {
  if (username.trim() && password.trim()) {
    return { username };
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
  const [form, setForm] = useState("login");
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

/* PUBLIC_INTERFACE - Refactored Dashboard for dual-column (singer/music director) artist display */
function Dashboard({ username }) {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [roleSelection, setRoleSelection] = useState(null); // "singers" or "music-directors"
  const [artistGridPage, setArtistGridPage] = useState(0);
  const [songVideos, setSongVideos] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [openPlayers, setOpenPlayers] = useState({});
  const [searchVal, setSearchVal] = useState("");

  function getArtists(langKey) {
    if (!langKey) return { singers: [], musicDirectors: [] };
    return makeDemoArtists(langKey);
  }

  useEffect(() => {
    setArtistGridPage(0);
    setSearchVal("");
  }, [selectedLanguage, roleSelection]);

  useEffect(() => {
    if (!selectedLanguage || !roleSelection) return;
    const { singers, musicDirectors } = getArtists(selectedLanguage);
    const targetList = roleSelection === "singers" ? singers : musicDirectors;
    const gridArtists = targetList.filter(a =>
      !searchVal.trim() ||
      a.name.toLowerCase().includes(searchVal.trim().toLowerCase())
    ).slice(artistGridPage * 9, artistGridPage * 9 + 9);

    gridArtists.forEach(artist => {
      let songs = artist.songs;
      if (songs.length < 5) songs = Array(5).fill(0).map((_, i) => songs[i % artist.songs.length]);
      songs.slice(0, 5).forEach(songTitle => {
        const key = `${roleSelection === "singers" ? "singer" : "director"}|${artist.name}|${songTitle}`;
        if (songVideos[key] !== undefined) return;
        setLoadingMap(lm => ({ ...lm, [key]: true }));
        fetchYouTubeVideos(`${artist.name} ${songTitle}`, { maxResults: 1 })
          .then(videos => {
            let errMsg = "";
            let videoObj = null;
            if (!Array.isArray(videos) || videos.length === 0) {
              errMsg = "No video found.";
            } else {
              videoObj = videos[0];
            }
            setSongVideos(prev => ({ ...prev, [key]: videoObj }));
            setErrorMap(prev => ({ ...prev, [key]: errMsg }));
            setLoadingMap(prev => ({ ...prev, [key]: false }));
          })
          .catch((e) => {
            setSongVideos(prev => ({ ...prev, [key]: null }));
            setErrorMap(prev => ({ ...prev, [key]: (e && e.message && e.message.indexOf("quota") >= 0)
              ? "YouTube API limit reached. Please try later."
              : (e && e.message ? e.message : "Could not load video.")
            }));
            setLoadingMap(prev => ({ ...prev, [key]: false }));
          });
      });
    });
    // eslint-disable-next-line
  }, [selectedLanguage, roleSelection, artistGridPage, searchVal]);

  function ArtistGridCard({ artist, role }) {
    let songs = artist.songs && artist.songs.length < 5
      ? Array(5).fill(0).map((_, i) => artist.songs[i % artist.songs.length])
      : artist.songs;
    songs = songs.slice(0, 5);

    return (
      <div style={{
        background: COLORS.songCard,
        borderRadius: 15,
        boxShadow: "0 2px 16px #cd99d222",
        border: `2px solid ${role === "singer" ? COLORS.primary : "#af78c2"}`,
        color: COLORS.accent,
        padding: "14px 7px 13px 7px",
        minHeight: 330,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch"
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: 20,
          color: role === "singer" ? COLORS.primary : "#af78c2",
          marginBottom: 12,
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <span style={{ fontSize: 22, marginRight: 8 }}>
            {role === "singer" ? "🎤" : "🎼"}
          </span>
          {artist.name}
        </div>
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 10,
        }}>
          {songs.map((songTitle, idx) => {
            const songKey = `${role}|${artist.name}|${songTitle}`;
            const video = songVideos[songKey];
            const error = errorMap[songKey];
            const loading = loadingMap[songKey];
            // Only show LyricsFetcher for English
            return (
              <div
                key={songKey}
                style={{
                  background: "#f9edfa",
                  borderRadius: 8,
                  padding: 0,
                  marginBottom: idx < 4 ? 3 : 0,
                  display: "flex", flexDirection: "column", alignItems: "center"
                }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: COLORS.accent,
                  marginBottom: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <span>{songTitle}</span>
                </div>
                <div style={{ width: "100%", minHeight: 70 }}>
                  {loading && (
                    <div style={{ color: "#af78c2", fontSize: 11 }}>
                      Loading…
                    </div>
                  )}
                  {!loading && video && video.videoId && (
                    <iframe
                      title={artist.name + "|" + songTitle}
                      width="95%"
                      height="81"
                      style={{
                        borderRadius: 6,
                        boxShadow: "0 3px 8px #aa63e732",
                        margin: "0 auto",
                        background: "#fff"
                      }}
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {!loading && (!video || !video.videoId) && (
                    <div
                      style={{
                        color: "#e95271",
                        fontSize: 11,
                        marginTop: 2,
                        marginBottom: 4,
                        width: "93%",
                        padding: "5px 1vw",
                        background: "#fff4f4",
                        border: "1px dashed #ffb0c2",
                        borderRadius: 5,
                        minHeight: 20,
                        textAlign: "center"
                      }}
                    >
                      {error?.includes("limit") ? (
                        <>
                          <span role="img" aria-label="sad">😕</span>{" "}
                          <strong>YouTube API limit reached.</strong> Try again later.<br />
                          <span style={{ color: "#b43867", fontSize: 10 }}>
                            (If you frequently see this, this is a demo site and the API quota resets daily.<br />
                            Try searching directly on YouTube, or retry in a few hours!)
                          </span>
                        </>
                      ) : error ? (
                        <>
                          <span role="img" aria-label="no-video">🎬</span>{" "}
                          <span>
                            {error === "No video found." || error === "No result" || error === "No video"
                              ? "No music video found for this song. Please double-check the artist and song name, or try a wider search."
                              : error}
                          </span>
                        </>
                      ) : (
                        <>
                          <span role="img" aria-label="not-found">🔍</span>{" "}
                          No music video available.<br />
                          <span style={{ color: "#b43867", fontSize: 10 }}>
                            (Try rewording your search, or visit YouTube directly.)
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {/* English only: Show lyrics tab */}
                  {canShowLyrics(selectedLanguage) &&
                    <LyricsFetcher artist={artist.name} title={songTitle} />
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Language grid selection
  if (!selectedLanguage) {
    return (
      <main style={{
        minHeight: "calc(100vh - 70px)",
        marginTop: 75,
        background: COLORS.lightBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
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
                setRoleSelection(null);
                setArtistGridPage(0);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedLanguage(lang.key);
                  setRoleSelection(null);
                  setArtistGridPage(0);
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

  if (!roleSelection) {
    return (
      <main style={{
        minHeight: "calc(100vh - 75px)",
        marginTop: 75,
        background: COLORS.lightBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 34,
          boxShadow: "0 4px 30px #e8bfdc44",
          width: "95vw",
          maxWidth: 880,
          margin: "40px auto 0",
          padding: "42px 0 40px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}>
          <button
            className="btn"
            style={{
              width: 105, alignSelf: "flex-start",
              marginLeft: 45, marginBottom: 21, borderRadius: 9,
              background: COLORS.primary, color: COLORS.lightText,
              border: `1.5px solid ${COLORS.accent}`, fontWeight: 600
            }}
            onClick={() => {
              setSelectedLanguage(null);
              setRoleSelection(null);
            }}>
            ← Back
          </button>
          <div
            style={{
              display: "flex",
              gap: 38,
              justifyContent: "center",
              alignItems: "center",
              width: "100%"
            }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => setRoleSelection("singers")}
              onKeyPress={e => { if (e.key === "Enter" || e.key === " ") setRoleSelection("singers"); }}
              style={{
                flex: 1,
                background: "var(--card)",
                borderRadius: 20,
                border: `2.7px solid ${COLORS.primary}`,
                boxShadow: "0 4px 24px #e87a4128",
                minHeight: 210,
                margin: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 31,
                fontWeight: 800,
                color: COLORS.primary,
                cursor: "pointer",
                transition: "transform .13s, box-shadow .13s"
              }}
            >
              <span style={{ fontSize: 35 }}>🎤</span>
              <div style={{ fontSize: 27, marginTop: 10, marginBottom: 5 }}>Singers</div>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setRoleSelection("music-directors")}
              onKeyPress={e => { if (e.key === "Enter" || e.key === " ") setRoleSelection("music-directors"); }}
              style={{
                flex: 1,
                background: "var(--card)",
                borderRadius: 20,
                border: "2.7px solid #af78c2",
                boxShadow: "0 4px 24px #af78c225",
                minHeight: 210,
                margin: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 31,
                fontWeight: 800,
                color: "#af78c2",
                cursor: "pointer",
                transition: "transform .13s, box-shadow .13s"
              }}
            >
              <span style={{ fontSize: 36 }}>🎼</span>
              <div style={{ fontSize: 27, marginTop: 10, marginBottom: 5 }}>Music Directors</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Grid render
  const { singers, musicDirectors } = getArtists(selectedLanguage);
  const isSingers = roleSelection === "singers";
  const fullList = isSingers ? singers : musicDirectors;
  const filtered = (!searchVal.trim())
    ? fullList
    : fullList.filter(a => a.name.toLowerCase().includes(searchVal.trim().toLowerCase()));
  const maxPages = Math.ceil(filtered.length / 9);
  const grid = filtered.slice(artistGridPage * 9, artistGridPage * 9 + 9);

  return (
    <main style={{
      minHeight: "calc(100vh - 80px)",
      marginTop: 72,
      background: COLORS.lightBg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 34,
        boxShadow: "0 5px 35px #b37fcc13",
        width: "99vw",
        maxWidth: 1550,
        margin: "30px auto 0",
        padding: "36px 8vw 44px 8vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 13
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <button
              className="btn"
              style={{
                background: COLORS.primary,
                color: COLORS.lightText,
                border: `1.5px solid ${COLORS.accent}`,
                fontWeight: 600,
                padding: "9px 19px",
                borderRadius: 8
              }}
              onClick={() => setRoleSelection(null)}
            >← Back</button>
            <span style={{
              fontSize: 27,
              color: isSingers ? COLORS.primary : "#af78c2",
              fontWeight: 900,
              letterSpacing: ".04em",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <span style={{ fontSize: 32 }}>{isSingers ? "🎤" : "🎼"}</span>
              {isSingers ? "Singers" : "Music Directors"}
            </span>
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={e => { setSearchVal(e.target.value); setArtistGridPage(0); }}
            placeholder={`Search ${isSingers ? "Singers" : "Music Directors"} by name`}
            className="input"
            style={{
              ...inputStyle,
              minWidth: 190,
              background: COLORS.searchBar,
              border: `1.5px solid ${isSingers ? COLORS.primary : "#af78c2"}`,
              color: COLORS.accent,
              fontSize: 16,
              marginBottom: 0,
              fontWeight: 500
            }}
          />
        </div>
        <div style={{
          marginTop: 7,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 30,
          justifyItems: "center",
          alignItems: "flex-start"
        }}>
          {grid.map(artist =>
            <ArtistGridCard artist={artist} role={isSingers ? "singer" : "director"} key={artist.name} />
          )}
          {grid.length === 0 &&
            <div style={{
              gridColumn: "span 3",
              color: "#888",
              fontSize: 19,
              fontWeight: 500,
              margin: "44px 0",
              textAlign: "center"
            }}>
              No {isSingers ? "singers" : "music directors"} found.
            </div>
          }
        </div>
        {maxPages > 1 && (
          <div style={{
            marginTop: 35,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 19
          }}>
            <button className="btn"
              style={{ fontWeight: 600, opacity: artistGridPage === 0 ? 0.5 : 1 }}
              onClick={() => setArtistGridPage(pg => (pg > 0 ? pg - 1 : 0))}
              disabled={artistGridPage === 0}
            >Prev</button>
            <span style={{
              fontWeight: 600,
              color: isSingers ? COLORS.primary : "#af78c2",
              fontSize: 17
            }}>
              Page {artistGridPage + 1} of {maxPages}
            </span>
            <button className="btn"
              style={{ fontWeight: 600, opacity: artistGridPage >= maxPages - 1 ? 0.5 : 1 }}
              onClick={() => setArtistGridPage(pg => (pg < maxPages - 1 ? pg + 1 : pg))}
              disabled={artistGridPage >= maxPages - 1}
            >Next</button>
          </div>
        )}
      </div>
      <style>
        {`
          @media (max-width: 1050px) {
            .artist-card-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 660px) {
            .artist-card-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </main>
  );
}

// LyricsFetcher: Fetch lyrics for EN if available and show a "Show Lyrics" expandable tab
function LyricsFetcher({ artist, title }) {
  const [open, setOpen] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!open) return;
    setStatus("loading");
    fetchLyrics(artist, title)
      .then(l => { setLyrics(l); setStatus("done"); })
      .catch(() => { setLyrics(""); setStatus("error"); });
  }, [open, artist, title]);

  return (
    <div>
      <button
        className="link-btn"
        style={{ marginTop: 3, marginBottom: 3, fontSize: 13 }}
        onClick={() => setOpen(v => !v)}
      >
        {open ? "Hide Lyrics" : "Show Lyrics"}
      </button>
      {open && (
        <div style={{
          marginTop: 5, background: "#f8f0fa", borderLeft: `4px solid ${COLORS.primary}`,
          borderRadius: 8, padding: "10px 13px", color: COLORS.accent, fontSize: 15, boxShadow: "0 2px 12px #c7afb078"
        }}>
          {status === "loading"
            ? "Loading lyrics..."
            : status === "error"
              ? "Lyrics not available."
              : lyrics}
        </div>
      )}
    </div>
  );
}

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
