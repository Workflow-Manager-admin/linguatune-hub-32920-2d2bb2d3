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

// Six famous artists with three hit songs per language
const ARTISTS = {
  en: [
    {
      name: "Taylor Swift",
      songs: ["Love Story", "Blank Space", "Shake It Off"]
    },
    {
      name: "Ed Sheeran",
      songs: ["Shape of You", "Perfect", "Thinking Out Loud"]
    },
    {
      name: "Adele",
      songs: ["Hello", "Someone Like You", "Rolling in the Deep"]
    },
    {
      name: "The Weeknd",
      songs: ["Blinding Lights", "Starboy", "Save Your Tears"]
    },
    {
      name: "Beyoncé",
      songs: ["Halo", "Single Ladies", "Crazy In Love"]
    },
    {
      name: "Bruno Mars",
      songs: ["Uptown Funk", "Just The Way You Are", "Grenade"]
    }
  ],
  hi: [
    {
      name: "Arijit Singh",
      songs: ["Tum Hi Ho", "Channa Mereya", "Ae Dil Hai Mushkil"]
    },
    {
      name: "Shreya Ghoshal",
      songs: ["Teri Meri", "Sun Raha Hai", "Saans"]
    },
    {
      name: "Sonu Nigam",
      songs: ["Kal Ho Naa Ho", "Abhi Mujh Mein Kahin", "Suraj Hua Maddham"]
    },
    {
      name: "Neha Kakkar",
      songs: ["Aankh Marey", "Kala Chashma", "Dilbar"]
    },
    {
      name: "KK",
      songs: ["Zara Sa", "Tadap Tadap", "Kya Mujhe Pyaar Hai"]
    },
    {
      name: "Armaan Malik",
      songs: ["Bol Do Na Zara", "Main Hoon Hero Tera", "Wajah Tum Ho"]
    }
  ],
  ta: [
    {
      name: "Anirudh Ravichander",
      songs: ["Why This Kolaveri Di", "Chellamma", "Vaathi Coming"]
    },
    {
      name: "Sid Sriram",
      songs: ["Ennodu Nee Irundhaal", "Yennai Maatrum Kadhale", "Maruvaarthai"]
    },
    {
      name: "Shreya Ghoshal",
      songs: ["Munbe Vaa", "Un Perai Sollum", "Neeyum Naanum"]
    },
    {
      name: "S.P. Balasubrahmanyam",
      songs: ["Nilaave Vaa", "Mandram Vandha", "Ennulle Ennulle"]
    },
    {
      name: "Chinmayi",
      songs: ["Sara Sara", "Lago Mare", "Idhu Varai"]
    },
    {
      name: "Dhanush",
      songs: ["Rowdy Baby", "Kolaveri Di", "Amma Amma"]
    }
  ],
  te: [
    {
      name: "Devi Sri Prasad",
      songs: ["Seeti Maar", "Ringa Ringa", "Top Lesi Poddi"]
    },
    {
      name: "Sid Sriram",
      songs: ["Inkem Inkem Inkem Kaavaale", "Samajavaragamana", "Adiga Adiga"]
    },
    {
      name: "S. P. Balasubrahmanyam",
      songs: ["Priya Priya", "Ee Reyi Theyanadi", "Madhumasam"]
    },
    {
      name: "Chinmayi",
      songs: ["Yem Sandeham Ledu", "Pranaamam", "Nijamainadi"]
    },
    {
      name: "Shreya Ghoshal",
      songs: ["Hey Pillagada", "Saaho Re", "Chiranjeevi Chiranjeevi"]
    },
    {
      name: "Mano",
      songs: ["Botany Pathamundi", "Bangaru Kodi Petta", "Baahubali Title Song"]
    }
  ],
  ml: [
    {
      name: "Sithara Krishnakumar",
      songs: ["Vaanam Thilathilakkanu", "Oru Venal Puzhayil", "Pavizha Mazha"]
    },
    {
      name: "Vijay Yesudas",
      songs: ["Malare", "Poomuthole", "Entammede Jimikki Kammal"]
    },
    {
      name: "K. S. Chithra",
      songs: ["Anuraga Vilochananayi", "Manathe Chandanakkeeru", "Unaru Unaru"]
    },
    {
      name: "Shreya Ghoshal",
      songs: ["Mizhiyoram", "Megharoopan", "Neermathalam"]
    },
    {
      name: "Hesham Abdul Wahab",
      songs: ["Darshana", "Kudukku", "Rathi Pushpam"]
    },
    {
      name: "Vineeth Sreenivasan",
      songs: ["Premam Aluva Puzha", "Aaro Nenjil", "Malarvadi Arts Club"]
    }
  ],
  kn: [
    {
      name: "Sonu Nigam",
      songs: ["Neene Neene", "Swalpaagidantha", "Baa Baa"]
    },
    {
      name: "Armaan Malik",
      songs: ["Ondu Malebillu", "Ninna Snehadinda", "Jeeva Hoovagide"]
    },
    {
      name: "Vijay Prakash",
      songs: ["Raajakumara", "Kareyole", "Belageddu"]
    },
    {
      name: "Chandan Shetty",
      songs: ["3 Peg", "Halagode", "Chocolate Girl"]
    },
    {
      name: "Shreya Ghoshal",
      songs: ["Ninnindale", "Kannale Kannale", "Kanasugala Nanagu"]
    },
    {
      name: "Rajesh Krishnan",
      songs: ["Preetse Preetse", "Janumada Gelathi", "Baaro Krishnayya"]
    }
  ]
};

