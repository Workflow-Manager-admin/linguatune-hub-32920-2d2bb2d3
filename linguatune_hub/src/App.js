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

/**
 * Demo Artist DB for refactor: 
 * Map of artistType: { name, songs[] }
 * Each language features at least 50 singers and music directors (with 1+ songs per artist), but for demo, we "multiply"
 * real names and song titles to make 50+ entries per role.
 * In a real app, fetch from backend/db. Here, we synthesize ~50 artists per role/language.
 */
function makeDemoArtists(langKey) {
  // Seeds for real artists (6 singers, 6 music directors per supported language)
  const SINGER_SEED = {
    en: [
      { name: "Taylor Swift", songs: ["Love Story", "Blank Space", "Shake It Off"] },
      { name: "Ed Sheeran", songs: ["Shape of You", "Perfect", "Thinking Out Loud"] },
      { name: "Adele", songs: ["Hello", "Someone Like You", "Rolling in the Deep"] },
      { name: "The Weeknd", songs: ["Blinding Lights", "Starboy", "Save Your Tears"] },
      { name: "Beyoncé", songs: ["Halo", "Single Ladies", "Crazy In Love"] },
      { name: "Bruno Mars", songs: ["Uptown Funk", "Just The Way You Are", "Grenade"] }
    ],
    hi: [
      { name: "Arijit Singh", songs: ["Tum Hi Ho", "Channa Mereya", "Ae Dil Hai Mushkil"] },
      { name: "Shreya Ghoshal", songs: ["Teri Meri", "Sun Raha Hai", "Saans"] },
      { name: "Sonu Nigam", songs: ["Kal Ho Naa Ho", "Abhi Mujh Mein Kahin", "Suraj Hua Maddham"] },
      { name: "Neha Kakkar", songs: ["Aankh Marey", "Kala Chashma", "Dilbar"] },
      { name: "KK", songs: ["Zara Sa", "Tadap Tadap", "Kya Mujhe Pyaar Hai"] },
      { name: "Armaan Malik", songs: ["Bol Do Na Zara", "Main Hoon Hero Tera", "Wajah Tum Ho"] }
    ],
    ta: [
      { name: "Sid Sriram", songs: ["Ennodu Nee Irundhaal", "Yennai Maatrum Kadhale", "Maruvaarthai"] },
      { name: "Shreya Ghoshal", songs: ["Munbe Vaa", "Un Perai Sollum", "Neeyum Naanum"] },
      { name: "Anirudh Ravichander", songs: ["Why This Kolaveri Di", "Chellamma", "Vaathi Coming"] },
      { name: "S.P. Balasubrahmanyam", songs: ["Nilaave Vaa", "Mandram Vandha", "Ennulle Ennulle"] },
      { name: "Chinmayi", songs: ["Sara Sara", "Lago Mare", "Idhu Varai"] },
      { name: "Dhanush", songs: ["Rowdy Baby", "Kolaveri Di", "Amma Amma"] }
    ],
    te: [
      { name: "Sid Sriram", songs: ["Inkem Inkem Inkem Kaavaale", "Samajavaragamana", "Adiga Adiga"] },
      { name: "Devi Sri Prasad", songs: ["Seeti Maar", "Ringa Ringa", "Top Lesi Poddi"] },
      { name: "S. P. Balasubrahmanyam", songs: ["Priya Priya", "Ee Reyi Theyanadi", "Madhumasam"] },
      { name: "Chinmayi", songs: ["Yem Sandeham Ledu", "Pranaamam", "Nijamainadi"] },
      { name: "Shreya Ghoshal", songs: ["Hey Pillagada", "Saaho Re", "Chiranjeevi Chiranjeevi"] },
      { name: "Mano", songs: ["Botany Pathamundi", "Bangaru Kodi Petta", "Baahubali Title Song"] }
    ],
    ml: [
      { name: "Sithara Krishnakumar", songs: ["Vaanam Thilathilakkanu", "Oru Venal Puzhayil", "Pavizha Mazha"] },
      { name: "Vijay Yesudas", songs: ["Malare", "Poomuthole", "Entammede Jimikki Kammal"] },
      { name: "K. S. Chithra", songs: ["Anuraga Vilochananayi", "Manathe Chandanakkeeru", "Unaru Unaru"] },
      { name: "Shreya Ghoshal", songs: ["Mizhiyoram", "Megharoopan", "Neermathalam"] },
      { name: "Hesham Abdul Wahab", songs: ["Darshana", "Kudukku", "Rathi Pushpam"] },
      { name: "Vineeth Sreenivasan", songs: ["Premam Aluva Puzha", "Aaro Nenjil", "Malarvadi Arts Club"] }
    ],
    kn: [
      { name: "Sonu Nigam", songs: ["Neene Neene", "Swalpaagidantha", "Baa Baa"] },
      { name: "Armaan Malik", songs: ["Ondu Malebillu", "Ninna Snehadinda", "Jeeva Hoovagide"] },
      { name: "Vijay Prakash", songs: ["Raajakumara", "Kareyole", "Belageddu"] },
      { name: "Chandan Shetty", songs: ["3 Peg", "Halagode", "Chocolate Girl"] },
      { name: "Shreya Ghoshal", songs: ["Ninnindale", "Kannale Kannale", "Kanasugala Nanagu"] },
      { name: "Rajesh Krishnan", songs: ["Preetse Preetse", "Janumada Gelathi", "Baaro Krishnayya"] }
    ]
  };

  const MUSIC_DIRECTOR_SEED = {
    en: [
      { name: "Max Martin", songs: ["Shake It Off", "Blank Space", "Can't Stop The Feeling"] },
      { name: "Mark Ronson", songs: ["Uptown Funk", "Daffodils", "Nothing Breaks Like a Heart"] },
      { name: "Greg Kurstin", songs: ["Hello", "Chasing Pavements", "Send My Love"] },
      { name: "Ryan Tedder", songs: ["Halo", "Rumour Has It", "Counting Stars"] },
      { name: "Pharrell Williams", songs: ["Happy", "Get Lucky", "Blurred Lines"] },
      { name: "Finneas O'Connell", songs: ["bad guy", "everything i wanted", "lovely"] }
    ],
    hi: [
      { name: "A. R. Rahman", songs: ["Jai Ho", "Kun Faya Kun", "Roobaroo"] },
      { name: "Pritam", songs: ["Channa Mereya", "Tum Hi Ho Bandhu", "Badtameez Dil"] },
      { name: "Vishal-Shekhar", songs: ["Ghungroo", "Radha", "Bin Tere"] },
      { name: "Shankar–Ehsaan–Loy", songs: ["Mitwa", "Senorita", "Kal Ho Naa Ho"] },
      { name: "Ajay-Atul", songs: ["Zingat", "Mere Nishaan", "Abhi Mujh Mein Kahin"] },
      { name: "Amaal Mallik", songs: ["Sooraj Dooba Hain", "Main Hoon Hero Tera", "Kar Gayi Chull"] }
    ],
    ta: [
      { name: "A. R. Rahman", songs: ["New York Nagaram", "Munbe Vaa", "Ennodu Nee Irundhal"] },
      { name: "Ilaiyaraaja", songs: ["Mandram Vandha", "Nilaave Vaa", "Ennulle Ennulle"] },
      { name: "Anirudh Ravichander", songs: ["Vaathi Coming", "Why This Kolaveri Di", "Chellamma"] },
      { name: "Harris Jayaraj", songs: ["Un Perai Sollum", "Neethane En Ponvasantham", "Vaarayo Vaarayo"] },
      { name: "Yuvan Shankar Raja", songs: ["Idhu Varai", "Saravana", "Pudhu Metro Rail"] },
      { name: "G. V. Prakash Kumar", songs: ["Yennai Maatrum Kadhale", "Kadal Raasa Naan", "En Jeevan"] }
    ],
    te: [
      { name: "Devi Sri Prasad", songs: ["Seeti Maar", "Ringa Ringa", "Top Lesi Poddi"] },
      { name: "Mani Sharma", songs: ["Bommali", "Ninnu Kori Varnam", "Aaradugula Bullet"] },
      { name: "M. M. Keeravani", songs: ["Baahubali Title Song", "Telusa Telusa", "Oka Pranam"] },
      { name: "Thaman S", songs: ["Butta Bomma", "Samajavaragamana", "Maguva Maguva"] },
      { name: "Gopi Sundar", songs: ["Blockbuster", "Inkem Inkem", "Manohari"] },
      { name: "Anup Rubens", songs: ["Seetakoka Chiluka", "Chudandi Saaru", "Oka Laila Kosam"] }
    ],
    ml: [
      { name: "M. Jayachandran", songs: ["Poomuthole", "Olanjali Kuruvi", "Mazhaye Mazhaye"] },
      { name: "Gopi Sundar", songs: ["Malare", "Entammede Jimikki Kammal", "Pularkalam"] },
      { name: "Shaan Rahman", songs: ["Darshana", "Jimikki Kammal", "Vaanam Thilathilakkanu"] },
      { name: "Bijibal", songs: ["Onnum Mindathe", "Mukkathe Penne", "Oru Venal Puzhayil"] },
      { name: "Deepak Dev", songs: ["Chenthengin", "Mandaarame", "Chirakukal"] },
      { name: "Hesham Abdul Wahab", songs: ["Kudukku", "Rathi Pushpam", "Toofan"] }
    ],
    kn: [
      { name: "V. Harikrishna", songs: ["Belageddu", "Kareyole", "Raajakumara"] },
      { name: "Arjun Janya", songs: ["Jeeva Hoovagide", "Aamele", "Sangathiye"] },
      { name: "Manikanth Kadri", songs: ["Janumada Gelathi", "Premakke Sai", "Kanasugala Nanagu"] },
      { name: "Raghu Dixit", songs: ["Ninna Poojege Bande Mahadeshwara", "Lokada Kalaji", "Idu Entha Lokavayya"] },
      { name: "Sadhu Kokila", songs: ["3 Peg", "Chandramukhi Pranasakhi", "Chocolate Girl"] },
      { name: "Ajaneesh Loknath", songs: ["Karabuu", "Hands Up", "Swalpaagidantha"] }
    ]
  };

  // Helper to "expand" the artist/songs to at least 50 artists and at least 100 songs for demo
  function expand(seedList, startIdx=0, targetArtists=50, targetSongsPerArtist=2) {
    const result = [];
    let artistIdx = 0, lastLen = seedList.length;
    while (result.length < targetArtists) {
      const base = seedList[artistIdx % lastLen];
      const n = Math.floor(artistIdx / lastLen);
      // Create a unique name and slice different song pairs
      result.push({
        name: n === 0 ? base.name : `${base.name} ${n + 1}`,
        // Loop over available songs, shift by n to make permutations
        songs: Array(targetSongsPerArtist).fill().map((_, j) => {
          return base.songs[(j + n) % base.songs.length] + (n ? ` v${n + 1}` : "");
        })
      });
      ++artistIdx;
    }
    return result;
  }

  const singers = expand(SINGER_SEED[langKey], 0, 50, 2); // 50 singers, 2 songs/artist => 100 songs/role
  const musicDirectors = expand(MUSIC_DIRECTOR_SEED[langKey], 0, 50, 2); // 50 directors, 2 songs/each

  return { singers, musicDirectors };
}

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

