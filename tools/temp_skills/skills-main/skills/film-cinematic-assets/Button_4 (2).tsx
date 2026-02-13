const GeneratedComponent = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const buttonRef = React.useRef(null);
  const textRef = React.useRef(null);
  
  // Refs for SVG filter manipulation
  const turbulenceRef = React.useRef(null);
  const displacementRef = React.useRef(null);
  
  // Animation loop refs
  const requestRef = React.useRef();
  const timeRef = React.useRef(0);
  
  // State for scroll simulation
  const [scrollY, setScrollY] = React.useState(0);

  // Constants
  const TARGET_FREQ_X = 0.005;
  const TARGET_FREQ_Y = 0.05; // Stretching vertically
  const HOVER_SCALE = 60;
  const IDLE_SCALE = 0;
  
  // Lerp helper
  const lerp = (start, end, t) => start * (1 - t) + end * t;
  
  // Current values for smooth animation
  const animState = React.useRef({
    freqX: 0.02,
    freqY: 0.02,
    scale: 0,
    textOffset: 100, // For entrance
    opacity: 0
  });

  // Handle Scroll (Parallax effect on text)
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Simulate an entrance animation
    setTimeout(() => setMounted(true), 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation Loop
  const animate = React.useCallback(() => {
    timeRef.current += 0.05;

    // Determine targets
    const targetScale = isHovered ? HOVER_SCALE : (isClicked ? 100 : IDLE_SCALE);
    const targetFreqX = isHovered ? 0.02 : 0.001;
    const targetFreqY = isHovered ? 0.05 : 0.001;
    
    // Smoothly interpolate values
    animState.current.scale = lerp(animState.current.scale, targetScale, 0.1);
    animState.current.freqX = lerp(animState.current.freqX, targetFreqX, 0.05);
    animState.current.freqY = lerp(animState.current.freqY, targetFreqY, 0.05);
    
    // Entrance animation logic
    const targetTextOffset = mounted ? 0 : 100;
    const targetOpacity = mounted ? 1 : 0;
    animState.current.textOffset = lerp(animState.current.textOffset, targetTextOffset, 0.08);
    animState.current.opacity = lerp(animState.current.opacity, targetOpacity, 0.05);

    // Apply to SVG Filter
    if (turbulenceRef.current && displacementRef.current) {
      // We animate baseFrequency to create the "flow"
      // Adding timeRef creates the continuous liquid motion
      const flowX = animState.current.freqX + Math.sin(timeRef.current * 0.5) * 0.005;
      const flowY = animState.current.freqY + Math.cos(timeRef.current * 0.5) * 0.005;
      
      turbulenceRef.current.setAttribute('baseFrequency', `${flowX} ${flowY}`);
      displacementRef.current.setAttribute('scale', animState.current.scale);
    }

    // Apply entrance transform to text container
    if (textRef.current) {
      // Parallax effect: Moving text slightly based on scroll + entrance offset
      const parallax = scrollY * 0.2; 
      const totalOffset = animState.current.textOffset; // + parallax if we had a scrollable page
      
      textRef.current.style.transform = `translate3d(${totalOffset}px, 0, 0)`;
      textRef.current.style.opacity = animState.current.opacity;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [isHovered, isClicked, mounted, scrollY]);

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Click Handler
  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
  };

  // Generate unique filter ID
  const filterId = "liquid-warp-filter";

  return (
    <div className="min-h-[400px] w-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden relative font-sans">
      
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* SVG Filters Definition (Hidden) */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence 
              ref={turbulenceRef}
              type="fractalNoise" 
              baseFrequency="0.02 0.02" 
              numOctaves="3" 
              result="noise" 
            />
            <feDisplacementMap 
              ref={displacementRef}
              in="SourceGraphic" 
              in2="noise" 
              scale="0" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      {/* The Button */}
      <button
        ref={buttonRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={handleClick}
        className={`
          group relative isolate
          px-16 py-8
          rounded-full
          bg-transparent
          border-2 border-white/10
          overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          hover:border-transparent
          active:scale-95
          focus:outline-none focus:ring-4 focus:ring-purple-500/50
          cursor-none
        `}
      >
        {/* Animated Background Gradient (Reveals on Hover) */}
        <div 
          className={`
            absolute inset-0 -z-10
            bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
            transition-opacity duration-500 ease-out
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        />
        
        {/* Dark Background (Default) */}
        <div 
          className={`
            absolute inset-0 -z-20 bg-neutral-900
            transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
            ${isHovered ? 'scale-110' : 'scale-100'}
          `} 
        />

        {/* Text Container with Filter */}
        <div 
          ref={textRef}
          className="relative z-10 will-change-transform"
        >
          <span 
            className="block text-4xl font-black tracking-widest text-white uppercase mix-blend-overlay md:text-5xl"
            style={{ 
              filter: `url(#${filterId})`,
              textShadow: isHovered ? '0 0 20px rgba(255,255,255,0.5)' : 'none'
            }}
          >
            Click Me
          </span>
          
          {/* Duplicate text for 'glitch' effect layers without filter for readability if needed, 
              but here we want full distortion. 
              Let's add a subtle stroke version behind it. */}
           <span 
            className="absolute inset-0 block text-4xl font-black tracking-widest text-transparent uppercase stroke-2 md:text-5xl opacity-30 pointer-events-none"
            style={{ 
               WebkitTextStroke: '1px white',
               transform: 'translate(4px, 4px)',
               filter: 'blur(2px)'
            }}
          >
            Click Me
          </span>
        </div>

        {/* Custom Cursor Follower within Button context (Optional enhancement for 'Interaction') */}
        <div 
          className={`
            absolute w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none -z-10
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

      </button>

      {/* Instructions / Flavor Text */}
      <div className="absolute bottom-10 text-white/30 text-xs tracking-[0.3em] uppercase animate-pulse">
        Scroll / Hover to Warp
      </div>
    </div>
  );
};

export default GeneratedComponent;