const GeneratedComponent = () => {
  const [mounted, setMounted] = React.useState(false);
  const [clicked, setClicked] = React.useState(false);
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = React.useState({ x: 50, y: 50 });
  const buttonRef = React.useRef(null);
  
  const text = "Click Me";
  const letters = text.split("");

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    if (!buttonRef.current || clicked) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentages for glow
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    setGlowPos({ x: xPercent, y: yPercent });

    // Calculate rotation (max 15 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -20; // Invert Y for natural tilt
    const rotateY = ((x - centerX) / centerX) * 20;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    if (clicked) return;
    setRotation({ x: 0, y: 0 });
    setGlowPos({ x: 50, y: 50 });
  };

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    
    // Reset after animation for replayability
    setTimeout(() => {
      setMounted(false);
      setClicked(false);
      setRotation({ x: 0, y: 0 });
      
      // Re-trigger entrance
      setTimeout(() => {
        setMounted(true);
      }, 100);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden perspective-[2000px] font-sans">
      
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 scale-110' : 'opacity-0 scale-50'}`} />
      </div>

      {/* Button Container with Perspective */}
      <div 
        className="relative group perspective-[1000px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <button
          ref={buttonRef}
          onClick={handleClick}
          disabled={clicked}
          className="relative w-64 h-20 rounded-2xl bg-gray-900 outline-none select-none cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${clicked ? 0.95 : 1})`,
            transition: 'transform 0.1s ease-out', // Smooth responsiveness for tilt, fast for click
          }}
        >
          {/* Depth/Shadow Layer (Behind) */}
          <div 
            className="absolute inset-0 rounded-2xl bg-purple-900/50 blur-lg transform translate-z-[-20px] transition-opacity duration-300"
            style={{ opacity: mounted && !clicked ? 0.6 : 0 }}
          />

          {/* Main Button Body */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
            
            {/* Dynamic Glow Effect following mouse */}
            <div 
              className="absolute w-[150%] h-[150%] bg-radial-gradient from-purple-500/20 to-transparent blur-md transition-opacity duration-300"
              style={{
                left: `${glowPos.x}%`,
                top: `${glowPos.y}%`,
                transform: 'translate(-50%, -50%)',
                opacity: mounted && !clicked ? 1 : 0,
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'
              }}
            />

            {/* Shine Sweep on Entrance */}
            <div 
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000 ease-in-out ${mounted && !clicked ? 'translate-x-[200%]' : ''}`}
            />
          </div>

          {/* Text Container */}
          <div className="relative z-10 w-full h-full flex items-center justify-center gap-1 overflow-hidden">
            {letters.map((char, i) => (
              <span
                key={i}
                className="inline-block text-2xl md:text-3xl font-bold text-white will-change-transform"
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
              >
                <span
                  className="inline-block"
                  style={{
                    // Animation Logic
                    // 1. Initial State (Not mounted): Rotated up (-90deg), moved up, invisible
                    // 2. Mounted State: Reset to 0
                    // 3. Clicked State: Rotated down (90deg), moved down, invisible
                    transform: !mounted 
                      ? 'rotateX(-90deg) translateY(-20px) translateZ(-20px)' 
                      : clicked 
                        ? 'rotateX(90deg) translateY(20px) translateZ(-20px)' 
                        : 'rotateX(0deg) translateY(0px) translateZ(0px)',
                    
                    opacity: mounted && !clicked ? 1 : 0,
                    
                    transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out`,
                    transitionDelay: clicked ? `${i * 30}ms` : `${150 + (i * 50)}ms`
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              </span>
            ))}
          </div>

          {/* Border Gradient Overlay */}
          <div className={`absolute inset-0 rounded-2xl border border-white/5 transition-colors duration-300 ${clicked ? 'border-purple-500/50' : 'group-hover:border-white/20'}`} />
          
        </button>

        {/* Success Message (Appears after click) */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `translateZ(-50px)`,
            opacity: clicked ? 1 : 0,
            transition: 'opacity 0.3s ease-in 0.2s'
          }}
        >
          <span className="text-purple-400 font-bold tracking-widest text-sm uppercase animate-pulse">
            Processing
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-10 text-white/20 text-xs tracking-widest uppercase">
        Hover to Tilt • Click to Submit
      </div>
    </div>
  );
};

export default GeneratedComponent;