// For lyrics tab: English and Hindi only
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

// PUBLIC_INTERFACE - Updated Dashboard for language-artist-song-player view
function Dashboard({ username }) {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [songVideos, setSongVideos] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [openPlayers, setOpenPlayers] = useState({}); // {artist:song: true}

  // Fetch videos for all artists/songs in the selected language
  useEffect(() => {
    let ignore = false;
    if (!selectedLanguage) return;
    const artists = ARTISTS[selectedLanguage] || [];
    // Flatten list of { artist, song } objects for lookup by artist+song
    const fetchAll = async () => {
      let vids = {}, loads = {}, errs = {};
      for (let artistObj of artists) {
        for (let songTitle of artistObj.songs) {
          const key = artistObj.name + "|" + songTitle;
          loads[key] = true;
          try {
            // Always query as "Artist - Song" for accuracy
            const videos = await fetchYouTubeVideos(`${artistObj.name} ${songTitle}`, { maxResults: 1 });
            vids[key] = Array.isArray(videos) && videos[0] ? videos[0] : null;
            errs[key] = (Array.isArray(videos) && videos.length > 0) ? "" : "No video found";
          } catch (err) {
            vids[key] = null;
            errs[key] = "Video error";
          }
          loads[key] = false;
          if (ignore) break;
          // update state after each to smoothly enable thumbnails
          setSongVideos((prev) => ({ ...prev, [key]: vids[key] }));
          setLoadingMap((prev) => ({ ...prev, [key]: false }));
          setErrorMap((prev) => ({ ...prev, [key]: errs[key] }));
        }
      }
      if (!ignore) {
        setSongVideos(vids);
        setLoadingMap(loads);
        setErrorMap(errs);
      }
    };
    setSongVideos({});
    setLoadingMap({});
    setErrorMap({});
    fetchAll();
    return () => { ignore = true; };
  }, [selectedLanguage]);

  // Back & Search state for language view
  const [searchVal, setSearchVal] = useState("");
  useEffect(() => { setSearchVal(""); }, [selectedLanguage]);

  // If a language is selected, show artists & their songs
  if (selectedLanguage) {
    const langObj = LANGUAGES.find((l) => l.key === selectedLanguage);
    const artists = ARTISTS[selectedLanguage];
    // Search artists or song names
    const filteredArtists = !searchVal.trim()
      ? artists
      : artists.map(artist =>
        ({
          ...artist,
          songs: artist.songs.filter(song =>
            song.toLowerCase().includes(searchVal.trim().toLowerCase()) ||
            artist.name.toLowerCase().includes(searchVal.trim().toLowerCase())
          )
        })
      ).filter(a => a.songs.length > 0);

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
            maxWidth: 600,
            width: "97vw",
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
              {langObj && langObj.label} Artists & Songs
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
              }}
            >
              ← Back
            </button>
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={`Search artists or songs in ${langObj ? langObj.label : ""}`}
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
          <div>
            {filteredArtists.length === 0 ? (
              <div style={{ color: "#aaa", fontSize: 15, textAlign: "center" }}>
                No matching artists or songs found.
              </div>
            ) : (
              filteredArtists.map((artist, i) => (
                <div key={artist.name} style={{
                  background: COLORS.songCard,
                  borderRadius: 16,
                  marginBottom: 20,
                  boxShadow: "0 2px 16px #de92dc20",
                  padding: "18px 16px 12px 16px"
                }}>
                  <div style={{
                    fontWeight: 700,
                    color: COLORS.accent,
                    fontSize: 20,
                    marginBottom: 8
                  }}>
                    {artist.name}
                  </div>
                  <div>
                    {artist.songs.map(songTitle => {
                      const songKey = artist.name + "|" + songTitle;
                      const video = songVideos[songKey];
                      const error = errorMap[songKey];
                      const loading = loadingMap[songKey];
                      return (
                        <div key={songKey} style={{ display: "flex", alignItems: "flex-start", marginBottom: 15, gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, color: COLORS.accent, fontSize: 17 }}>
                              {songTitle}
                            </div>
                            <div style={{ color: "#9c69ad", fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>
                              {artist.name}
                            </div>
                            {/* Lyrics: offer tab if EN/HI */}
                            {canShowLyrics(selectedLanguage) && (
                              <LyricsFetcher artist={artist.name} title={songTitle} />
                            )}
                          </div>
                          <div style={{ minWidth: 140, textAlign: "center" }}>
                            {loading && (
                              <div style={{ color: "#af78c2", fontSize: 13, marginTop: 9 }}>Loading video...</div>
                            )}
                            {!loading && video && video.thumbnail && (
                              <div
                                style={{ cursor: "pointer", borderRadius: 8, overflow: "hidden" }}
                                onClick={() => setOpenPlayers(prev => ({ ...prev, [songKey]: !prev[songKey] }))}
                                tabIndex={0}
                                role="button"
                                aria-label="Show/hide player"
                              >
                                <img
                                  src={video.thumbnail}
                                  alt={songTitle + " thumbnail"}
                                  style={{ width: 135, borderRadius: 8, boxShadow: "0 2px 7px #df86e914" }}
                                />
                                <div style={{
                                  fontSize: 13, color: COLORS.primary, background: "rgba(254,134,216,0.04)",
                                  borderRadius: 7, marginTop: 2, marginBottom: 1
                                }}>
                                  {openPlayers[songKey] ? "Hide Video" : "Play Video"}
                                </div>
                              </div>
                            )}
                            {!loading && !video && (
                              <div style={{ color: "#e95271", fontSize: 13, marginTop: 7 }}>
                                {error || "No video found"}
                              </div>
                            )}
                            {openPlayers[songKey] && video && video.videoId && (
                              <iframe
                                title={songTitle + " Video"}
                                width="100%"
                                height="115"
                                style={{ borderRadius: 9, marginTop: 6, boxShadow: "0 4px 16px #eaabfd38" }}
                                src={`https://www.youtube.com/embed/${video.videoId}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
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
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedLanguage(lang.key);
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

// LyricsFetcher: Fetch lyrics for EN/HI if available and show a "Show Lyrics" expandable tab
function LyricsFetcher({ artist, title }) {
  const [open, setOpen] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [status, setStatus] = useState("idle"); // idle/loading/done/error

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
