const GeneratedComponent = () => {
  const [text, setText] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // 'idle' | 'clicked' | 'collapsed'
  const originalText = "SYSTEM_BREACH";
  const { Zap, Terminal, Activity } = window.LucideReact || { Zap: () => null, Terminal: () => null, Activity: () => null };
  const buttonRef = React.useRef(null);
  
  // Audio context ref for future expansion (visual only requested, but logic ready)
  const frameRef = React.useRef(0);

  // Decode Effect on Mount
  React.useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;':,./<>?";
    let iteration = 0;
    
    const interval = setInterval(() => {
      setText(prev => 
        originalText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      
      if (iteration >= originalText.length) {
        clearInterval(interval);
        setText(originalText);
      }
      
      iteration += 1 / 2; // Speed of decode
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Handle Interaction
  const handleClick = () => {
    if (status !== 'idle') return;
    setStatus('clicked');

    // Sequence: 
    // 1. Initial Glitch/Freeze (0-200ms)
    // 2. CRT Power Down Animation (200ms+)
    // 3. Reset after animation for demo purposes (2500ms)
    
    setTimeout(() => {
      setStatus('collapsed');
      setTimeout(() => {
        // Reset for replayability
        setStatus('idle');
        // Re-trigger decode effect logic could go here if desired
      }, 2000);
    }, 600);
  };

  // Dynamic Styles for Glitch/CRT
  const getButtonClasses = () => {
    const base = "relative group overflow-hidden px-10 py-4 bg-black/80 text-cyan-400 font-mono font-bold tracking-wider uppercase border-2 border-cyan-500/50 outline-none transition-all duration-100 ease-out";
    
    if (status === 'clicked') {
      return `${base} animate-glitch-intense scale-105 contrast-150 brightness-150`;
    }
    
    if (status === 'collapsed') {
      return `${base} animate-crt-power-off pointer-events-none opacity-0`;
    }

    return `${base} hover:bg-cyan-900/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:text-cyan-200`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] p-8 overflow-hidden relative">
      {/* Background Grid & Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_50%)] animate-pulse-slow pointer-events-none" />

      {/* CSS Injection for complex keyframes */}
      <style>{`
        @keyframes glitch-anim-1 {
          0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
          20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
          40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
          80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
          100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); }
        }
        @keyframes glitch-anim-2 {
          0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
          20% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 2px); }
          40% { clip-path: inset(30% 0 20% 0); transform: translate(2px, 1px); }
          60% { clip-path: inset(10% 0 80% 0); transform: translate(-1px, -2px); }
          80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, 2px); }
          100% { clip-path: inset(20% 0 70% 0); transform: translate(-2px, 1px); }
        }
        @keyframes crt-off {
          0% { transform: scale(1, 1); filter: brightness(1) opacity(1); }
          40% { transform: scale(1, 0.005); filter: brightness(5) opacity(1); }
          70% { transform: scale(0, 0.005); filter: brightness(10) opacity(1); }
          100% { transform: scale(0, 0); filter: brightness(0) opacity(0); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        .animate-glitch-intense {
          animation: glitch-anim-1 0.2s infinite linear alternate-reverse;
        }
        .animate-crt-power-off {
          animation: crt-off 0.5s cubic-bezier(0.7, 0, 1, 1) forwards;
        }
        
        /* Glitch Hover Effects */
        .cyber-glitch:hover::before {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: #050505; /* match button bg */
          color: #f0f;
          clip-path: inset(0 0 0 0);
          animation: glitch-anim-1 0.4s infinite linear alternate-reverse;
          opacity: 0.7;
          mix-blend-mode: hard-light;
          z-index: -1;
        }
        .cyber-glitch:hover::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: #050505;
          color: #0ff;
          clip-path: inset(0 0 0 0);
          animation: glitch-anim-2 0.4s infinite linear alternate-reverse;
          opacity: 0.7;
          mix-blend-mode: hard-light;
          z-index: -1;
        }
      `}</style>

      {/* Main Interactive Component */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        data-text={text}
        className={`
          cyber-glitch
          ${getButtonClasses()}
        `}
      >
        {/* Button Content */}
        <div className="relative z-10 flex items-center justify-center gap-3">
          <Terminal size={18} className={`transition-opacity duration-300 ${status === 'idle' ? 'opacity-100' : 'opacity-50'}`} />
          <span className="text-xl tracking-[0.2em]">{text}</span>
          <Activity size={18} className={`transition-opacity duration-300 ${status === 'idle' ? 'opacity-100' : 'opacity-50'}`} />
        </div>

        {/* Decorative Borders/Corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 opacity-50 transition-all duration-300 group-hover:w-full group-hover:h-full group-hover:opacity-100"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 opacity-50 transition-all duration-300 group-hover:w-full group-hover:h-full group-hover:opacity-100"></div>
        
        {/* Scanline Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent w-full h-1/3 animate-[scanline_3s_linear_infinite] pointer-events-none opacity-0 group-hover:opacity-100" />
        
        {/* Status Indicator */}
        <div className="absolute right-2 top-2 flex gap-0.5">
          <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping" />
        </div>
      </button>

      {/* Post-Collapse Message (To indicate cycle completion) */}
      <div 
        className={`absolute mt-32 font-mono text-xs text-cyan-900 transition-opacity duration-1000 ${status === 'collapsed' ? 'opacity-100' : 'opacity-0'}`}
      >
        Signal lost... Reconnecting...
      </div>
    </div>
  );
};

export default GeneratedComponent;