import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPopularTrails } from "../services/api";
import Navbar from "../components/Navbar";
import useMobile from "../hooks/useMobile";

// Smooth Catmull-Rom spline through EBC altitude data (Lukla → Kala Patthar → Lukla)
const EBC_LINE =
  "M0,72 C7,70 29,62 44,58 C59,54 74,51 89,48 C104,45 118,40 133,36 C148,32 163,26 178,22 C193,18 207,15 222,12 C237,10 252,4 267,8 C282,12 296,31 311,39 C326,47 341,53 356,58 C371,64 393,70 400,72";
const EBC_AREA = EBC_LINE + " L400,80 L0,80 Z";

// Deterministic star positions — avoids re-render jitter from Math.random()
const STARS = Array.from({ length: 65 }, (_, i) => ({
  size: ((i * 7 + 3) % 18) / 10 + 1,
  top: ((i * 13 + 7) % 44) + 1,
  left: ((i * 17 + 5) % 99) + 0.5,
  opacity: ((i * 11 + 3) % 55) / 100 + 0.2,
  duration: ((i * 3 + 2) % 28) / 10 + 2,
}));

const DIFFICULTY_BADGE = {
  easy: { bg: "#E8F5E9", color: "#2E7D32" },
  moderate: { bg: "#FFF8E1", color: "#F57F17" },
  hard: { bg: "#FBE9E7", color: "#BF360C" },
  expert: { bg: "#FCE4EC", color: "#880E4F" },
};

function TrailCard({ trail }) {
  const badge = DIFFICULTY_BADGE[trail.difficulty] || {
    bg: "#F0EDE8",
    color: "#555",
  };
  return (
    <Link
      to={`/trails/${trail.slug}`}
      style={{
        display: "block",
        textDecoration: "none",
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid #E8E5E0",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1A3A2A, #2D5A3D)",
          padding: "32px 28px 28px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <span
            style={{
              fontSize: "11px",
              padding: "3px 10px",
              borderRadius: "20px",
              backgroundColor: "rgba(196,151,58,0.2)",
              color: "#C4973A",
            }}
          >
            {trail.region}
          </span>
          <span
            style={{
              fontSize: "11px",
              padding: "3px 10px",
              borderRadius: "20px",
              backgroundColor: badge.bg,
              color: badge.color,
              textTransform: "capitalize",
            }}
          >
            {trail.difficulty}
          </span>
        </div>
        <h3
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "24px",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.2,
            marginBottom: "20px",
          }}
        >
          {trail.name}
        </h3>
        <div style={{ display: "flex", gap: "20px" }}>
          <div>
            <p
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "26px",
                fontWeight: 700,
                color: "#C4973A",
                lineHeight: 1,
              }}
            >
              {trail.duration_days}
            </p>
            <p
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                marginTop: "4px",
              }}
            >
              Days
            </p>
          </div>
          <div
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              paddingLeft: "20px",
            }}
          >
            <p
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "26px",
                fontWeight: 700,
                color: "#C4973A",
                lineHeight: 1,
              }}
            >
              {trail.max_altitude_m.toLocaleString()}
            </p>
            <p
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                marginTop: "4px",
              }}
            >
              Max metres
            </p>
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p style={{ fontSize: "12px", color: "#999" }}>{trail.best_seasons}</p>
        <span style={{ fontSize: "18px", color: "#C4973A" }}>→</span>
      </div>
    </Link>
  );
}

