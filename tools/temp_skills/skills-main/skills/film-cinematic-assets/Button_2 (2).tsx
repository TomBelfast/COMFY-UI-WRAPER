const GeneratedComponent = () => {
  const { useState, useEffect, useRef, useCallback } = React;
  const { Zap, Terminal, Power } = window.LucideReact || { Zap: () => null, Terminal: () => null, Power: () => null };

  const [text, setText] = useState("SYSTEM_RDY");
  const [status, setStatus] = useState("IDLE"); // IDLE, HOVER, CLICKED, REBOOTING
  const [glitchIndex, setGlitchIndex] = useState(0);

  // Audio refs (conceptual, purely visual implementation here)
  const buttonRef = useRef(null);
  
  const FINAL_TEXT = "EXECUTE";
  const CHARS = "AFZ0123456789!@#%&*<>?[]/|";

  // Scramble Text Effect (The Decode)
  const scrambleText = useCallback((targetText, duration = 1000) => {
    let iteration = 0;
    const interval = setInterval(() => {
      setText((prev) => 
        targetText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= targetText.length) {
        clearInterval(interval);
      }
      
      iteration += targetText.length / (duration / 30); // Control speed
    }, 30);
  }, []);

  // Entrance Sequence
  useEffect(() => {
    // Initial delay for dramatic effect
    const timer = setTimeout(() => {
      scrambleText(FINAL_TEXT, 800);
    }, 500);
    return () => clearTimeout(timer);
  }, [scrambleText]);

  // Handle Interaction
  const handleClick = () => {
    if (status === "CLICKED" || status === "REBOOTING") return;
    
    setStatus("CLICKED");
    
    // Play CRT shutdown animation sequence
    setTimeout(() => {
      setStatus("REBOOTING");
      setText("");
      
      // Reboot sequence
      setTimeout(() => {
        setStatus("IDLE");
        scrambleText(FINAL_TEXT, 600);
      }, 2500);
    }, 800); // Wait for collapse animation to finish
  };

  // Continuous Glitch Loop for Idle State
  useEffect(() => {
    if (status === "CLICKED") return;
    
    const glitchInterval = setInterval(() => {
      // Randomly trigger a glitch visual state
      if (Math.random() > 0.95) {
        setGlitchIndex((prev) => prev + 1);
      }
    }, 100);
    return () => clearInterval(glitchInterval);
  }, [status]);

  return (
    <div className="flex items-center justify-center min-h-[400px] w-full bg-neutral-950 font-mono overflow-hidden relative p-8">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{
             backgroundImage: `linear-gradient(#00ffea 1px, transparent 1px), linear-gradient(90deg, #00ffea 1px, transparent 1px)`,
             backgroundSize: '40px 40px',
             backgroundPosition: 'center',
             maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
           }}
      />
      
      {/* CSS Injection for Advanced Keyframes */}
      <style>{`
        @keyframes crt-collapse {
          0% { transform: scale(1, 1); opacity: 1; filter: brightness(1); }
          20% { transform: scale(1, 0.05); opacity: 1; filter: brightness(2) drop-shadow(0 0 20px #00ffea); }
          50% { transform: scale(0.02, 0.05); opacity: 1; filter: brightness(3); }
          100% { transform: scale(0, 0); opacity: 0; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes text-glitch {
          0% { clip-path: inset(40% 0 61% 0); transform: translate(-2px, 0); }
          20% { clip-path: inset(92% 0 1% 0); transform: translate(1px, 0); }
          40% { clip-path: inset(43% 0 1% 0); transform: translate(-1px, 0); }
          60% { clip-path: inset(25% 0 58% 0); transform: translate(3px, 0); }
          80% { clip-path: inset(54% 0 7% 0); transform: translate(-2px, 0); }
          100% { clip-path: inset(58% 0 43% 0); transform: translate(2px, 0); }
        }
        .glitch-layer-1 {
          animation: text-glitch 3s infinite linear alternate-reverse;
        }
        .glitch-layer-2 {
          animation: text-glitch 2s infinite linear alternate-reverse;
        }
        .scanline-overlay {
          background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.3) 51%);
          background-size: 100% 4px;
        }
      `}</style>

      {/* Main Container - Handles positioning and scale resets */}
      <div className={`relative transition-all duration-300 ${status === "REBOOTING" ? "scale-0" : "scale-100"}`}>
        
        {/* The Button */}
        <button
          ref={buttonRef}
          onClick={handleClick}
          onMouseEnter={() => setStatus("HOVER")}
          onMouseLeave={() => status !== "CLICKED" && setStatus("IDLE")}
          disabled={status === "CLICKED" || status === "REBOOTING"}
          className={`
            relative group px-12 py-6 bg-black/80 
            border-2 border-[#00ffea] outline-none
            text-[#00ffea] text-2xl font-black tracking-widest uppercase
            overflow-hidden transition-all duration-100
            shadow-[0_0_15px_rgba(0,255,234,0.3)]
            hover:shadow-[0_0_30px_rgba(0,255,234,0.6),inset_0_0_20px_rgba(0,255,234,0.2)]
            hover:border-[#ff00ff] hover:text-[#ff00ff]
            focus:shadow-[0_0_40px_rgba(255,0,255,0.6)]
            ${status === "CLICKED" ? "animate-[crt-collapse_0.6s_cubic-bezier(0.15,0,1,1)_forwards]" : ""}
          `}
          style={{
            clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)',
          }}
        >
          {/* Background Scanlines */}
          <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-20 z-0"></div>
          
          {/* Moving Laser Scanline */}
          <div className="absolute inset-0 w-full h-[10px] bg-[#00ffea]/50 blur-sm animate-[scanline_2s_linear_infinite] opacity-30 z-0 pointer-events-none"></div>

          {/* Glitch Container */}
          <div className="relative z-10 flex items-center gap-3">
            
            {/* Icon handling with glitch offsets */}
            <div className="relative">
              <Zap className={`w-6 h-6 transition-colors duration-300 ${status === "HOVER" ? "text-[#ff00ff]" : "text-[#00ffea]"}`} />
              {(status === "HOVER" || glitchIndex % 5 === 0) && (
                <>
                  <Zap className="absolute top-0 left-0 w-6 h-6 text-red-500 opacity-70 translate-x-[2px] mix-blend-screen animate-pulse" />
                  <Zap className="absolute top-0 left-0 w-6 h-6 text-blue-500 opacity-70 -translate-x-[2px] mix-blend-screen animate-pulse" />
                </>
              )}
            </div>

            {/* Main Text Container */}
            <div className="relative">
              <span className="relative block">
                {text}
              </span>

              {/* Glitch Layers (Visible on Hover or Random Interval) */}
              {(status === "HOVER" || glitchIndex % 7 === 0) && (
                <>
                  <span 
                    className="absolute top-0 left-0 -ml-[2px] text-[#ff003c] mix-blend-screen opacity-70 glitch-layer-1" 
                    aria-hidden="true"
                  >
                    {text}
                  </span>
                  <span 
                    className="absolute top-0 left-0 ml-[2px] text-[#00e1ff] mix-blend-screen opacity-70 glitch-layer-2" 
                    aria-hidden="true"
                  >
                    {text}
                  </span>
                </>
              )}
            </div>
            
            {/* Status Indicator */}
            <div className={`w-2 h-2 rounded-full ${status === "HOVER" ? "bg-[#ff00ff]" : "bg-[#00ffea]"} animate-pulse shadow-[0_0_10px_currentColor]`} />
          </div>

          {/* Corner Decors */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current opacity-50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current opacity-50" />
        
          {/* Hover Fill Effect */}
          <div className={`absolute inset-0 bg-[#ff00ff] transform origin-left transition-transform duration-300 ease-out z-[-1] opacity-10 ${status === "HOVER" ? "scale-x-100" : "scale-x-0"}`} />
        </button>

        {/* Reboot Message (Shows when button is gone) */}
        {status === "REBOOTING" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-64">
             <div className="text-xs text-neutral-500 animate-pulse font-mono mb-2">SYSTEM REBOOT...</div>
             <div className="h-1 w-full bg-neutral-800 overflow-hidden rounded">
               <div className="h-full bg-[#00ffea] animate-[grow_2s_ease-out_forwards]" style={{width: '0%'}} />
             </div>
             <style>{`@keyframes grow { to { width: 100%; } }`}</style>
          </div>
        )}
      </div>

      {/* Decorative environment elements */}
      <div className="absolute bottom-4 right-4 text-[10px] text-[#00ffea]/40 font-mono">
        <div className="flex flex-col items-end gap-1">
           <span>SECURE_CONN_EST</span>
           <span>V.2.0.44 [STABLE]</span>
           <span className="flex items-center gap-1">
             <Power size={10} /> PWR: ACTIVE
           </span>
        </div>
      </div>

      <div className="absolute top-4 left-4 text-[10px] text-[#ff00ff]/40 font-mono">
        <div className="flex flex-col items-start gap-1">
           <span className="flex items-center gap-1">
             <Terminal size={10} /> NET_TRACE
           </span>
           <span>PKT_LOSS: 0%</span>
        </div>
      </div>

    </div>
  );
};

export default GeneratedComponent;