const GeneratedComponent = () => {
  const { ArrowRight, Zap, Sparkles } = React.useMemo(() => {
    // Mocking LucideReact if not available in environment, otherwise destructure
    return (typeof window !== 'undefined' && window.LucideReact) ? window.LucideReact : { ArrowRight: () => null, Zap: () => null, Sparkles: () => null };
  }, []);

  const [mounted, setMounted] = React.useState(false);
  const [launching, setLaunching] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  
  const buttonRef = React.useRef(null);
  const textRef = React.useRef(null);
  
  // Physics state
  const mouse = React.useRef({ x: 0, y: 0 });
  const buttonPos = React.useRef({ x: 0, y: 0 });
  const textPos = React.useRef({ x: 0, y: 0 });
  
  // Animation loop ref
  const rafId = React.useRef(null);

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const lerp = (start, end, factor) => start + (end - start) * factor;

  // The Physics Loop
  const animate = React.useCallback(() => {
    if (!buttonRef.current || !textRef.current) return;

    // Smoothly interpolate current position to target mouse position
    // We use different lerp factors for button and text to create a parallax/elastic feel
    buttonPos.current.x = lerp(buttonPos.current.x, mouse.current.x, 0.15);
    buttonPos.current.y = lerp(buttonPos.current.y, mouse.current.y, 0.15);
    
    textPos.current.x = lerp(textPos.current.x, mouse.current.x, 0.08); // Text lags behind slightly
    textPos.current.y = lerp(textPos.current.y, mouse.current.y, 0.08);

    const btnX = buttonPos.current.x;
    const btnY = buttonPos.current.y;
    
    // Calculate stretch/skew based on velocity/distance
    const skewX = (btnX - mouse.current.x) * 0.1;
    const skewY = (btnY - mouse.current.y) * 0.1;

    // Apply transforms
    // Note: We only apply physics if NOT launching to avoid conflict with exit animation
    if (!launching && !resetting) {
      buttonRef.current.style.transform = `
        translate3d(${btnX}px, ${btnY}px, 0) 
        skew(${skewX}deg, ${skewY}deg)
        scale(${1 + Math.abs(btnX/1000)})
      `;
      
      textRef.current.style.transform = `
        translate3d(${textPos.current.x * 0.5}px, ${textPos.current.y * 0.5}px, 0)
      `;
    }

    rafId.current = requestAnimationFrame(animate);
  }, [launching, resetting]);

  React.useEffect(() => {
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [animate]);

  const handleMouseMove = (e) => {
    if (launching || resetting) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    mouse.current = { x, y };
  };

  const handleMouseLeave = () => {
    if (launching || resetting) return;
    mouse.current = { x: 0, y: 0 };
  };

  const handleClick = () => {
    if (launching || resetting) return;
    
    setLaunching(true);

    // Sequence: 
    // 1. Anticipation (css handles this via 'launching' state)
    // 2. Fly away (timeout)
    // 3. Reset (timeout)
    
    setTimeout(() => {
      // After fly away, reset silently
      setResetting(true);
      setLaunching(false);
      setMounted(false); // Hide
      
      mouse.current = { x: 0, y: 0 };
      buttonPos.current = { x: 0, y: 0 };
      textPos.current = { x: 0, y: 0 };

      // Bring it back
      setTimeout(() => {
        setResetting(false);
        setMounted(true);
      }, 800);
      
    }, 800); // Duration of the launch animation
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] w-full bg-[#09090b] relative overflow-hidden font-sans p-8">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Button Wrapper */}
      <div 
        className="relative z-10 perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <button
          ref={buttonRef}
          onClick={handleClick}
          disabled={launching || !mounted}
          className={`
            relative group flex items-center justify-center gap-3 
            px-12 py-5 rounded-full 
            bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
            text-white font-bold text-lg tracking-wider uppercase
            shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]
            border border-white/10
            cursor-pointer select-none outline-none
            will-change-transform
            ${!mounted ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
            ${launching ? 'transition-all duration-700 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]' : 'transition-opacity duration-700'}
            ${launching ? 'translate-x-[200vw] scale-x-125 skew-x-12 opacity-0' : ''}
            /* The anticipation phase before launch is handled by a keyframe or initial transition step if we had separate states, 
               but here we use the bezier overshoot in the transition-all to simulate pull-back then shoot */
          `}
          style={{
            // Overriding transition for the physics loop when not launching
            transition: launching || !mounted ? undefined : 'none', 
          }}
        >
          {/* Shine effect overlay */}
          <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          </div>

          {/* Inner Glow */}
          <div className="absolute inset-[1px] rounded-full bg-black/20 backdrop-blur-[2px] pointer-events-none" />
          
          {/* Content Wrapper for Parallax */}
          <span 
            ref={textRef} 
            className="relative flex items-center gap-2 z-10 pointer-events-none"
            style={{ transition: launching ? 'none' : 'none' }}
          >
            {/* Staggered Text Entrance */}
            <span className="flex overflow-hidden">
              {"Get Started".split("").map((char, i) => (
                <span
                  key={i}
                  className={`inline-block whitespace-pre transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
                  style={{
                    transform: mounted ? 'translateY(0)' : 'translateY(150%)',
                    transitionDelay: `${100 + i * 30}ms`
                  }}
                >
                  {char}
                </span>
              ))}
            </span>

            {/* Icon Animation */}
            <span 
              className={`
                transition-all duration-500 delay-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-0'}
              `}
            >
               {launching ? <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </span>
          </span>

          {/* Click Ripple/Burst Effect (Purely Visual) */}
          {launching && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-full h-full rounded-full bg-white animate-ping opacity-30"></span>
            </span>
          )}
        </button>

        {/* Trail particles (Simulated) */}
        {launching && (
           <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 pointer-events-none z-0">
             <div className="w-20 h-1 bg-white/50 blur-sm absolute right-full animate-pulse transform translate-x-full transition-all duration-300" />
           </div>
        )}
      </div>

      {/* Instructions / Status */}
      <div className="absolute bottom-8 text-white/30 text-xs tracking-widest uppercase font-medium">
        {launching ? "Launching..." : "Hover & Pull • Click to Launch"}
      </div>
    </div>
  );
};

export default GeneratedComponent;