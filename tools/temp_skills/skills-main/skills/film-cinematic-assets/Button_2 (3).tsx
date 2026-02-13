const GeneratedComponent = () => {
  const { ArrowRight, Zap, Sparkles, Command } = LucideReact;
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [clicking, setClicking] = React.useState(false);
  const buttonRef = React.useRef(null);

  React.useEffect(() => {
    // Trigger entrance animation on mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (e) => {
    // Optional: Ripple or immediate feedback could go here
    setClicking(true);
    
    // Reset after animation (mocking a submission or navigation)
    setTimeout(() => {
      setClicking(false);
      setMounted(false);
      setTimeout(() => setMounted(true), 100); // Re-play entrance for demo purposes
    }, 2000);
  };

  // Elastic bezier for premium feel
  const elasticEase = "cubic-bezier(0.34, 1.56, 0.64, 1)";
  const smoothEase = "cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] overflow-hidden perspective-1000">
      
      {/* Ambient Background Glows */}
      <div 
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      {/* Grid Background Effect */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      />

      {/* Main Interactive Button Component */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative group outline-none focus:outline-none z-10"
        style={{
          willChange: 'transform',
        }}
      >
        {/* Container for the Bento Parts - Handles the Exit Animation */}
        <div 
          className={`flex items-center gap-3 transition-all duration-700 ${smoothEase}`}
          style={{
            transform: clicking ? 'scale(0.1) rotate(15deg) translateY(20px)' : 'scale(1) rotate(0deg)',
            opacity: clicking ? 0 : 1,
            filter: clicking ? 'blur(10px)' : 'blur(0px)',
          }}
        >

          {/* PART 1: The Icon Block (Left) */}
          <div 
            className="relative"
            style={{
              transition: `all 800ms ${elasticEase}`,
              transform: mounted ? 'translateX(0) rotate(0)' : 'translateX(-100px) rotate(-45deg)',
              opacity: mounted ? 1 : 0,
              transitionDelay: '100ms'
            }}
          >
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              bg-gradient-to-br from-white/10 to-white/5 
              border border-white/10 backdrop-blur-xl
              shadow-[0_8px_32px_rgba(0,0,0,0.3)]
              transition-all duration-300
              ${hovered ? 'scale-105 border-white/30 bg-white/15' : 'scale-100'}
            `}>
              <Zap 
                className={`w-6 h-6 text-yellow-300 transition-all duration-300 ${hovered ? 'scale-110 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]' : ''}`} 
                fill={hovered ? "currentColor" : "none"}
              />
            </div>
            {/* Connection Line decoration */}
            <div className={`absolute top-1/2 -right-3 w-3 h-[2px] bg-white/20 transition-all duration-500 ${mounted ? 'scale-x-100' : 'scale-x-0'}`} style={{ transformOrigin: 'left' }} />
          </div>

          {/* PART 2: The Main Text Block (Center) */}
          <div 
            className="relative"
            style={{
              transition: `all 800ms ${elasticEase}`,
              transform: mounted ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.8)',
              opacity: mounted ? 1 : 0,
              transitionDelay: '200ms'
            }}
          >
            <div className={`
              h-14 px-8 rounded-2xl flex items-center gap-3
              bg-gradient-to-br from-white/10 to-white/5 
              border border-white/10 backdrop-blur-xl
              shadow-[0_8px_32px_rgba(0,0,0,0.3)]
              overflow-hidden relative
              transition-all duration-300
              ${hovered ? 'translate-y-[-2px] border-white/30 bg-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.4)]' : ''}
            `}>
              {/* Shimmer Effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000 ease-in-out ${hovered ? 'translate-x-full' : ''}`} 
              />
              
              <div className="flex flex-col items-start justify-center">
                <span className="text-xs font-medium text-blue-300 tracking-wider uppercase opacity-80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> New V2.0
                </span>
                <span className="text-lg font-bold text-white tracking-tight drop-shadow-md">
                  Get Started
                </span>
              </div>
            </div>
          </div>

          {/* PART 3: The Action Block (Right) */}
          <div 
            className="relative"
            style={{
              transition: `all 800ms ${elasticEase}`,
              transform: mounted ? 'translateX(0) rotate(0)' : 'translateX(100px) rotate(45deg)',
              opacity: mounted ? 1 : 0,
              transitionDelay: '300ms'
            }}
          >
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              bg-gradient-to-br from-blue-500/20 to-purple-500/20
              border border-white/10 backdrop-blur-xl
              shadow-[0_8px_32px_rgba(0,0,0,0.3)]
              transition-all duration-300 group-hover:border-white/40
              ${hovered ? 'scale-105 rotate-3 bg-blue-500/30' : 'scale-100'}
            `}>
              <ArrowRight 
                className={`w-6 h-6 text-white transition-transform duration-300 ${hovered ? 'translate-x-1' : ''}`} 
              />
            </div>
             {/* Connection Line decoration */}
             <div className={`absolute top-1/2 -left-3 w-3 h-[2px] bg-white/20 transition-all duration-500 ${mounted ? 'scale-x-100' : 'scale-x-0'}`} style={{ transformOrigin: 'right' }} />
          </div>

        </div>

        {/* Hover Glow Behind the Assembly */}
        <div 
          className={`
            absolute inset-0 -z-10 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 blur-2xl transition-opacity duration-500
            ${hovered && !clicking ? 'opacity-30' : 'opacity-0'}
          `}
        />
      </button>

      {/* Success/Post-Click feedback (Center Implosion) */}
      <div className={`absolute pointer-events-none transition-all duration-500 ${clicking ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}>
        <div className="w-4 h-4 bg-white rounded-full animate-ping" />
        <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full blur-sm" />
      </div>

    </div>
  );
};
export default GeneratedComponent;