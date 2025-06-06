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
 * Each language features at least 50 singers and music directors (with 1+ songs per artist), but for demo, we "multiply"
 * real names and song titles to make 50+ entries per role.
 * In a real app, fetch from backend/db. Here, we synthesize ~50 artists per role/language.
 */
function makeDemoArtists(langKey) {
  // Define unique, real, and prominent artists for each language.
  // Each artist appears only once; all available songs for each are listed under their card.

  // --- Refactored Telugu singers & attribution logic with clarifying UI notes for collaborative/minor roles ---
  const SINGER_SEED = {
    en: [
      { name: "Taylor Swift", songs: ["Love Story", "Cardigan", "Blank Space", "Shake It Off", "Cruel Summer"] },
      { name: "Ed Sheeran", songs: ["Shape of You", "Perfect", "Thinking Out Loud", "Photograph", "Castle on the Hill"] },
      { name: "Adele", songs: ["Hello", "Someone Like You", "Rolling in the Deep", "Set Fire to the Rain", "Skyfall"] },
      { name: "Bruno Mars", songs: ["Uptown Funk", "Grenade", "Just The Way You Are", "That's What I Like", "When I Was Your Man"] },
      { name: "Beyoncé", songs: ["Halo", "Single Ladies", "Crazy In Love", "Irreplaceable", "Love On Top"] },
      { name: "The Weeknd", songs: ["Blinding Lights", "Starboy", "Save Your Tears", "Can't Feel My Face", "Earned It"] }
    ],
    hi: [
      { name: "Arijit Singh", songs: ["Tum Hi Ho", "Channa Mereya", "Ae Dil Hai Mushkil", "Raabta", "Muskurane"] },
      { name: "Shreya Ghoshal", songs: ["Teri Meri", "Sun Raha Hai", "Saans", "Agar Tum Mil Jao", "Param Sundari"] },
      { name: "Sonu Nigam", songs: ["Kal Ho Naa Ho", "Abhi Mujh Mein Kahin", "Suraj Hua Maddham", "Panchi Nadiyan", "Do Pal"] },
      { name: "Neha Kakkar", songs: ["Aankh Marey", "Kala Chashma", "Dilbar", "Garmi", "Nikle Currant"] },
      { name: "KK", songs: ["Zara Sa", "Tadap Tadap", "Kya Mujhe Pyaar Hai", "Yaaron", "Alvida"] },
      { name: "Armaan Malik", songs: ["Bol Do Na Zara", "Main Hoon Hero Tera", "Wajah Tum Ho", "Control", "Tere Mere"] }
    ],
    ta: [
      // Sean Roldan: remove 'Maara Theme' and 'Kannaana Kanney'
      { name: "Sean Roldan", songs: ["Vaanam Kottattum", "Pariyerum Perumal Theme", "Mayakka Ponna"] },
      // Pradeep Kumar: remove 'Yaanji'
      { name: "Pradeep Kumar", songs: ["Aagayam Theepidicha", "Maya Nadhi", "Naan Nee", "Kannamma"] },
      { name: "Dhanush", songs: ["Rowdy Baby", "Kolaveri Di", "Amma Amma", "Po Indru Neeyaga", "Thulli Thulli"] },
      { name: "Karthik", songs: ["Ava Enna", "Unakkena Iruppen", "Usure Pogudhey", "Oru Naalil", "Vizhi Moodi"] },
      { name: "Sid Sriram", songs: ["Ennodu Nee Irundhaal", "Maruvaarthai", "Thalli Pogathey", "Unakku Thaan", "Adiye"] },
      // Chinmayi: remove 'Idhu Varai', 'Un Perai Sollum', 'Lago Mare'
      { name: "Chinmayi", songs: ["Sara Sara", "Oh Penne"] }
    ],
    te: [
      // Telugu singer-song attributions corrected
      { name: "Sid Sriram", songs: ["Samajavaragamana", "Inkem Inkem Inkem Kaavaale", "Manasa", "Chiranjeevi Chiranjeevi"] },
      { name: "Anurag Kulkarni", songs: ["Pilla Raa"] },
      { name: "Ramya Behara", songs: ["Adiga Adiga"] },
      { name: "Shreya Ghoshal", songs: ["Saaho Re", "Hey Pillagada", "Ye Chota Nuvvunna"] },
      { name: "Sunitha", songs: ["Naa Manasuki", "Mamathala Thalli", "Nee Kallalona", "Yevaro", "Vintunnava", "Neeli Neeli Akasam"] },
      { name: "Chinmayi", songs: ["Yem Sandeham Ledu", "Pranaamam", "Nijamainadi", "Darshana", "Kanulanu Thaake"] },
      // Oo Antava credited to Indravathi Chauhan, not Mangli; Mangli's role in Ramuloo Ramulaa clarified by UI note (see below)
      { name: "Mangli", songs: ["Saranga Dariya", "Bullet Bandi", "Ramuloo Ramulaa", "Gangavva Song"] }, // extra - UI note for Ramuloo Ramulaa
      { name: "Indravathi Chauhan", songs: ["Oo Antava"] }
    ],
    ml: [
      // Sithara Krishnakumar: Only authentic solos/duets she performed. Example: "Vaanam Thilathilakkanu" (Uyare), "Pavizha Mazha" (Athiran), "Oru Venal Puzhayil", "Ee Shishirakaalam", "Rahasyamay" (duet, Kuruthi) etc.
      { 
        name: "Sithara Krishnakumar", 
        songs: [
          "Vaanam Thilathilakkanu", // Uyare, solo
          "Pavizha Mazha", // Athiran, solo
          "Oru Venal Puzhayil", // Summer in Bethlehem, actual attribution
          "Ee Shishirakaalam", // Mayanadhi, duet with Shahabaz Aman
          "Rahasyamay (duet)" // Kuruthi, duet with Zia Ul Haq
        ]
      },
      // Vijay Yesudas: Only iconic hits as main singer. Remove devotional/uncertain; keep "Malare", "Jimikki Kammal".
      { 
        name: "Vijay Yesudas", 
        songs: [
          "Malare", // Premam
          "Entammede Jimikki Kammal", // Velipadinte Pusthakam
          "Omal Kanmani", // Mayavi, love duet, he is male lead (w/ Sujatha)
          "Thaniye Mizhikal (duet)", // Bhaskar The Rascal, with Shreya Ghoshal
          "Poomuthole" // Joseph, lead vocal (confirmed)
        ]
      },
      // K. S. Chithra: Only confirmed songs, mark/clarify duet/alternate as needed.
      {
        name: "K. S. Chithra",
        songs: [
          "Manathe Chandanakkeeru", // Unnikkale Oru Kadha Parayam, solo
          "Unaru Unaru", // 'Unaru' film, solo
          "Aalolam", // 'Chamayam', solo
          "Vellarika (duet with M. G. Sreekumar)", // Ayal Kadha Ezhuthukayanu, mark as duet
          "Manathe Chandanakkeeru (1987 ver.)" // sometimes duet, specify alternate
        ]
      },
      // Hesham Abdul Wahab: Indicate singer/composer only, clarify role.
      {
        name: "Hesham Abdul Wahab",
        songs: [
          "Darshana (singer & composer)", // Hridayam, main male singer & composer
          "Kudukku (composer only)",      // Bro Daddy, sung by Vineeth Sreenivasan & MG Sreekumar
          "Rathi Pushpam (composer/singer)", // Auto, both
          "Mayilpeeli (composer only)",   // Ayisha, sung by KS Chithra et al
          "Thaarame Thaarame (composer only)" // Ishq, composer; sung by Sid Sriram
        ]
      },
      // Vineeth Sreenivasan: Review, mainly keep main hits
      {
        name: "Vineeth Sreenivasan",
        songs: [
          "Premam Aluva Puzha", // Premam
          "Aaro Nenjil", // Thattathin Marayathu
          "Malarvadi Arts Club", // Title song
          "Palavattam", // Chappa Kurishu
          "Thudakkam Mangalyam" // Bangalore Days
        ]
      },
      // Shreya Ghoshal: Remove lesser-knowns, keep only most widely known/real
      {
        name: "Shreya Ghoshal",
        songs: [
          "Chanthu Thottille (duet)", // Banaras, duet with Vijay Yesudas
          "Mandharacheppundo (duet)", // Dasharatham, duet with P. Jayachandran (flag if alternate, else omit)
          // Mark: Any Malayalam song here features her only if confirmed major appearance.
        ]
      }
    ],
    kn: [
      { name: "Sonu Nigam", songs: ["Neene Neene", "Swalpaagidantha", "Baa Baa", "Ee Sanje Yaakaagide", "Nenapirali"] },
      { name: "Vijay Prakash", songs: ["Raajakumara", "Kareyole", "Belageddu", "Kanasu", "Mungaru Male"] },
      // Only genuine Kannada songs sung by Armaan Malik
      { name: "Armaan Malik", songs: ["Ondu Malebillu", "Ninna Snehadinda", "Jeeva Hoovagide"] },
      { name: "Chandan Shetty", songs: ["3 Peg", "Halagode", "Chocolate Girl", "Geetha", "Fire"] },
      { name: "Shreya Ghoshal", songs: ["Ninnindale", "Kannale Kannale", "Kanasugala Nanagu", "Edeya Doora", "Sundari"] },
      { name: "Rajesh Krishnan", songs: ["Preetse Preetse", "Janumada Gelathi", "Baaro Krishnayya", "Madhura Pisumaatige", "Baare Baare"] }
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
    hi: [
      { name: "A. R. Rahman", songs: ["Jai Ho", "Kun Faya Kun", "Roobaroo", "Dil Se Re", "Tere Bina", "Agar Tum Saath Ho"] },
      { name: "Pritam", songs: ["Channa Mereya", "Tum Hi Ho Bandhu", "Badtameez Dil", "Gerua"] },
      { name: "Vishal-Shekhar", songs: ["Ghungroo", "Radha", "Bin Tere", "Balam Pichkari", "Desi Girl"] },
      { name: "Shankar–Ehsaan–Loy", songs: ["Mitwa", "Senorita", "Kal Ho Naa Ho", "Gallan Goodiyaan", "Sapno Se Bhare"] },
      { name: "Ajay-Atul", songs: ["Zingat", "Mere Nishaan", "Abhi Mujh Mein Kahin", "Apsara Aali", "Sairat Zaala Ji"] },
      { name: "Amaal Mallik", songs: ["Sooraj Dooba Hain", "Main Hoon Hero Tera", "Kar Gayi Chull", "Naina", "Gulabi 2.0"] }
    ],
    ta: [
      // Ilaiyaraaja only his own true hits; include En Iniya Pon Nilave here, remove from Yuvan
      { name: "Ilaiyaraaja", songs: ["Mandram Vandha", "Nilaave Vaa", "Ennulle Ennulle", "Anandha Raagam", "Valaiyosai", "En Iniya Pon Nilave"] },
      { name: "A. R. Rahman", songs: ["New York Nagaram", "Munbe Vaa", "Ennodu Nee Irundhal", "Uyire Uyire", "Vennilave Vennilave"] },
      { name: "Anirudh Ravichander", songs: ["Vaathi Coming", "Why This Kolaveri Di", "Chellamma", "Kaadhal Kan Kattudhe", "Neeyum Naanum"] },
      // Sean Roldan: Correct list, do not include 'Maara Theme' or 'Kannaana Kanney'
      { name: "Sean Roldan", songs: ["Vaanam Kottattum", "Mayakka Ponna", "Paraak Paraak", "Kaalam Ingu Sari Illai"] },
      // Ghibran: add 'Maara Theme'
      { name: "Ghibran", songs: ["Maara Theme", "Sara Sara", "Vikram Title Track", "Neeye", "Raja Raja Chozhan"] },
      // D. Imman: add 'Kannaana Kanney'
      { name: "D. Imman", songs: ["Kannaana Kanney"] },
      { name: "Harris Jayaraj", songs: ["Un Perai Sollum", "Neethane En Ponvasantham", "Vaarayo Vaarayo", "Vaseegara", "Uyirin Uyire"] },
      // Saravana should be only under Srikanth Deva, remove from Yuvan
      { name: "Yuvan Shankar Raja", songs: ["Idhu Varai", "Pudhu Metro Rail", "Ninaithu Ninaithu"] },
      { name: "Srikanth Deva", songs: ["Saravana", "Ulagam Unnai", "Dhanushka", "Madura Veeran", "Kadhal Virus"] }
    ],
    te: [
      // Cleaned and correct attribution per requirements:
      // - "Butta Bomma" only under Thaman S, NOT under Devi Sri Prasad or Gopi Sundar.
      // - "Aaradugula Bullet" only under Devi Sri Prasad.
      // - "Jagadananda Karaka" removed (traditional/featured by Keeravani, not composed by him nor Mani Sharma).
      // - "Blockbuster" only under Devi Sri Prasad, NOT Gopi Sundar.
      // - "Manohari" only under Keeravani, NOT Gopi Sundar.
      // - "Love Aaj Kal" (Hindi, Pritam) removed from Anup Rubens.

      { name: "Devi Sri Prasad", songs: [
        "Seeti Maar",
        "Ringa Ringa",
        "Top Lesi Poddi",
        "Gabbar Singh Title",
        "Aaradugula Bullet",    // Correct placement (Removed from Mani Sharma)
        "Blockbuster"          // Correct placement (Removed from Gopi Sundar)
      ]},
      { name: "Mani Sharma", songs: [
        "Bommali",
        "Ninnu Kori Varnam",
        "Cheliya Cheliya"
        // Removed "Aaradugula Bullet" (not his song)
        // Removed "Jagadananda Karaka"
      ]},
      { name: "M. M. Keeravani", songs: [
        "Baahubali Title Song",
        "Telusa Telusa",
        "Oka Pranam",
        "Kannaa Nidurinchara",
        "Endhuko Emo",
        "Manohari" // Correct: "Manohari" by Keeravani only
        // Removed "Jagadananda Karaka"
      ]},
      { name: "Thaman S", songs: [
        "Butta Bomma",          // Kept ONLY under Thaman S, removed from others
        "Samajavaragamana",
        "Maguva Maguva",
        "Oo Antava",
        "Jinthak Chithak"
      ]},
      { name: "Gopi Sundar", songs: [
        "Inkem Inkem",
        "Damaalu Dumeelu"
        // Removed "Blockbuster" (not by Gopi Sundar)
        // Removed "Manohari" (not by Gopi Sundar)
        // Removed "Buttabomma" (shouldn't be here or anywhere else)
      ]},
      { name: "Anup Rubens", songs: [
        "Seetakoka Chiluka",
        "Chudandi Saaru",
        "Oka Laila Kosam",
        "Choopulatho Guchi"
        // Removed "Love Aaj Kal" (not Telugu, not by him)
      ]}
    ],
    ml: [
      { name: "M. Jayachandran", songs: ["Poomuthole", "Olanjali Kuruvi", "Mazhaye Mazhaye", "Mizhiyithalil Kanneer", "Aararo"] },
      // Gopi Sundar: Remove 'Malare' and 'Jimikki Kammal' (neither are his compositions)
      { name: "Gopi Sundar", songs: ["Pularkalam", "Aarodum Parayuka", "Pavizha Mazha"] },
      // Shaan Rahman: Retain ONLY 'Jimikki Kammal'
      { name: "Shaan Rahman", songs: ["Jimikki Kammal"] },
      // Bijibal: Remove 'Oru Venal Puzhayil' (not his composition)
      { name: "Bijibal", songs: ["Onnum Mindathe", "Mukkathe Penne", "Mazha Paadum", "Megham Poothu Thudangi"] },
      // Deepak Dev: Keep as is (already correct major hits)
      { name: "Deepak Dev", songs: ["Chenthengin", "Mandaarame", "Chirakukal", "Pathirayo Pakalai", "Mazhamegha"] },
      // Hesham Abdul Wahab: Only 'Darshana' (composer and singer). Remove others (incorrectly attributed).
      { name: "Hesham Abdul Wahab", songs: ["Darshana"] }
    ],
    kn: [
      { name: "V. Harikrishna", songs: ["Belageddu", "Kareyole", "Raajakumara", "Ninna Snehadinda", "Simple Agi Ondh Love Story"] },
      { name: "Arjun Janya", songs: ["Jeeva Hoovagide", "Aamele", "Sangathiye", "Ninna Nodalento", "Kurudu Kanchana"] },
      { name: "Manikanth Kadri", songs: ["Janumada Gelathi", "Premakke Sai", "Kanasugala Nanagu", "Ondu Malebillu", "Anthintha Heluve"] },
      { name: "Raghu Dixit", songs: ["Ninna Poojege Bande Mahadeshwara", "Lokada Kalaji", "Idu Entha Lokavayya", "Jag Changa", "Gudi Gudiya"] },
      { name: "Sadhu Kokila", songs: ["Chandramukhi Pranasakhi", "Thirboki Jeevana", "Haago Niliya"] },
      { name: "Ajaneesh Loknath", songs: ["Karabuu", "Hands Up", "Swalpaagidantha", "Shaakuntle Sikkalu", "Neenaade Naa"] }
    ]
  };

  // No duplicate/numbered artists; deduplication is inherent in the above lists.
  // Each artist is unique, all songs per artist go together.

  /**
   * Helper: ensure only allowed songs are in the artist's list (for future-proofing data integrity).
   * Checks a provided attribution list against a canonical allowed list for each composer.
   * Usage: Pass canonicalSongMap and check on UI render or during seeds update.
   */
  function validateComposerSongs(artistName, songs, canonicalMap) {
    // canonicalMap: { [composerName]: Set([...songs]) }
    if (!canonicalMap || !canonicalMap[artistName]) return songs;
    return songs.filter(song => canonicalMap[artistName].has(song));
  }

  return {
    singers: SINGER_SEED[langKey] || [],
    musicDirectors: MUSIC_DIRECTOR_SEED[langKey] || []
  };
}

const canShowLyrics = (langKey) => langKey === "en";

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
  // App local state
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [roleSelection, setRoleSelection] = useState(null); // "singers" or "music-directors"
  const [artistGridPage, setArtistGridPage] = useState(0);

  // Video state management (for demo)
  const [songVideos, setSongVideos] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [openPlayers, setOpenPlayers] = useState({});

  // Helper: get demo artists by language for each role (returns {singers, musicDirectors})
  function getArtists(langKey) {
    if (!langKey) return { singers: [], musicDirectors: [] };
    return makeDemoArtists(langKey);
  }

  // States for search (if necessary for paging/scroll)
  const [searchVal, setSearchVal] = useState("");

  // When language or mode changes, reset page and search state
  useEffect(() => {
    setArtistGridPage(0);
    setSearchVal("");
  }, [selectedLanguage, roleSelection]);

  // Fetch YT videos for the 9 visible artists on current page (per role)
  useEffect(() => {
    if (!selectedLanguage || !roleSelection) return;
    const { singers, musicDirectors } = getArtists(selectedLanguage);
    const targetList = roleSelection === "singers" ? singers : musicDirectors;
    const gridArtists = targetList.filter(a =>
      !searchVal.trim() ||
      a.name.toLowerCase().includes(searchVal.trim().toLowerCase())
    ).slice(artistGridPage * 9, artistGridPage * 9 + 9);

    // For each artist+song, fetch (if not present)
    gridArtists.forEach(artist => {
      let songs = artist.songs;
      if (songs.length < 5) songs = Array(5).fill(0).map((_, i) => songs[i % artist.songs.length]);
      songs.slice(0, 5).forEach(songTitle => {
        const key = `${roleSelection === "singers" ? "singer" : "director"}|${artist.name}|${songTitle}`;
        if (songVideos[key] !== undefined) return;
        setLoadingMap(lm => ({ ...lm, [key]: true }));
        // DEBUG: Log query parameters
        console.debug(`[SongVideoFetch] Fetching for:`, {artist: artist.name, songTitle});
        fetchYouTubeVideos(`${artist.name} ${songTitle}`, { maxResults: 1 })
          .then(videos => {
            // Detect and surface errors/quota/fallbacks
            let errMsg = "";
            let videoObj = null;
            if (!Array.isArray(videos) || videos.length === 0) {
              errMsg = "No video found.";
              console.warn(`[SongVideoFetch] No video for "${artist.name} ${songTitle}"`);
            } else {
              videoObj = videos[0];
              // DEBUG: Print what we picked
              console.debug(
                `[SongVideoFetch] Success for "${artist.name} - ${songTitle}": id=${videoObj && videoObj.videoId}, title=${videoObj && videoObj.title}`
              );
              // For deep debug, log full object if something seems off
              if (!videoObj.videoId || !videoObj.title) {
                console.warn(`[SongVideoFetch] (WARN) Odd videoObj for "${artist.name}|${songTitle}":`, videoObj, videos);
              }
            }
            setSongVideos(prev => ({ ...prev, [key]: videoObj }));
            setErrorMap(prev => ({ ...prev, [key]: errMsg }));
            setLoadingMap(prev => ({ ...prev, [key]: false }));
          })
          .catch((e) => {
            // Try to give a friendly/youtube API quota hint if detectable.
            console.error(`[SongVideoFetch] Error: Unable to load for "${artist.name} - ${songTitle}":`, e && e.message);
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

  // Small helper: song context clarifications and footnotes by artist/song
  function getSongClarification(artistName, songTitle) {
    // Malayalam singers clarification & roles
    // Sithara Krishnakumar: "Rahasyamay (duet)"
    if (artistName === "Sithara Krishnakumar" && songTitle.includes("Rahasyamay")) {
      return {
        tooltip: "Duet with Zia Ul Haq (Kuruthi).",
        mark: <sup style={{ color: "#bb7599" }} title="Duet">{'🎶'}</sup>
      };
    }
    if (artistName === "Sithara Krishnakumar" && songTitle === "Ee Shishirakaalam") {
      return {
        tooltip: "Duet with Shahabaz Aman (Mayanadhi).",
        mark: <sup style={{ color: "#bb7599" }} title="Duet">{'🎶'}</sup>
      };
    }
    // Vijay Yesudas: Thaniye Mizhikal (duet), Omal Kanmani (male lead duet)
    if (artistName === "Vijay Yesudas" && songTitle === "Thaniye Mizhikal (duet)") {
      return {
        tooltip: "Duet with Shreya Ghoshal.",
        mark: <sup style={{ color: "#62abf5" }} title="Duet">{'🎶'}</sup>
      };
    }
    if (artistName === "Vijay Yesudas" && songTitle === "Omal Kanmani") {
      return {
        tooltip: "Duet (male lead). Original film: Mayavi.",
        mark: <sup style={{ color: "#62abf5" }} title="Duet">{'🎶'}</sup>
      };
    }
    // K. S. Chithra: Vellarika and Manathe Chandanakkeeru (alt version)
    if (artistName === "K. S. Chithra" && songTitle.includes("Vellarika")) {
      return {
        tooltip: "Duet with M. G. Sreekumar in Ayal Kadha Ezhuthukayanu.",
        mark: <sup style={{ color: "#f2bb41" }} title="Duet">{'🎶'}</sup>
      };
    }
    if (artistName === "K. S. Chithra" && songTitle.includes("(ver")) {
      return {
        tooltip: "Alternate/older version.",
        mark: <sup style={{ color: "#b774d2" }} title="Alternate version">{'♻'}</sup>
      };
    }
    // Hesham Abdul Wahab - clarify role in every song
    if (artistName === "Hesham Abdul Wahab") {
      if (songTitle.includes("Darshana")) {
        return {
          tooltip: "Singer & Composer (Hridayam, 2022)",
          mark: <sup style={{ color: "#4db56a" }} title="Singer & Composer">{'◆'}</sup>
        };
      }
      if (songTitle.includes("Kudukku")) {
        return {
          tooltip: "Composer only. Vocals by Vineeth Sreenivasan, MG Sreekumar.",
          mark: <sup style={{ color: "#a777c0" }} title="Composer Only">{'C'}</sup>
        };
      }
      if (songTitle.includes("Mayilpeeli")) {
        return {
          tooltip: "Composer only. Sung by KS Chithra et al.",
          mark: <sup style={{ color: "#a777c0" }} title="Composer Only">{'C'}</sup>
        };
      }
      if (songTitle.includes("Rathi Pushpam")) {
        return {
          tooltip: "Composer & singer.",
          mark: <sup style={{ color: "#4db56a" }} title="Composer & Singer">{'◆'}</sup>
        };
      }
      if (songTitle.includes("Thaarame Thaarame")) {
        return {
          tooltip: "Composer only; vocals by Sid Sriram.",
          mark: <sup style={{ color: "#a777c0" }} title="Composer Only">{'C'}</sup>
        };
      }
    }
    // Vineeth Sreenivasan: all main hits, solo/lead, no footnote needed (covered by artist attribution)
    // Shreya Ghoshal: Only put clarification if duet/well-known pairing
    if (artistName === "Shreya Ghoshal" && songTitle.includes("Chanthu Thottille")) {
      return {
        tooltip: "Duet with Vijay Yesudas (Banaras, 2009).",
        mark: <sup style={{ color: "#8d63c7" }} title="Duet">{'🎶'}</sup>
      };
    }
    if (artistName === "Shreya Ghoshal" && songTitle.includes("Mandharacheppundo")) {
      return {
        tooltip: "Duet with P. Jayachandran.",
        mark: <sup style={{ color: "#8d63c7" }} title="Duet">{'🎶'}</sup>
      };
    }

    // Hindi singers
    if (artistName === "Arijit Singh" && songTitle === "Raabta") {
      return {
        tooltip: "This is the newer 2017 version of 'Raabta' sung by Arijit, not the original.",
        mark: <sup style={{ color: "#a492f1" }} title="Newer version (2017)">{'★'}</sup>
      };
    }
    if (artistName === "Shreya Ghoshal" && songTitle === "Param Sundari") {
      return {
        tooltip: "This is a high-energy dance number.",
        mark: <sup style={{ color: "#e98768" }} title="Dance number">{'•'}</sup>
      };
    }
    if (artistName === "Shreya Ghoshal" && songTitle === "Sun Raha Hai") {
      return {
        tooltip: "This is the female version; the male version (by Ankit Tiwari) is more well known.",
        mark: <sup style={{ color: "#e98768" }} title="Female version">{'ⓘ'}</sup>
      };
    }
    // Telugu singer-song attribution clarifications
    //  – Pilla Raa: main singer is Anurag Kulkarni, feat. Sravana Bhargavi/Chinmayi for chorus in versions
    if (artistName === "Anurag Kulkarni" && songTitle === "Pilla Raa") {
      return {
        tooltip: "Sung by Anurag Kulkarni; sometimes features additional chorus vocals by others.",
        mark: <sup style={{ color: "#2bc67b" }} title="Solo by Anurag Kulkarni">{'♬'}</sup>
      };
    }
    // – Adiga Adiga: main singer is Ramya Behara
    if (artistName === "Ramya Behara" && songTitle === "Adiga Adiga") {
      return {
        tooltip: "Main version by Ramya Behara.",
        mark: <sup style={{ color: "#2b95c4" }} title="Solo by Ramya Behara">{'♬'}</sup>
      };
    }
    // – Chiranjeevi Chiranjeevi: Actually Sid Sriram (male version)
    if (artistName === "Sid Sriram" && songTitle === "Chiranjeevi Chiranjeevi") {
      return {
        tooltip: "Sung by Sid Sriram. Female version performed separately.",
        mark: <sup style={{ color: "#bb447c" }} title="Sid Sriram version">{'♂'}</sup>
      };
    }
    // – Neeli Neeli Akasam: Sunitha is female lead
    if (artistName === "Sunitha" && songTitle === "Neeli Neeli Akasam") {
      return {
        tooltip: "Sunitha's melodic female solo; folk version also exists.",
        mark: <sup style={{ color: "#4891e7" }} title="Sunitha">{'♬'}</sup>
      };
    }
    // – Mangli, “Ramuloo Ramulaa”: minor/chorus role, not lead
    if (artistName === "Mangli" && songTitle === "Ramuloo Ramulaa") {
      return {
        tooltip: "Mangli contributed chorus/festival vocals; main vocals by Anurag Kulkarni.",
        mark: <sup style={{ color: "#e17e10" }} title="Chorus/Festival Contribution">{'(min.)'}</sup>
      };
    }
    // – Oo Antava: by Indravathi Chauhan, not Mangli
    if (artistName === "Indravathi Chauhan" && songTitle === "Oo Antava") {
      return {
        tooltip: "Breakout solo song by Indravathi Chauhan.",
        mark: <sup style={{ color: "#ff1096" }} title="Solo by Indravathi Chauhan">{'♬'}</sup>
      };
    }
    // For completeness, if ever if collaborative: show “feat.” mark in the future.
    // Special: Kar Gayi Chull – clarify attribution for Amaal Mallik
    if (
      artistName === "Amaal Mallik" &&
      songTitle === "Kar Gayi Chull"
    ) {
      return {
        tooltip: "Original song by Badshah–Fazilpuria; Bollywood film adaptation/arrangement by Amaal Mallik.",
        mark: <sup style={{ color: "#e27187" }} title="Original song by Badshah–Fazilpuria; Bollywood adaption by Amaal Mallik">*</sup>
      };
    }
    // Neha Kakkar: footnote for remakes (all songs in demo list for her)
    if (
      artistName === "Neha Kakkar" &&
      ["Aankh Marey", "Kala Chashma", "Dilbar", "Garmi", "Nikle Currant"].includes(songTitle)
    ) {
      return {
        tooltip: "Neha featured in several remake or group songs.",
        mark: <sup style={{ color: "#5e52b5" }} title="Remake/Group Song">{'Ὤ8'}</sup> // Unicode info, but fallback to i
          || <sup style={{ color: "#5e52b5" }} title="Remake/Group Song">i</sup>
      };
    }
    // Armaan Malik, Control
    if (artistName === "Armaan Malik" && songTitle === "Control") {
      return {
        tooltip: "This is an English pop single released internationally.",
        mark: <sup style={{ color: "#379ccc" }} title="English Pop">{'ἱ0'}</sup>
          || <sup style={{ color: "#379ccc" }} title="English Pop">EN</sup>
      };
    }
    // No context
    return null;
  }

  // PUBLIC_INTERFACE: Card for a single artist with vertical YouTube video list
  function ArtistGridCard({ artist, role }) {
    let songs = artist.songs && artist.songs.length < 5
      ? Array(5).fill(0).map((_, i) => artist.songs[i % artist.songs.length])
      : artist.songs;
    songs = songs.slice(0, 5);

    // For Neha Kakkar, summarize remake/group note once per card as subtle footnote
    const isNehaKakkar = artist.name === "Neha Kakkar";
    let hasNehaFootnote = false; // Tracks if we rendered one Neha footnote

    // For Amaal Mallik+Kar Gayi Chull: show bottom attribution
    const showKarGayiChullFootnote =
      artist.name === "Amaal Mallik" && songs.includes("Kar Gayi Chull");

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

            // Clarification context: Tooltip/footnote if appropriate
            const clarify = getSongClarification(artist.name, songTitle);

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
                  <span
                    // Tooltip: Only show if clarification exists
                    {...(clarify ? { title: clarify.tooltip, style: { cursor: "help" } } : {})}
                  >
                    {songTitle}
                  </span>
                  {/* Mark: add only if clarify Data */}
                  {clarify && clarify.mark}
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
                  {/* Graceful fallback: friendly message if API error, quota issue, or no results */}
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
                </div>
              </div>
            );
          })}
          {/* For Neha Kakkar, a single subtle footnote at card bottom */}
          {isNehaKakkar && (
            <div style={{
              color: "#5e52b5",
              fontSize: 12,
              marginTop: 8,
              textAlign: "center",
              opacity: 0.72
            }}>
              <span style={{ fontSize: 14, verticalAlign: "middle" }}>
                {String.fromCharCode(8508) /* info/tooltip symbol unicode */}
              </span>{" "}
              Many of Neha's songs are remakes or are group performances.
            </div>
          )}
          {/* For Amaal Mallik, show a footnote for Kar Gayi Chull attribution at card bottom if shown */}
          {showKarGayiChullFootnote && (
            <div style={{
              color: "#e27187",
              fontSize: 12,
              marginTop: 8,
              textAlign: "center",
              opacity: 0.82
            }}>
              * Kar Gayi Chull: Original song by Badshah–Fazilpuria. Bollywood adaptation/arrangement by Amaal Mallik for Kapoor & Sons (2016).
            </div>
          )}
        </div>
      </div>
    );
  }

  // Layout: Show language grid if no language selected
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

  // Layout: Show selection between "Singers" or "Music Directors", as prominent columns
  if (!roleSelection) {
    // Only both if music directors exist for this language
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
            {/* Show "Music Directors" always for ta and en */}
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

  // Layout: show the selected set (3x3 grid, with artist card "column" and their vertical YT embeds)
  const { singers, musicDirectors } = getArtists(selectedLanguage);
  const isSingers = roleSelection === "singers";
  const fullList = isSingers ? singers : musicDirectors;

  // Filtering (if search in future), just for searchBox/scroll add-on
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
        {/* Top Bar with Back, Indicator & optional search */}
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
        {/* The 3x3 grid */}
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
        {/* Pagination */}
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