const GeneratedComponent = () => {
  const [phase, setPhase] = React.useState('initial'); // initial, forming, active, melting
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const cardRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const { Droplets, Sparkles, ArrowRight, Fingerprint } = LucideReact;

  // Animation triggers
  React.useEffect(() => {
    // Sequence:
    // 0ms: Initial (scattered blobs)
    // 100ms: Start converging
    // 800ms: Formed into card
    // 1000ms: Active state (content fade in)

    const t1 = setTimeout(() => setPhase('forming'), 100);
    const t2 = setTimeout(() => setPhase('active'), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleMouseMove = React.useCallback((e) => {
    if (phase !== 'active' || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
  }, [phase]);

  const handleCardClick = () => {
    if (phase === 'active') {
      setPhase('melting');
      // Reset after animation for demo purposes (optional, but good for UX testing)
      setTimeout(() => {
        window.location.reload(); // Simple reload to restart the demo
      }, 2000);
    }
  };

  // Dynamic Styles based on phase
  const getBlobStyle = (idx) => {
    // Starting positions for scatter effect
    const scatterPositions = [
      { x: -150, y: -150 },
      { x: 150, y: -150 },
      { x: -150, y: 150 },
      { x: 150, y: 150 },
      { x: 0, y: -200 },
    ];
    
    const base = "absolute rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 transition-all duration-[1500ms] ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform";

    if (phase === 'initial') {
      return `${base} w-24 h-24 opacity-0 scale-50 translate-x-[${scatterPositions[idx].x}px] translate-y-[${scatterPositions[idx].y}px]`;
    }
    
    if (phase === 'forming') {
      // Converge to center
      return `${base} w-32 h-32 opacity-100 scale-100 translate-x-0 translate-y-0`;
    }

    if (phase === 'active') {
      // Hidden or merged into the main background shape
      // We keep them centered but slightly oscillating or just hidden behind the main card if we want a clean rect
      // For the liquid effect, let's make them part of the "body"
      return `${base} w-full h-full rounded-2xl opacity-100 inset-0`; 
    }

    if (phase === 'melting') {
      // Fall down
      const delay = idx * 100;
      return `${base} w-20 h-20 translate-y-[400px] opacity-0 scale-50 transition-all duration-1000 ease-in delay-[${delay}ms]`;
    }

    return base;
  };

  // The main background shape needs to be separate to allow the "distorter" blob to interact with it via the filter
  // without blurring the text.
  
  return (
    <div 
      className="relative w-full h-screen bg-neutral-950 flex items-center justify-center overflow-hidden font-sans selection:bg-pink-500 selection:text-white"
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      {/* SVG Filter Definition for the Gooey Effect */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="liquid-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>

      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      {/* The Liquid Container */}
      <div 
        className="relative w-[340px] h-[480px] flex flex-col items-center justify-center cursor-pointer group"
        onClick={handleCardClick}
        style={{ filter: 'url(#liquid-filter)' }} // APPLY FILTER HERE
      >
        {/* 1. The Main Card Body (Liquid Base) */}
        <div 
          ref={cardRef}
          className={`
            absolute transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]
            bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600
            ${phase === 'initial' ? 'w-4 h-4 rounded-full opacity-0' : ''}
            ${phase === 'forming' ? 'w-32 h-32 rounded-full opacity-100' : ''}
            ${phase === 'active' ? 'w-full h-full rounded-3xl opacity-100' : ''}
            ${phase === 'melting' ? 'w-24 h-full translate-y-[200px] scale-y-0 opacity-0 rounded-[50%]' : ''}
          `}
        ></div>

        {/* 2. Entrance Blobs (visible during forming, merge into body) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`
              absolute rounded-full bg-fuchsia-500
              transition-all duration-1000 ease-out
              ${phase === 'initial' ? `opacity-0 scale-0 translate-x-[${(i-2)*100}px] translate-y-[${(i-2)*100}px]` : ''}
              ${phase === 'forming' ? `w-20 h-20 opacity-100 scale-100 animate-pulse` : ''}
              ${phase === 'active' ? 'w-0 h-0 opacity-0' : ''}
            `}
            style={{
              // Randomize initial scatter slightly for natural feel
              transform: phase === 'initial' ? `translate(${(Math.random()-0.5)*400}px, ${(Math.random()-0.5)*400}px)` : 
                         phase === 'forming' ? 'translate(0,0)' : undefined
            }}
          ></div>
        ))}

        {/* 3. Mouse Interaction Blob (The "Wave" Maker) */}
        {phase === 'active' && (
          <div 
            className="absolute bg-violet-500 rounded-full w-24 h-24 opacity-80 pointer-events-none transition-transform duration-75 will-change-transform mix-blend-screen"
            style={{
              transform: `translate(${mousePos.x - 170}px, ${mousePos.y - 240}px)`, // Centered relative to container
            }}
          />
        )}

        {/* 4. Melting Droplets (Only appear when melting) */}
        {phase === 'melting' && [1,2,3,4,5].map((i) => (
           <div 
             key={`drop-${i}`}
             className="absolute bg-indigo-600 rounded-full w-12 h-12 animate-bounce"
             style={{
               animation: `ping 1s cubic-bezier(0, 0, 0.2, 1) infinite, drop ${0.5 + Math.random()}s forwards`,
               left: `${20 + Math.random() * 60}%`,
               top: '80%',
             }}
           />
        ))}
      </div>

      {/* CONTENT LAYER (Sits on top of the liquid filter so text is sharp) */}
      <div 
        className={`
          absolute w-[340px] h-[480px] pointer-events-none flex flex-col justify-between p-8 text-white
          transition-all duration-500
          ${phase === 'active' ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-10 blur-sm'}
          ${phase === 'melting' ? '!opacity-0 !translate-y-20 duration-300' : ''}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div className="text-xs font-bold tracking-widest uppercase text-white/60 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
            Liquid UI
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium tracking-wide">
             <Sparkles className="w-4 h-4 text-cyan-300" />
             <span>Interactive Card</span>
          </div>
          <h2 className="text-5xl font-black leading-[0.9] tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
            HOVER<br/>ME.
          </h2>
          <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-[90%]">
            Experience the fluid morphing effect. Move your cursor to distort reality. Click to melt away.
          </p>
        </div>

        {/* Footer / Action */}
        <div className="group/btn relative overflow-hidden rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-300">
           <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-300 ease-out"></div>
           <div className="relative p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-white/60 font-semibold uppercase tracking-wider">Status</span>
                <span className="text-sm font-bold text-white">Active</span>
              </div>
              <div className="bg-white text-indigo-900 p-2 rounded-lg">
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </div>
           </div>
        </div>
      </div>
      
      {/* Instructional Hint */}
      <div className={`
        absolute bottom-10 flex flex-col items-center gap-2 transition-opacity duration-1000
        ${phase === 'active' ? 'opacity-50' : 'opacity-0'}
      `}>
        <Fingerprint className="w-6 h-6 text-white animate-pulse" />
        <span className="text-white text-xs tracking-[0.2em] uppercase">Click to Dematerialize</span>
      </div>

      {/* CSS Animation Keyframes for the 'melt' custom logic if needed, 
          though we used Tailwind arbitrary values mostly. 
          Adding a custom style block for specific drop animations if required.
      */}
      <style jsx>{`
        @keyframes drop {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(400px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default GeneratedComponent;