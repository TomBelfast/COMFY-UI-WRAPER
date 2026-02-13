const GeneratedComponent = () => {
  const [text, setText] = React.useState('');
  const [phase, setPhase] = React.useState('initial'); // initial, decoding, idle, clicking, collapsed
  const [glitchActive, setGlitchActive] = React.useState(false);
  const containerRef = React.useRef(null);
  
  // Lucide Icons
  const { Zap, Terminal, ChevronRight } = window.LucideReact || { 
    Zap: () => null, 
    Terminal: () => null, 
    ChevronRight: () => null 
  };

  const TARGET_TEXT = "GET STARTED";
  const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*<>?[]{}";

  // Decode Animation Effect
  React.useEffect(() => {
    let interval;
    let timeout;

    const startDecode = () => {
      setPhase('decoding');
      let iteration = 0;
      
      interval = setInterval(() => {
        setText(prev => 
          TARGET_TEXT.split("")
            .map((letter, index) => {
              if (index < iteration) {
                return TARGET_TEXT[index];
              }
              return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            })
            .join("")
        );

        if (iteration >= TARGET_TEXT.length) {
          clearInterval(interval);
          setPhase('idle');
        }

        iteration += 1 / 3; // Slow down the character locking for effect
      }, 30);
    };

    // Initial delay before start
    timeout = setTimeout(startDecode, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase === 'initial' || phase === 'rebooting']);

  // CRT Collapse Handler
  const handleClick = () => {
    if (phase !== 'idle') return;
    setPhase('clicking');
    
    // Simulate action delay then collapse
    setTimeout(() => {
      setPhase('collapsed');
      
      // Auto reboot for demo purposes
      setTimeout(() => {
        setText('');
        setPhase('rebooting');
        // Small hack to trigger the effect dependency again if needed, 
        // but changing phase to rebooting -> initial inside effect might be cleaner.
        // Here we just let the effect dependency array handle the restart.
        setTimeout(() => setPhase('initial'), 100); 
      }, 2500);
    }, 600);
  };

  // Glitch Jitters on Hover
  const handleHover = () => {
    if (phase === 'idle') setGlitchActive(true);
  };
  
  const handleLeave = () => {
    setGlitchActive(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#050505] overflow-hidden font-mono relative">
      
      {/* Background Grid & Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,243,255,0.05),transparent_70%)] z-0" />

      {/* Styles for Animations */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes clipGlitch {
          0% { clip-path: inset(40% 0 61% 0); transform: translate(-2px, 2px); }
          20% { clip-path: inset(92% 0 1% 0); transform: translate(0); }
          40% { clip-path: inset(43% 0 1% 0); transform: translate(2px, -2px); }
          60% { clip-path: inset(25% 0 58% 0); transform: translate(2px, 2px); }
          80% { clip-path: inset(54% 0 7% 0); transform: translate(-2px, -2px); }
          100% { clip-path: inset(58% 0 43% 0); transform: translate(0); }
        }
        @keyframes crtOff {
          0% { transform: scale(1, 1); filter: brightness(1); opacity: 1; }
          40% { transform: scale(1, 0.005); filter: brightness(5); opacity: 1; }
          60% { transform: scale(1, 0.005); filter: brightness(5); opacity: 1; }
          100% { transform: scale(0, 0); filter: brightness(0); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(0, 243, 255, 0.5), inset 0 0 5px rgba(0, 243, 255, 0.2); }
          50% { box-shadow: 0 0 25px rgba(0, 243, 255, 0.8), inset 0 0 10px rgba(0, 243, 255, 0.4); }
        }
        .glitch-layer::before, .glitch-layer::after {
          content: "${TARGET_TEXT}";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #050505; 
        }
        .glitch-layer::before {
          left: 2px;
          text-shadow: -1px 0 #ff00ff;
          clip-path: inset(40% 0 61% 0);
          animation: clipGlitch 2s infinite linear alternate-reverse;
        }
        .glitch-layer::after {
          left: -2px;
          text-shadow: -1px 0 #00f3ff;
          clip-path: inset(92% 0 1% 0);
          animation: clipGlitch 2s infinite linear alternate-reverse;
          animation-delay: -1s;
        }
      `}</style>

      {/* Main Button Container */}
      <div 
        ref={containerRef}
        className={`relative group z-10 transition-all duration-300 ease-out`}
        style={{
           animation: phase === 'clicking' ? 'crtOff 0.6s cubic-bezier(0.8, 0, 0.2, 1) forwards' : 'none',
           opacity: phase === 'collapsed' ? 0 : 1
        }}
      >
        <button
          onClick={handleClick}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
          disabled={phase !== 'idle'}
          className={`
            relative px-12 py-6 
            bg-[#0a0a0a] 
            border border-cyan-500/50 
            text-cyan-400 
            font-bold text-xl tracking-widest 
            uppercase 
            outline-none 
            overflow-hidden
            transition-all duration-200
            will-change-transform
            cursor-pointer
            ${phase === 'idle' ? 'hover:scale-105 active:scale-95 hover:border-cyan-400' : ''}
            ${phase === 'idle' ? 'hover:shadow-[0_0_30px_rgba(0,243,255,0.6)]' : 'shadow-[0_0_15px_rgba(0,243,255,0.2)]'}
          `}
          style={{
            clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)'
          }}
        >
          {/* Animated Background Scanline */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent pointer-events-none opacity-30 animate-[scanline_3s_linear_infinite]" />
          
          {/* Corner Decors */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-500" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-500" />
          
          {/* Content Wrapper */}
          <div className="relative z-10 flex items-center gap-3">
            <span className={`${phase === 'decoding' ? 'animate-pulse' : ''}`}>
              {phase === 'initial' || phase === 'rebooting' ? '' : (
                <Terminal size={20} className="text-pink-500 inline-block mr-2 mb-1" strokeWidth={3} />
              )}
            </span>

            {/* Main Text */}
            <span className="relative inline-block min-w-[140px] text-center">
               {text}
               {/* Blinking Cursor during decode */}
               {(phase === 'decoding' || phase === 'initial') && (
                 <span className="animate-pulse bg-cyan-400 w-3 h-5 inline-block align-middle ml-1"></span>
               )}
            </span>

            {/* Hover Glitch Text Layer (Only visible on hover) */}
            {glitchActive && phase === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-70 mix-blend-screen glitch-layer">
                 {/* The before/after pseudos handle the glitch content via CSS */}
              </div>
            )}

            <ChevronRight 
              size={20} 
              className={`transition-all duration-300 ${glitchActive ? 'translate-x-1 opacity-100 text-pink-500' : 'opacity-0 -translate-x-2'}`} 
            />
          </div>

          {/* Bottom decorative tiny text */}
          <div className="absolute bottom-1 right-3 text-[0.5rem] text-cyan-700/80 font-normal tracking-tighter">
            V.2.0.77 :: SYS_READY
          </div>
        </button>

        {/* Outer Glow / Decor Lines */}
        <div className={`
            absolute -inset-1 -z-10 bg-gradient-to-r from-cyan-600 to-pink-600 opacity-20 blur-md transition-opacity duration-300
            ${glitchActive ? 'opacity-60' : 'opacity-20'}
        `} />
      </div>

      {/* Rebooting Message */}
      {phase === 'collapsed' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-900 text-sm font-mono animate-pulse">
          SYSTEM REBOOT...
        </div>
      )}

    </div>
  );
};

export default GeneratedComponent;