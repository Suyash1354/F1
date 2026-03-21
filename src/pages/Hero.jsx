import GooeyEffect from "../components/GooeyEffect.jsx";

export default function Hero() {
  return (
    <section className="Hero w-full h-screen" style={{ cursor: "none" }}>
      <div className="w-full h-screen flex flex-col justify-between items-center overflow-hidden relative">
        <GooeyEffect
          imageSrc="/images/Helmet-Photoroom.png"
          hoverSrc="/images/Sanny1-Photoroom.png"
        />

        {/* ── TOP LEFT: Log ID + signal ── */}
        <div
          className="absolute z-50 pointer-events-none"
          style={{ top: 22, left: 28 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              width: 9, height: 9, borderRadius: "50%",
              background: "#e63333", display: "inline-block",
              animation: "blink 1.2s ease-in-out infinite", flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "monospace", fontSize: "0.82rem",
              letterSpacing: "0.12em", color: "#1A1A1A",
            }}>
              (( ))
            </span>
          </div>
          <div style={{
            fontFamily: "monospace", fontSize: "0.85rem",
            letterSpacing: "0.15em", color: "#1A1A1A",
            fontWeight: 600,
          }}>
            LOG ID // APXGP-H2
          </div>
        </div>

        {/* ── TOP RIGHT: Session + Track SVG ── */}
        <div
          className="absolute z-50 pointer-events-none"
          style={{ top: 22, right: 28, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}
        >
          <div style={{
            fontFamily: "monospace", fontSize: "0.85rem",
            letterSpacing: "0.15em", color: "#1A1A1A", fontWeight: 600,
          }}>
            SESSION: Q3
          </div>
          {/* Track outline SVG — Nürburgring-style */}
          <svg width="110" height="80" viewBox="0 0 110 80" fill="none" style={{ opacity: 0.75 }}>
            <path
              d="M20 70 L10 70 Q4 70 4 64 L4 50 Q4 38 10 30 L18 20 Q26 10 38 7 L55 5 Q70 3 80 10 L92 20 Q102 30 104 44 L105 56 Q106 67 96 72 L75 76 Q58 79 42 76 L28 72 Z"
              stroke="#1A1A1A" strokeWidth="2.2" fill="none" strokeLinejoin="round"
            />
            <path
              d="M55 5 L60 5 Q68 5 74 9"
              stroke="#1A1A1A" strokeWidth="2.2" fill="none"
            />
            <circle r="4" fill="#22c55e">
              <animateMotion dur="3s" repeatCount="indefinite"
                path="M20 70 L10 70 Q4 70 4 64 L4 50 Q4 38 10 30 L18 20 Q26 10 38 7 L55 5 Q70 3 80 10 L92 20 Q102 30 104 44 L105 56 Q106 67 96 72 L75 76 Q58 79 42 76 L28 72 Z"
              />
            </circle>
          </svg>
        </div>

        {/* ── BOTTOM LEFT: bars + G-Force ── */}
        <div
          className="absolute z-50 pointer-events-none"
          style={{ bottom: 28, left: 28 }}
        >
          {/* Bar chart */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 44, marginBottom: 8 }}>
            {[0.45, 0.65, 1, 0.55, 0.8, 0.5, 0.7].map((h, i) => (
              <div key={i} style={{
                width: 7,
                height: `${h * 100}%`,
                background: "#1A1A1A",
                borderRadius: 1.5,
              }} />
            ))}
          </div>
          <div style={{
            fontFamily: "monospace", fontSize: "0.85rem",
            letterSpacing: "0.15em", color: "#1A1A1A", fontWeight: 600,
          }}>
            LAT G-FORCE: 4.1
          </div>
        </div>

        {/* ── BOTTOM RIGHT: DRS + RPM ── */}
        <div
          className="absolute z-50 pointer-events-none"
          style={{ bottom: 28, right: 28, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}
        >
          {/* Green triangle arrow above DRS */}
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <polygon points="9,0 18,14 0,14" fill="#22c55e" />
          </svg>
          <div style={{
            fontFamily: "monospace", fontSize: "0.85rem",
            letterSpacing: "0.15em", color: "#1A1A1A", fontWeight: 600,
          }}>
            DRS STATUS: <span style={{ color: "#22c55e" }}>ACTIVE</span>
          </div>
          <div style={{
            fontFamily: "monospace", fontSize: "0.85rem",
            letterSpacing: "0.15em", color: "#1A1A1A", fontWeight: 600,
          }}>
            RPM: 13,500
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex flex-col items-center justify-center w-full h-[40%] gap-16 mt-120">
          <div className="flex Heading absolute top-100 pointer-events-none justify-between items-center gap-[24vw] text-[#D5B05F] text-[4vw] pt-sans-regular">
            <h1>PLAN C</h1>
            <h1>IS FOR</h1>
          </div>

          <div className="Heading2 w-full flex justify-center items-center text-[22vw] pt-sans-bold text-[#1A1A1A]">
            <h1 className="pointer-events-none">COMBAT</h1>
            <h1
              className="absolute z-100 pointer-events-none"
              style={{ WebkitTextStroke: "3px #F2F2F2", color: "transparent" }}
            >
              COMBAT
            </h1>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.1; }
        }
      `}</style>
    </section>
  );
}