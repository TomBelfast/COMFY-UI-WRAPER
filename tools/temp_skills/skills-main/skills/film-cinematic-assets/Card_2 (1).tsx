const GeneratedComponent = () => {
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [clicked, setClicked] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ x: 0, y: 0 });
  const cardRef = React.useRef(null);

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current || clicked) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setDimensions({ x: x * 20, y: y * 20 });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setDimensions({ x: 0, y: 0 });
  };

  const handleClick = () => {
    setClicked(true);
    // Optional: Reset after animation completes to allow re-entry demo
    setTimeout(() => {
      setClicked(false);
      setMounted(false);
      setTimeout(() => setMounted(true), 100);
    }, 4000);
  };

  // Dynamic Styles
  const sunStyle = {
    transform: clicked
      ? `translateY(200%) scale(0.8)` // Setting sun
      : mounted
      ? `translateY(${hovered ? "-20px" : "0px"}) scale(${hovered ? 1.1 : 1})` // Idle/Hover
      : `translateY(200%) scale(0.8)`, // Rising sun start
    filter: `blur(${hovered ? "4px" : "0px"}) drop-shadow(0 0 ${
      hovered ? "40px" : "20px"
    } rgba(236, 72, 153, 0.8))`,
    transition: "transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.5s ease",
  };

  const textStyle = {
    opacity: clicked ? 0 : mounted ? 1 : 0,
    transform: clicked
      ? "scale(0.8) translateY(20px)"
      : `translate(${dimensions.x}px, ${dimensions.y}px) scale(${
          hovered ? 1.05 : 1
        })`,
    transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
    textShadow: hovered
      ? "2px 2px 0px #0ff, -2px -2px 0px #f0f" // Chromatic aberration
      : "0px 0px 0px transparent",
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 p-8 perspective-1000">
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .vapor-text {
          font-family: 'Courier New', monospace;
          letter-spacing: 0.1em;
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
        .retro-grid {
          background-image: 
            linear-gradient(to right, rgba(168, 85, 247, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.4) 1px, transparent 1px);
          background-size: 40px 40px;
          transform: perspective(300px) rotateX(60deg) scale(2);
          transform-origin: top center;
          animation: grid-move 2s linear infinite;
        }
        .clip-sun {
           clip-path: polygon(
             0% 0%, 100% 0%, 100% 10%, 0% 10%, 
             0% 15%, 100% 15%, 100% 25%, 0% 25%,
             0% 30%, 100% 30%, 100% 40%, 0% 40%,
             0% 45%, 100% 45%, 100% 55%, 0% 55%,
             0% 60%, 100% 60%, 100% 70%, 0% 70%,
             0% 75%, 100% 75%, 100% 85%, 0% 85%,
             0% 90%, 100% 90%, 100% 100%, 0% 100%
           );
        }
      `}</style>

      {/* Main Card Container */}
      <div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className={`
          relative w-[340px] h-[500px] rounded-2xl overflow-hidden 
          bg-[#120824] shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)]
          transition-all duration-700 ease-out border border-white/10
          cursor-pointer group select-none
          ${clicked ? "scale-95 opacity-50 grayscale" : "hover:scale-105 hover:shadow-[0_0_80px_-20px_rgba(236,72,153,0.6)]"}
        `}
      >
        {/* --- Background Elements --- */}
        
        {/* Stars */}
        <div className="absolute inset-0 z-0">
            {[...Array(20)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute bg-white rounded-full"
                    style={{
                        top: `${Math.random() * 60}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 2 + 1}px`,
                        height: `${Math.random() * 2 + 1}px`,
                        animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out`
                    }}
                />
            ))}
        </div>

        {/* The Sun */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className="w-48 h-48 rounded-full bg-gradient-to-b from-yellow-300 via-pink-500 to-purple-600 clip-sun will-change-transform"
            style={sunStyle}
          />
        </div>

        {/* Mountains (Silhouettes) */}
        <div 
            className={`absolute bottom-[35%] left-0 w-full h-24 bg-[#0a0514] z-10 transition-transform duration-1000 ${mounted ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ clipPath: 'polygon(0% 100%, 0% 60%, 15% 30%, 33% 80%, 45% 40%, 60% 70%, 75% 20%, 90% 60%, 100% 50%, 100% 100%)' }}
        />
        {/* Second layer mountain */}
         <div 
            className={`absolute bottom-[35%] left-0 w-full h-32 bg-[#1a0f2e]/80 z-0 transition-transform duration-1200 delay-100 ${mounted ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ clipPath: 'polygon(0% 100%, 20% 40%, 40% 90%, 60% 30%, 80% 80%, 100% 60%, 100% 100%)' }}
        />

        {/* The Grid Floor */}
        <div className="absolute bottom-0 w-full h-[40%] overflow-hidden z-20 border-t border-pink-500/30 bg-[#1a0b2e]">
          <div className="w-full h-full retro-grid opacity-60"></div>
          {/* Floor Glow */}
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-pink-500/20 to-transparent"></div>
        </div>

        {/* --- Foreground Content --- */}

        {/* Text Container */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pt-10">
          <div className="relative">
            {/* Glitch Shadow Layers (RGB Split) */}
            <h1 
                className={`absolute inset-0 text-6xl font-black text-red-500 opacity-70 vapor-text mix-blend-screen transition-all duration-100 ${hovered ? 'translate-x-1 translate-y-[-1px]' : 'translate-x-0'}`}
                style={{ opacity: hovered ? 0.8 : 0, transition: 'opacity 0.2s' }}
            >
                HOVER
            </h1>
            <h1 
                className={`absolute inset-0 text-6xl font-black text-cyan-500 opacity-70 vapor-text mix-blend-screen transition-all duration-100 ${hovered ? 'translate-x-[-2px] translate-y-[2px]' : 'translate-x-0'}`}
                style={{ opacity: hovered ? 0.8 : 0, transition: 'opacity 0.2s' }}
            >
                HOVER
            </h1>

            {/* Main Text */}
            <h1
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-pink-200 drop-shadow-lg italic vapor-text will-change-transform"
              style={textStyle}
            >
              HOVER
            </h1>
            <h2 
                className="text-4xl font-black text-white/90 italic tracking-widest text-center mt-2 vapor-text will-change-transform"
                style={{
                    ...textStyle,
                    transitionDelay: '0.1s',
                    textShadow: hovered ? "2px 0px #f0f" : "none"
                }}
            >
                ME
            </h2>
          </div>
        </div>

        {/* --- Overlays & Effects --- */}

        {/* Scanlines */}
        <div className="absolute inset-0 z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
        
        {/* Rolling Bar (CRT flicker) */}
        <div 
            className="absolute inset-0 z-40 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/4 pointer-events-none"
            style={{ animation: 'scanline 6s linear infinite' }}
        ></div>

        {/* Vignette */}
        <div className="absolute inset-0 z-50 rounded-2xl pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]"></div>
        
        {/* Border Glow on Hover */}
        <div className={`absolute inset-0 z-50 rounded-2xl border-2 transition-opacity duration-300 pointer-events-none ${hovered ? 'border-pink-500/50 opacity-100' : 'border-transparent opacity-0'}`}></div>

        {/* Click Flash */}
        <div className={`absolute inset-0 bg-white z-[60] pointer-events-none transition-opacity duration-300 ${clicked ? 'opacity-20' : 'opacity-0'}`}></div>
      </div>
    </div>
  );
};

export default GeneratedComponent;