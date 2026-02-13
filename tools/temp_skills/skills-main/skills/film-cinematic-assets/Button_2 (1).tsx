const GeneratedComponent = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);
  
  const turbulenceRef = React.useRef(null);
  const displacementRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const textRef = React.useRef(null);
  const reqRef = React.useRef(null);
  
  // Animation state values
  const freq = React.useRef({ x: 0, y: 0 });
  const targetFreq = React.useRef({ x: 0.02, y: 0.05 });
  const scale = React.useRef(0);
  const targetScale = React.useRef(0);
  const frames = React.useRef(0);

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // The physics/animation loop for the liquid effect
  const animate = React.useCallback(() => {
    frames.current += 1;
    
    // Linear interpolation for smoothness
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    if (isHovered) {
      targetScale.current = 40; // Max distortion scale
      // Oscillate frequency for flowing liquid look
      targetFreq.current = {
        x: 0.01 + Math.sin(frames.current * 0.05) * 0.005,
        y: 0.04 + Math.cos(frames.current * 0.05) * 0.02
      };
    } else {
      targetScale.current = 0;
      targetFreq.current = { x: 0, y: 0 };
    }

    if (isClicked) {
      targetScale.current = 100; // Shockwave on click
    }

    // Apply interpolation
    scale.current = lerp(scale.current, targetScale.current, 0.1);
    freq.current.x = lerp(freq.current.x, targetFreq.current.x, 0.1);
    freq.current.y = lerp(freq.current.y, targetFreq.current.y, 0.1);

    // Update DOM directly for performance
    if (turbulenceRef.current) {
      turbulenceRef.current.setAttribute('baseFrequency', `${freq.current.x} ${freq.current.y}`);
    }
    if (displacementRef.current) {
      displacementRef.current.setAttribute('scale', scale.current);
    }
    
    // Continue loop if there's significant movement or hovering
    if (isHovered || scale.current > 0.5) {
      reqRef.current = requestAnimationFrame(animate);
    }
  }, [isHovered, isClicked]);

  React.useEffect(() => {
    if (isHovered || isClicked) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      reqRef.current = requestAnimationFrame(animate);
    } else {
      // Allow animation to settle back to 0
      reqRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isHovered, isClicked, animate]);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200); // Reset click state shortly
  };

  // Text Splitting for Entrance
  const textLeft = "CLICK";
  const textRight = "ME";

  return (
    <div className="min-h-[400px] w-full flex items-center justify-center bg-zinc-950 overflow-hidden font-sans p-8 perspective-[1000px]">
      
      {/* SVG Filter Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="liquid-warp">
            <feTurbulence 
              ref={turbulenceRef}
              type="fractalNoise" 
              baseFrequency="0 0" 
              numOctaves="2" 
              result="warp" 
            />
            <feDisplacementMap 
              ref={displacementRef}
              xChannelSelector="R" 
              yChannelSelector="G" 
              scale="0" 
              in="SourceGraphic" 
              in2="warp" 
            />
          </filter>
        </defs>
      </svg>

      <button
        ref={buttonRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        className={`
          group relative px-16 py-8 
          bg-transparent outline-none
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isClicked ? 'scale-95' : 'scale-100'}
        `}
      >
        {/* Button Background Layers */}
        <div className={`
          absolute inset-0 rounded-2xl opacity-80
          bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900
          transition-opacity duration-500
          ${isHovered ? 'opacity-100' : 'opacity-80'}
        `} />
        
        {/* Animated Border/Glow */}
        <div className={`
          absolute -inset-[2px] rounded-2xl -z-10
          bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400
          opacity-0 group-hover:opacity-100 blur-md
          transition-opacity duration-500 will-change-opacity
        `} />
        
        <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/30 transition-colors duration-300" />

        {/* Content Container with Liquid Filter */}
        <div 
          className="relative z-10 flex items-center gap-4 text-4xl font-black tracking-widest text-white mix-blend-overlay"
          style={{ filter: 'url(#liquid-warp)', willChange: 'filter' }}
          ref={textRef}
        >
          {/* Left Text Slide-In */}
          <span 
            className={`
              inline-block transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]
              ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-[150%] opacity-0'}
            `}
          >
            {textLeft}
          </span>
          
          {/* Right Text Slide-In */}
          <span 
            className={`
              inline-block text-cyan-200
              transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] delay-100
              ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}
            `}
          >
            {textRight}
          </span>
        </div>

        {/* Particle/Dust Overlay (Optional texture) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-cover" />

        {/* Shine Effect */}
        <div 
          className={`
            absolute inset-0 -translate-x-full group-hover:translate-x-full
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            transition-transform duration-1000 ease-in-out z-20 pointer-events-none
          `} 
        />
      </button>

      {/* Decorative background elements to emphasize the environment */}
      <div className={`absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />
      
    </div>
  );
};

export default GeneratedComponent;