const GeneratedComponent = () => {
  const buttonRef = React.useRef(null);
  const liquidRef = React.useRef(null);
  const textRef = React.useRef(null);
  
  // State for scroll-based separation
  const [scrollSplit, setScrollSplit] = React.useState(0);
  // State for hover active
  const [isHovered, setIsHovered] = React.useState(false);

  // Physics state
  const physics = React.useRef({
    x: 0,
    y: 0,
    velX: 0,
    velY: 0,
    targetX: 0,
    targetY: 0,
    distortion: 0,
    targetDistortion: 0
  });

  // Scroll listener for the "Slide in from sides" effect
  React.useEffect(() => {
    const handleScroll = () => {
      // Calculate split based on scroll position. 
      // We use a sine wave or clamped value to make it breathe with scroll
      const scrollY = window.scrollY;
      // Parallax effect: Text splits apart as you scroll down
      const splitAmount = Math.min(scrollY * 0.2, 50); 
      setScrollSplit(splitAmount);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse move handler for magnetic effect + distortion
  const handleMouseMove = React.useCallback((e) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Magnetic pull strength
    const pullStrength = 0.4; 
    
    physics.current.targetX = mouseX * pullStrength;
    physics.current.targetY = mouseY * pullStrength;
    
    // Calculate velocity for distortion intensity
    // The faster the mouse moves, the more distortion we apply
    const speed = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2));
    physics.current.targetDistortion = Math.min(speed * 3, 60); // Cap distortion
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    physics.current.targetX = 0;
    physics.current.targetY = 0;
    physics.current.targetDistortion = 0;
  };

  // Animation Loop
  React.useEffect(() => {
    let animationFrameId;

    const loop = () => {
      // Smooth interpolation factors
      const spring = 0.1;
      const friction = 0.85;
      const distortionEase = 0.1;

      const p = physics.current;

      // Spring physics for position
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;

      p.velX += dx * spring;
      p.velY += dy * spring;
      
      p.velX *= friction;
      p.velY *= friction;

      p.x += p.velX;
      p.y += p.velY;

      // Linear interpolation for distortion (smoother/slower decay)
      p.distortion += (p.targetDistortion - p.distortion) * distortionEase;
      
      // Decay target distortion automatically if mouse stops moving but stays hovering
      p.targetDistortion *= 0.9;

      // Apply transforms
      if (buttonRef.current && textRef.current) {
        // Button body moves with magnetic effect
        buttonRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${isHovered ? 1.05 : 1})`;
        
        // Text moves slightly more for parallax depth
        textRef.current.style.transform = `translate3d(${p.x * 0.5}px, ${p.y * 0.5}px, 0)`;
      }

      // Apply SVG filter distortion
      if (liquidRef.current) {
        // We update the 'scale' attribute of the feDisplacementMap
        // This creates the liquid warping effect
        liquidRef.current.scale.baseVal = p.distortion;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered]);

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        // Ripple effect or just a simple active bump handled by CSS
        // Adding a burst of distortion on click
        physics.current.targetDistortion = 100;
        // Add visual feedback
        const ripple = document.createElement('div');
        ripple.className = 'absolute inset-0 bg-white opacity-30 rounded-full animate-ping';
        e.currentTarget.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
      }}
      className="
        relative group cursor-pointer
        px-12 py-6 
        bg-black
        rounded-full 
        border border-white/10
        shadow-[0_0_50px_-10px_rgba(120,119,255,0.3)]
        hover:shadow-[0_0_80px_-10px_rgba(120,119,255,0.6)]
        transition-shadow duration-500 ease-out
        overflow-hidden
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-4 focus:ring-offset-black
        active:scale-95
      "
      style={{
        willChange: 'transform',
        // We apply the SVG filter here. 
        // Note: Filters can be expensive. We only apply it heavily if needed.
        // For performance, sometimes it's better to toggle, but for smoothness we keep it.
        filter: 'url(#liquidFilter)',
        WebkitFontSmoothing: 'antialiased'
      }}
    >
      {/* Background Gradients & Noise */}
      <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-20 blur-xl scale-110" />
      </div>
      
      {/* Subtle border shine */}
      <div className="absolute inset-0 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* The Text Container */}
      <div 
        ref={textRef}
        className="relative z-10 flex items-center justify-center gap-2 text-xl font-bold tracking-wider text-white mix-blend-overlay"
      >
        {/* Left Part: "Get" - Moves Left on Scroll */}
        <span 
          className="inline-block transition-transform duration-100 ease-linear will-change-transform"
          style={{ transform: `translateX(-${scrollSplit}px)` }}
        >
          GET
        </span>
        
        {/* Icon: Stays center or warps */}
        <span className="mx-1 text-indigo-400 group-hover:text-white transition-colors duration-300">
          {/* Simple Chevron or Arrow using SVG to avoid heavy icon lib dep if strictly standalone, 
              but using Lucide as per rules is allowed. I'll stick to a pure SVG for zero-dep robustness here. */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </span>

        {/* Right Part: "Started" - Moves Right on Scroll */}
        <span 
          className="inline-block transition-transform duration-100 ease-linear will-change-transform"
          style={{ transform: `translateX(${scrollSplit}px)` }}
        >
          STARTED
        </span>
      </div>

      {/* SVG Filter Definition (Hidden but active) */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="liquidFilter">
            {/* Turbulence creates the noise map */}
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.01 0.01" 
              numOctaves="2" 
              result="warpNoise" 
            >
              {/* We can animate baseFrequency for a 'boiling' effect if desired, 
                  but static noise moved by displacement is usually enough for liquid feels */}
              <animate 
                attributeName="baseFrequency" 
                dur="10s" 
                values="0.01 0.01;0.02 0.05;0.01 0.01" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            
            {/* Displacement Map uses the noise to shift pixels of the SourceGraphic */}
            <feDisplacementMap 
              ref={liquidRef}
              in="SourceGraphic" 
              in2="warpNoise" 
              scale="0" /* Starts at 0, updated by JS */
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
            
            {/* Composite to clean up edges if needed, though usually fine without for buttons */}
          </filter>
        </defs>
      </svg>
      
      {/* Entrance Animation Trigger (Hidden element to trigger animations on mount if needed) */}
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        button {
          animation: fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </button>
  );
};

export default GeneratedComponent;