export default function Home() {
  const [trails, setTrails] = useState([]);
  const isMobile = useMobile();

  useEffect(() => {
    getPopularTrails().then((res) => setTrails(res.data));
  }, []);

  const featured = trails[0] || null;
  const gridTrails = trails.slice(1);

  return (
    <div
      style={{
        backgroundColor: "#F7F5F0",
        fontFamily: "DM Sans, sans-serif",
        overflowX: "hidden",
      }}
    >
      <Navbar transparent>
        <Link
          to="/trails"
          style={{
            fontSize: "12px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.8)",
            textDecoration: "none",
          }}
        >
          Trails
        </Link>
        <Link
          to="/trails"
          style={{
            fontSize: "13px",
            padding: "10px 24px",
            borderRadius: "24px",
            backgroundColor: "#C4973A",
            color: "#FFF",
            textDecoration: "none",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          Explore Now
        </Link>
      </Navbar>

      {/* ── HERO ────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          height: "100vh",
          minHeight: "700px",
          overflow: "hidden",
        }}
      >
        {/* Sky gradient — deeper navy at top, green at bottom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, #080F1A 0%, #0D1F2D 22%, #122A1E 55%, #1A3A2A 80%, #2D5A3D 100%)",
          }}
        />

        {/* Stars */}
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: s.size + "px",
              height: s.size + "px",
              borderRadius: "50%",
              backgroundColor: `rgba(255,255,255,${s.opacity})`,
              top: s.top + "%",
              left: s.left + "%",
              animation: `twinkle ${s.duration}s ease-in-out infinite alternate`,
            }}
          />
        ))}

        {/* Grain texture overlay */}
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.04,
            pointerEvents: "none",
          }}
        >
          <filter id="heroGrain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#heroGrain)" />
        </svg>

        {/* Mountain SVG — layered ranges */}
        <svg
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMax meet"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
          }}
        >
          {/* Distant hazy range */}
          <path
            d="M0,380 L80,260 L160,310 L240,200 L320,280 L400,180 L480,240 L560,160 L640,220 L720,140 L800,200 L880,150 L960,210 L1040,170 L1120,230 L1200,190 L1280,250 L1360,200 L1440,270 L1440,600 L0,600 Z"
            fill="rgba(26,58,42,0.35)"
          />
          {/* Mid range */}
          <path
            d="M0,440 L100,320 L180,370 L260,280 L360,340 L440,250 L520,310 L600,230 L680,290 L760,200 L840,270 L920,220 L1000,300 L1080,240 L1160,310 L1240,260 L1320,330 L1440,300 L1440,600 L0,600 Z"
            fill="rgba(14,38,26,0.65)"
          />
          {/* Snow caps */}
          <path
            d="M756,204 L776,178 L796,185 L816,170 L836,182 L818,190 L796,181 L776,193 Z"
            fill="rgba(255,255,255,0.65)"
          />
          <path
            d="M438,253 L454,234 L462,240 L470,229 L486,241 L470,247 L462,238 L450,248 Z"
            fill="rgba(255,255,255,0.4)"
          />
          {/* Gold glow on highest peak */}
          <ellipse
            cx="796"
            cy="186"
            rx="44"
            ry="26"
            fill="rgba(196,151,58,0.1)"
          />
          {/* Front dark range */}
          <path
            d="M0,520 L120,400 L200,450 L300,370 L400,430 L500,360 L580,410 L660,350 L740,390 L820,340 L900,390 L980,350 L1060,410 L1140,360 L1220,420 L1320,380 L1440,440 L1440,600 L0,600 Z"
            fill="#0A2010"
          />
          {/* Foreground hills */}
          <path
            d="M0,560 L200,480 L400,510 L600,470 L800,500 L1000,475 L1200,505 L1440,480 L1440,600 L0,600 Z"
            fill="#071A0F"
          />
          {/* Pine trees — left */}
          {[30, 65, 100, 140].map((x, i) => (
            <g key={`tl${i}`}>
              <polygon
                points={`${x},562 ${x - 11},590 ${x + 11},590`}
                fill="#04120A"
              />
              <polygon
                points={`${x},549 ${x - 8},566 ${x + 8},566`}
                fill="#04120A"
              />
              <polygon
                points={`${x},539 ${x - 5},552 ${x + 5},552`}
                fill="#04120A"
              />
            </g>
          ))}
          {/* Pine trees — right */}
          {[1300, 1340, 1375, 1410].map((x, i) => (
            <g key={`tr${i}`}>
              <polygon
                points={`${x},562 ${x - 11},590 ${x + 11},590`}
                fill="#04120A"
              />
              <polygon
                points={`${x},549 ${x - 8},566 ${x + 8},566`}
                fill="#04120A"
              />
              <polygon
                points={`${x},539 ${x - 5},552 ${x + 5},552`}
                fill="#04120A"
              />
            </g>
          ))}
        </svg>

        {/* Hero content — editorial split layout */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: isMobile ? "column" : undefined,
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: isMobile ? "center" : undefined,
            padding: isMobile ? "0 20px" : "0 64px",
            paddingTop: isMobile ? "90px" : "80px",
            gap: isMobile ? "28px" : "48px",
            overflowY: isMobile ? "auto" : undefined,
          }}
        >
          {/* Left: headline block */}
          <div style={{ flex: isMobile ? "none" : "0 1 580px", width: isMobile ? "100%" : undefined }}>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#C4973A",
                marginBottom: "24px",
                animation: "fadeUp 0.8s ease forwards",
              }}
            >
              ✦ Nepal Trekking Information
            </p>
            <h1
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "clamp(48px, 6vw, 84px)",
                fontWeight: 700,
                color: "#FFFFFF",
                lineHeight: 1.02,
                marginBottom: "28px",
                animation: "fadeUp 0.8s ease 0.1s both",
              }}
            >
              The Himalayas,
              <br />
              <em style={{ color: "#C4973A", fontStyle: "italic" }}>
                honestly
              </em>
              <br />
              documented.
            </h1>
            <p
              style={{
                fontSize: "17px",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 300,
                lineHeight: 1.75,
                maxWidth: "400px",
                marginBottom: "40px",
                animation: "fadeUp 0.8s ease 0.2s both",
              }}
            >
              Real permits, actual altitudes, unbiased itineraries — for
              trekkers who research before they climb.
            </p>
            <div
              style={{
                display: "flex",
                gap: "14px",
                animation: "fadeUp 0.8s ease 0.3s both",
              }}
            >
              <Link
                to="/trails"
                style={{
                  padding: "16px 40px",
                  borderRadius: "32px",
                  backgroundColor: "#C4973A",
                  color: "#FFF",
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                Browse Trails
              </Link>
              <a
                href="#about"
                style={{
                  padding: "16px 40px",
                  borderRadius: "32px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#FFF",
                  textDecoration: "none",
                  fontSize: "15px",
                  backdropFilter: "blur(8px)",
                }}
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right: floating data card — hidden on mobile */}
          {!isMobile && <div
            style={{
              marginLeft: "auto",
              flexShrink: 0,
              backgroundColor: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "40px 44px",
              animation: "fadeUp 0.8s ease 0.35s both",
            }}
          >
            <p
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "68px",
                fontWeight: 700,
                color: "#C4973A",
                lineHeight: 1,
                letterSpacing: "-2px",
              }}
            >
              8,849
            </p>
            <p
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.3)",
                marginTop: "6px",
                marginBottom: "28px",
              }}
            >
              metres · Highest Peak
            </p>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: "24px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px 36px",
              }}
            >
              {[
                { val: trails.length || "—", label: "Verified routes" },
                { val: "18", label: "Regions" },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    style={{
                      fontFamily: "Fraunces, serif",
                      fontSize: "34px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "rgba(255,255,255,0.3)",
                      marginTop: "5px",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>}

        </div>

        {/* Scroll indicator — animated line */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "64px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: "1px",
              height: "48px",
              backgroundColor: "rgba(255,255,255,0.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "40%",
                backgroundColor: "rgba(255,255,255,0.55)",
                animation: "scrollLine 2.2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ─────────────────────────────────────── */}
      <div style={{ backgroundColor: "#0D2B1D" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: isMobile ? "0 20px" : "0 64px",
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          }}
        >
          {[
            { val: `${trails.length || "—"}`, label: "Verified Routes" },
            { val: "18", label: "Regions Covered" },
            { val: "8,849m", label: "Highest Peak" },
            { val: "0", label: "Agency Upsells" },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: isMobile ? "24px 0" : "36px 0",
                textAlign: "center",
                borderRight: isMobile
                  ? (i % 2 === 0 ? "1px solid rgba(255,255,255,0.07)" : "none")
                  : (i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none"),
                borderBottom: isMobile && i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}
            >
              <p
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: isMobile ? "32px" : "40px",
                  fontWeight: 700,
                  color: "#C4973A",
                  lineHeight: 1,
                }}
              >
                {s.val}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.3)",
                  marginTop: "8px",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED TRAIL ──────────────────────────────────── */}
      {featured && (
        <div style={{ backgroundColor: "#F7F5F0", padding: isMobile ? "60px 20px" : "96px 64px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: "32px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#C4973A",
                    marginBottom: "10px",
                  }}
                >
                  ✦ Featured Route
                </p>
                <h2
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: isMobile ? "30px" : "44px",
                    fontWeight: 700,
                    color: "#1A3A2A",
                    lineHeight: 1.1,
                  }}
                >
                  The Classic
                </h2>
              </div>
              <Link
                to="/trails"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#C4973A",
                  textDecoration: "none",
                  borderBottom: "1px solid #C4973A",
                  paddingBottom: "2px",
                }}
              >
                All trails →
              </Link>
            </div>

            {/* Featured card */}
            <Link
              to={`/trails/${featured.slug}`}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "44% 56%",
                borderRadius: "24px",
                overflow: "hidden",
                textDecoration: "none",
                boxShadow: "0 24px 80px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 32px 100px rgba(0,0,0,0.17)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 24px 80px rgba(0,0,0,0.1)")
              }
            >
              {/* Left — dark panel */}
              <div
                style={{
                  background:
                    "linear-gradient(160deg, #0D2B1D 0%, #1A3A2A 60%, #2D5A3D 100%)",
                  padding: isMobile ? "32px 24px" : "52px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "28px" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      backgroundColor: "rgba(196,151,58,0.2)",
                      color: "#C4973A",
                    }}
                  >
                    {featured.region}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.55)",
                      textTransform: "capitalize",
                    }}
                  >
                    {featured.difficulty}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: "42px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    lineHeight: 1.1,
                    marginBottom: "14px",
                    flex: 1,
                  }}
                >
                  {featured.name}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: "44px",
                  }}
                >
                  {featured.start_point} → {featured.end_point}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "24px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: "32px",
                  }}
                >
                  {[
                    { val: featured.duration_days, label: "Days" },
                    {
                      val: `${featured.max_altitude_m.toLocaleString()}m`,
                      label: "Max Alt",
                    },
                    {
                      val: featured.distance_km ? `${featured.distance_km}km` : `${featured.duration_days * 15}km`,
                      label: "Distance",
                    },
                  ].map((s) => (
                    <div key={s.label}>
                      <p
                        style={{
                          fontFamily: "Fraunces, serif",
                          fontSize: "26px",
                          fontWeight: 700,
                          color: "#C4973A",
                          lineHeight: 1,
                        }}
                      >
                        {s.val}
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          color: "rgba(255,255,255,0.28)",
                          marginTop: "5px",
                        }}
                      >
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — light panel with altitude chart */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: isMobile ? "28px 24px" : "52px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ marginBottom: "28px" }}>
                  <p
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#C0BAB2",
                      marginBottom: "14px",
                    }}
                  >
                    Altitude Profile
                  </p>
                  <svg
                    viewBox="0 -14 400 94"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  >
                    <defs>
                      <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#C4973A"
                          stopOpacity="0.22"
                        />
                        <stop
                          offset="100%"
                          stopColor="#C4973A"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    {[20, 40, 60].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="400"
                        y2={y}
                        stroke="#F2EFE9"
                        strokeWidth="1"
                      />
                    ))}
                    <path d={EBC_AREA} fill="url(#altGrad)" />
                    <path
                      d={EBC_LINE}
                      fill="none"
                      stroke="#C4973A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Summit marker */}
                    <circle cx="267" cy="8" r="3.5" fill="#C4973A" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text
                      x="267"
                      y="3"
                      textAnchor="middle"
                      fontSize="8.5"
                      fill="#C4973A"
                      fontFamily="DM Sans, sans-serif"
                    >
                      5,545m
                    </text>
                  </svg>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "6px",
                    }}
                  >
                    <span style={{ fontSize: "10px", color: "#CCC" }}>
                      Day 1 · Lukla 2,860m
                    </span>
                    <span style={{ fontSize: "10px", color: "#CCC" }}>
                      Day {featured.duration_days} · Return
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "15px",
                    color: "#555",
                    lineHeight: 1.8,
                    flex: 1,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {featured.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "36px",
                    paddingTop: "24px",
                    borderTop: "1px solid #F0EDE8",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#BBB" }}>
                    Best: {featured.best_seasons}
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#C4973A",
                    }}
                  >
                    View full trail →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── STATEMENT ───────────────────────────────────────── */}
      <div
        id="about"
        style={{ backgroundColor: "#FFFFFF", padding: isMobile ? "60px 20px" : "96px 64px" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ maxWidth: "860px", marginBottom: "72px" }}>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#C4973A",
                marginBottom: "24px",
              }}
            >
              ✦ Why HimalTrails
            </p>
            <h2
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "clamp(34px, 4vw, 54px)",
                fontWeight: 700,
                color: "#1A3A2A",
                lineHeight: 1.2,
              }}
            >
              "Most Nepal trekking websites exist to sell you a package.{" "}
              <span style={{ color: "#B5B0A8", fontStyle: "italic" }}>
                This one doesn't.
              </span>
              "
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "1px",
              backgroundColor: "#ECEAE5",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            {[
              {
                icon: "📋",
                title: "Exact Permit Costs",
                desc: "TIMS, national park fees, conservation area permits — every cost by route. No surprises at the checkpoint.",
              },
              {
                icon: "🧭",
                title: "2023 Guide Rules",
                desc: "Solo trekking is banned on major routes since April 2023. We document exactly which trails require a licensed guide.",
              },
              {
                icon: "⛰",
                title: "Verified Altitudes",
                desc: "Real elevation data at every stage. Critical for planning acclimatization days and understanding AMS risk.",
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{ backgroundColor: "#FAFAF8", padding: "40px 36px" }}
              >
                <div style={{ fontSize: "30px", marginBottom: "16px" }}>
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1A3A2A",
                    marginBottom: "12px",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{ fontSize: "14px", color: "#777", lineHeight: 1.75 }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRAIL GRID — visible when 2+ trails exist ───────── */}
      {gridTrails.length > 0 && (
        <div style={{ backgroundColor: "#F7F5F0", padding: isMobile ? "60px 20px" : "96px 64px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: "48px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#C4973A",
                    marginBottom: "12px",
                  }}
                >
                  ✦ More Routes
                </p>
                <h2
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: isMobile ? "28px" : "44px",
                    fontWeight: 700,
                    color: "#1A3A2A",
                    lineHeight: 1.1,
                  }}
                >
                  Where will
                  <br />
                  you go?
                </h2>
              </div>
              <Link
                to="/trails"
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#C4973A",
                  textDecoration: "none",
                  borderBottom: "1px solid #C4973A",
                  paddingBottom: "2px",
                }}
              >
                View all trails →
              </Link>
            </div>

            {/* Offset grid — right column pushed down for visual rhythm */}
            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {gridTrails.map((t) => <TrailCard key={t.id} trail={t} />)}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {gridTrails.filter((_, i) => i % 2 === 0).map((t) => <TrailCard key={t.id} trail={t} />)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "48px" }}>
                  {gridTrails.filter((_, i) => i % 2 === 1).map((t) => <TrailCard key={t.id} trail={t} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer>
        {/* Mountain silhouette — seamlessly caps the footer */}
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{
            display: "block",
            width: "100%",
            height: "80px",
            backgroundColor: gridTrails.length > 0 ? "#F7F5F0" : "#FFFFFF",
          }}
        >
          <path
            d="M0,80 L80,52 L160,66 L240,38 L320,58 L400,28 L480,50 L560,22 L640,46 L720,18 L800,42 L880,26 L960,52 L1040,32 L1120,56 L1200,36 L1280,62 L1360,44 L1440,70 L1440,120 L0,120 Z"
            fill="#0A1C12"
          />
          {[
            60, 120, 200, 280, 380, 460, 560, 660, 760, 860, 960, 1060, 1160,
            1260, 1360,
          ].map((x, i) => {
            const h = ((i * 7 + 3) % 22) + 14;
            return (
              <g key={x}>
                <polygon
                  points={`${x},${82 - h} ${x - 7},${82} ${x + 7},${82}`}
                  fill="#071410"
                />
                <polygon
                  points={`${x},${82 - h + 8} ${x - 5},${82 - 2} ${x + 5},${82 - 2}`}
                  fill="#071410"
                />
              </g>
            );
          })}
        </svg>
        <div
          style={{
            backgroundColor: "#0A1C12",
            padding: isMobile ? "24px 20px" : "36px 64px",
            display: "flex",
            flexDirection: isMobile ? "column" : undefined,
            alignItems: "center",
            justifyContent: isMobile ? undefined : "space-between",
            gap: isMobile ? "10px" : undefined,
            textAlign: isMobile ? "center" : undefined,
          }}
        >
          <span
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "20px",
              fontWeight: 700,
              color: "#C4973A",
            }}
          >
            HimalTrails
          </span>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.22)" }}>
            © 2026 HimalTrails · Built for trekkers, not agencies
          </p>
          <Link
            to="/trails"
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              textDecoration: "none",
            }}
          >
            Trails
          </Link>
        </div>
      </footer>

      {/* ── Animations ──────────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes twinkle {
          from { opacity: 0.15; }
          to   { opacity: 1; }
        }
        @keyframes scrollLine {
          0%   { transform: translateY(-100%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(280%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