/* PUBLIC_INTERFACE - Refactored Dashboard for dual-column (singer/music director) artist display */
function Dashboard({ username }) {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [songVideos, setSongVideos] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [openPlayers, setOpenPlayers] = useState({});
  const [searchVals, setSearchVals] = useState({ singer: "", director: "" });
  const [expandedArtist, setExpandedArtist] = useState({ singer: null, director: null });
  // Always define activeRole, but only use for Indian languages
  const [activeRole, setActiveRole] = useState("singer");

  const ROLES = [
    { key: "singer", label: "Singers", icon: "🎤", accent: COLORS.primary },
    { key: "director", label: "Music Directors", icon: "🎼", accent: "#af78c2" }
  ];

  // PUBLIC_INTERFACE
  function getArtists(langKey) {
    if (!langKey) return { singers: [], musicDirectors: [] };
    // For Indian languages: return first 10 singers, first 6 music directors
    // For English: return first 15 singers, no music directors
    const { singers, musicDirectors } = makeDemoArtists(langKey);
    if (langKey === 'en') {
      return {
        singers: singers.slice(0, 15),
        musicDirectors: [],
      };
    }
    // Indian lang: Tamil, Hindi, Telugu, Malayalam, Kannada
    return {
      singers: singers.slice(0, 10),
      musicDirectors: musicDirectors.slice(0, 6)
    };
  }

  // Fetch videos for all artists and their songs for selected language (but only if changed)
  useEffect(() => {
    let ignore = false;
    if (!selectedLanguage) return;
    const { singers, musicDirectors } = getArtists(selectedLanguage);
    const allArtists = [
      ...singers.map(a => ({ ...a, role: "singer" })),
      ...musicDirectors.map(a => ({ ...a, role: "director" }))
    ];
    async function fetchAll() {
      let vids = {}, loads = {}, errs = {};
      for (const artistObj of allArtists) {
        for (const songTitle of artistObj.songs) {
          const key = `${artistObj.role}|${artistObj.name}|${songTitle}`;
          loads[key] = true;
          try {
            const videos = await fetchYouTubeVideos(`${artistObj.name} ${songTitle}`, { maxResults: 1 });
            vids[key] = Array.isArray(videos) && videos[0] ? videos[0] : null;
            errs[key] = (Array.isArray(videos) && videos.length > 0) ? "" : "No video found";
          } catch {
            vids[key] = null;
            errs[key] = "Video error";
          }
          loads[key] = false;
          if (ignore) break;
          setSongVideos(prev => ({ ...prev, [key]: vids[key] }));
          setLoadingMap(prev => ({ ...prev, [key]: false }));
          setErrorMap(prev => ({ ...prev, [key]: errs[key] }));
        }
      }
      if (!ignore) {
        setSongVideos(vids);
        setLoadingMap(loads);
        setErrorMap(errs);
      }
    }
    setSongVideos({});
    setLoadingMap({});
    setErrorMap({});
    fetchAll();
    return () => { ignore = true; };
  }, [selectedLanguage]);

  useEffect(() => {
    setSearchVals({ singer: "", director: "" });
    setExpandedArtist({ singer: null, director: null });
    setActiveRole("singer");
  }, [selectedLanguage]);

  // Song item UI (identify video, error and loading)
  // PUBLIC_INTERFACE
  function SongItem({ artist, songTitle, role }) {
    const songKey = `${role}|${artist.name}|${songTitle}`;
    const video = songVideos[songKey];
    const error = errorMap[songKey];
    const loading = loadingMap[songKey];
    return (
      <div
        key={songKey}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 9,
          marginBottom: 9,
          borderBottom: "1px solid #e6d0ed",
          paddingBottom: 4
        }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: COLORS.accent, fontSize: 14 }}>{songTitle}</div>
          <div style={{ color: "#b7769b", fontSize: 11, fontWeight: 500, marginBottom: 0 }}>{artist.name}</div>
          {role === "singer" && canShowLyrics(selectedLanguage) && (
            <LyricsFetcher artist={artist.name} title={songTitle} />
          )}
        </div>
        <div style={{ minWidth: 76, textAlign: "center" }}>
          {loading && <div style={{ color: "#af78c2", fontSize: 11 }}>Loading…</div>}
          {!loading && video && video.thumbnail && (
            <div
              style={{ cursor: "pointer", borderRadius: 6, overflow: "hidden" }}
              onClick={() => setOpenPlayers(prev => ({ ...prev, [songKey]: !prev[songKey] }))}
              tabIndex={0}
              role="button"
              aria-label="Show/hide player"
            >
              <img
                src={video.thumbnail}
                alt={songTitle + " thumbnail"}
                style={{
                  width: 63, borderRadius: 6,
                  boxShadow: "0 2px 7px #df86e92b",
                  marginBottom: 4
                }}
              />
              <div style={{
                fontSize: 9,
                color: COLORS.primary,
                background: "rgba(254,134,216,0.11)",
                borderRadius: 5,
                marginTop: 2
              }}>
                {openPlayers[songKey] ? "Hide" : "Play"}
              </div>
            </div>
          )}
          {!loading && !video && (
            <div style={{ color: "#e95271", fontSize: 10, marginTop: 2 }}>
              {error || "No video"}
            </div>
          )}
          {openPlayers[songKey] && video && video.videoId && (
            <iframe
              title={songTitle + " Video"}
              width="97%"
              height="56"
              style={{ borderRadius: 6, marginTop: 3, boxShadow: "0 4px 8px #eaabfd12" }}
              src={`https://www.youtube.com/embed/${video.videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    );
  }

  // Helper: filter artist list by search
  function filterByRole(list, searchVal) {
    if (!searchVal.trim()) return list;
    return list
      .map(artist => ({
        ...artist,
        songs: artist.songs.filter(song =>
          song.toLowerCase().includes(searchVal.trim().toLowerCase()) ||
          artist.name.toLowerCase().includes(searchVal.trim().toLowerCase())
        )
      }))
      .filter(artist => artist.songs.length > 0);
  }

  // Determine what to render
  let content = null;

  // Helper to render a full artist list, in a scrollable column, showing all required singers/music directors as a list
  function ArtistRoleColumn({ artists, roleKey, label, icon, color, searchVal, onSearchChange }) {
    return (
      <section
        style={{
          flex: "1 1 330px",
          minWidth: 260,
          maxWidth: 380,
          background: "var(--light-gray)",
          borderRadius: 18,
          boxShadow: "0 3px 18px #cf7a9f11",
          padding: "22px 12px 19px 12px",
          border: "2.2px solid var(--mid-gray)",
          margin: 6
        }}
      >
        <header style={{
          fontWeight: 900,
          color: color,
          fontSize: 23,
          letterSpacing: ".03em",
          marginBottom: 7,
          display: "flex", alignItems: "center", gap: 10
        }}>
          <span style={{ fontSize: 25 }}>{icon}</span>
          {label}
        </header>
        <input
          type="text"
          value={searchVal}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={`Search ${label} or song`}
          className="input"
          style={{
            ...inputStyle,
            background: COLORS.searchBar,
            border: `1.4px solid ${color}`,
            color: COLORS.accent,
            marginBottom: 17,
            fontSize: 15
          }}
        />
        <div style={{
          maxHeight: "62vh",
          overflow: "auto",
          borderRadius: 14,
          paddingRight: 5
        }}>
          {artists.length === 0 ? (
            <div style={{
              color: "#aaa", fontSize: 13, margin: "16px 0", textAlign: "center"
            }}>
              No {label.toLowerCase()} found.
            </div>
          ) : (
            artists.map(artist =>
              <div
                key={artist.name}
                style={{
                  background: COLORS.songCard,
                  borderRadius: 8,
                  boxShadow: "0 3px 11px #e87a4119",
                  border: `2px solid ${color}`,
                  color: COLORS.accent,
                  marginBottom: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "8px 7px",
                  transition: "all 0.10s"
                }}
                tabIndex={0}
                aria-label={`Show songs for ${artist.name}`}
              >
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2, color }}>{artist.name}</div>
                <div style={{ marginTop: 6 }}>
                  {(artist.songs && artist.songs.length > 0) ? (
                    artist.songs.slice(0, 6).map(songTitle => (
                      <SongItem artist={artist} songTitle={songTitle} role={roleKey} key={artist.name + "|" + songTitle} />
                    ))
                  ) : (
                    <div style={{ color: "#888", fontSize: 13, fontWeight: 400 }}>
                      No songs found for this artist.
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </section>
    );
  }

  // If no language is selected, show the language grid
  if (!selectedLanguage) {
    content = (
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
  } else {
    // A language is selected
    const langObj = LANGUAGES.find((l) => l.key === selectedLanguage);
    const { singers, musicDirectors } = getArtists(selectedLanguage);
    const isIndianLang = ["ta", "hi", "te", "ml", "kn"].includes(selectedLanguage);

    // Song item UI (identify video, error and loading)
    function SongItem({ artist, songTitle, role }) {
      const songKey = `${role}|${artist.name}|${songTitle}`;
      const video = songVideos[songKey];
      const error = errorMap[songKey];
      const loading = loadingMap[songKey];
      return (
        <div
          key={songKey}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            marginBottom: 9,
            borderBottom: "1px solid #e6d0ed",
            paddingBottom: 4
          }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: COLORS.accent, fontSize: 14 }}>{songTitle}</div>
            <div style={{ color: "#b7769b", fontSize: 11, fontWeight: 500, marginBottom: 0 }}>{artist.name}</div>
            {role === "singer" && canShowLyrics(selectedLanguage) && (
              <LyricsFetcher artist={artist.name} title={songTitle} />
            )}
          </div>
          <div style={{ minWidth: 76, textAlign: "center" }}>
            {loading && <div style={{ color: "#af78c2", fontSize: 11 }}>Loading…</div>}
            {!loading && video && video.thumbnail && (
              <div
                style={{ cursor: "pointer", borderRadius: 6, overflow: "hidden" }}
                onClick={() => setOpenPlayers(prev => ({ ...prev, [songKey]: !prev[songKey] }))}
                tabIndex={0}
                role="button"
                aria-label="Show/hide player"
              >
                <img
                  src={video.thumbnail}
                  alt={songTitle + " thumbnail"}
                  style={{
                    width: 63, borderRadius: 6,
                    boxShadow: "0 2px 7px #df86e92b",
                    marginBottom: 4
                  }}
                />
                <div style={{
                  fontSize: 9,
                  color: COLORS.primary,
                  background: "rgba(254,134,216,0.11)",
                  borderRadius: 5,
                  marginTop: 2
                }}>
                  {openPlayers[songKey] ? "Hide" : "Play"}
                </div>
              </div>
            )}
            {!loading && !video && (
              <div style={{ color: "#e95271", fontSize: 10, marginTop: 2 }}>
                {error || "No video"}
              </div>
            )}
            {openPlayers[songKey] && video && video.videoId && (
              <iframe
                title={songTitle + " Video"}
                width="97%"
                height="56"
                style={{ borderRadius: 6, marginTop: 3, boxShadow: "0 4px 8px #eaabfd12" }}
                src={`https://www.youtube.com/embed/${video.videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      );
    }

    // Choose how many to show, and enable columns appropriately
    const singersList = singers.slice(0, selectedLanguage === "en" ? 15 : 10);
    const directorsList = isIndianLang ? musicDirectors.slice(0, 6) : [];

    // Apply search
    const filteredSingers = filterByRole(singersList, searchVals.singer);
    const filteredDirectors = filterByRole(directorsList, searchVals.director);

    // Responsive UI variables
    const columnsContainerStyle = {
      display: "flex",
      gap: 24,
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      justifyContent: "center"
    };

    content = (
      <main
        style={{
          minHeight: "calc(100vh - 85px)",
          marginTop: 75,
          background: COLORS.lightBg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
        <div style={{
          background: "#fff",
          borderRadius: 30,
          boxShadow: "0 4px 32px #f4e2eb24",
          width: "98vw",
          maxWidth: 1600,
          margin: "36px auto 0",
          padding: "26px 13px 34px 13px",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch"
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 9
          }}>
            <h2 style={{
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: 29,
              letterSpacing: ".03em",
              margin: 0,
              flex: 1,
              lineHeight: 1.18
            }}>
              {langObj ? langObj.label : ""} — <span style={{ color: COLORS.accent }}>Music Dashboard</span>
            </h2>
            <button
              className="btn"
              style={{
                padding: "8px 26px",
                background: COLORS.primary,
                color: COLORS.lightText,
                border: `1px solid ${COLORS.accent}`,
                fontWeight: 600,
                borderRadius: 8,
                minWidth: 0,
                fontSize: 15
              }}
              onClick={() => setSelectedLanguage(null)}
            >
              ← Back
            </button>
          </div>
          {/* Columns container */}
          <div style={columnsContainerStyle} className="dashboard-columns">
            {/* Always show singers column */}
            <ArtistRoleColumn
              artists={filteredSingers}
              roleKey="singer"
              label="Singers"
              icon="🎤"
              color={COLORS.primary}
              searchVal={searchVals.singer}
              onSearchChange={v => setSearchVals(vals => ({ ...vals, singer: v }))}
            />
            {/* Only show music directors column for Indian languages */}
            {isIndianLang &&
              <ArtistRoleColumn
                artists={filteredDirectors}
                roleKey="director"
                label="Music Directors"
                icon="🎼"
                color="#af78c2"
                searchVal={searchVals.director}
                onSearchChange={v => setSearchVals(vals => ({ ...vals, director: v }))}
              />
            }
          </div>
          {/* Responsive tweaks for mobile */}
          <style>
            {`
              @media (max-width: 900px) {
                .dashboard-columns {
                  flex-direction: column !important;
                  gap: 11px !important;
                }
              }
              @media (max-width: 700px) {
                .dashboard-columns section {
                  max-width: 99vw !important;
                  padding-left: 2vw !important;
                  padding-right: 2vw !important;
                  margin-bottom: 8vw !important;
                }
              }
            `}
          </style>
        </div>
      </main>
    );
  }

  // Always return content (single return statement for hooks compliance)
  return content;
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
