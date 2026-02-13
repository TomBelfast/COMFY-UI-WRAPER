const GeneratedComponent = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [triggerFlip, setTriggerFlip] = React.useState(0); // Used to re-trigger animation on click
  const cardRef = React.useRef(null);
  const glowRef = React.useRef(null);
  
  // Lucide Icons
  const { MousePointer2, Sparkles } = window.LucideReact || { MousePointer2: () => null, Sparkles: () => null };

  React.useEffect(() => {
    // Mount animation delay
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mouse Tilt Logic
  const handleMouseMove = React.useCallback((e) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Max rotation in degrees
    const maxRotation = 15;
    
    const rotateX = ((y - centerY) / centerY) * -maxRotation; // Invert Y for natural tilt
    const rotateY = ((x - centerX) / centerX) * maxRotation;
    
    // Apply transform directly to DOM for performance (avoiding React render cycle)
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    
    // Move glow effect
    if (glowRef.current) {
      glowRef.current.style.transform = `translate(${x}px, ${y}px)`;
      glowRef.current.style.opacity = '1';
    }
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    if (!cardRef.current) return;
    setIsHovered(false);
    
    // Reset transform smoothly
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleClick = () => {
    // Trigger the disappearance -> appearance cycle
    setTriggerFlip(prev => prev + 1);
  };

  // Text Flip Component
  const FlipText = ({ text, delay = 0, triggerKey }) => {
    // We split text and animate each char
    const chars = text.split('');
    const [animState, setAnimState] = React.useState('idle'); // idle, exiting, entering

    React.useEffect(() => {
        // When triggerKey changes (and it's not the initial mount 0), we exit then enter
        if (triggerKey > 0) {
            setAnimState('exiting');
            const timer = setTimeout(() => {
                setAnimState('entering');
            }, 600); // Wait for exit to finish
            return () => clearTimeout(timer);
        } else {
            setAnimState('entering');
        }
    }, [triggerKey]);

    return (
      <div className="flex justify-center items-center overflow-hidden h-16 perspective-500">
        {chars.map((char, i) => (
          <span
            key={`${triggerKey}-${i}`}
            className={`
              inline-block text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-cyan-500
              transform-style-3d will-change-transform
            `}
            style={{
              transition: `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)`,
              transitionDelay: `${delay + i * 40}ms`,
              transform: 
                animState === 'exiting' 
                  ? 'translateY(-120%) rotateX(90deg)' 
                  : animState === 'entering' && isMounted 
                    ? 'translateY(0%) rotateX(0deg)' 
                    : 'translateY(120%) rotateX(-90deg)',
              opacity: animState === 'exiting' ? 0 : 1,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* 3D Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        className="relative w-full max-w-md h-[500px] rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl cursor-pointer group select-none transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: isHovered 
            ? '0 25px 50px -12px rgba(6, 182, 212, 0.25)' 
            : '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Animated Glow Gradient Follower */}
        <div
          ref={glowRef}
          className="absolute w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen opacity-0 transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2 z-0"
          style={{ willChange: 'transform' }}
        />

        {/* Card Content Layer */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-8 overflow-hidden rounded-3xl bg-gradient-to-b from-white/5 to-transparent backdrop-blur-[2px]">
            
          {/* Header */}
          <div className="flex justify-between items-start opacity-80" style={{ transform: 'translateZ(20px)' }}>
            <div className="p-2 bg-white/10 rounded-full border border-white/5 backdrop-blur-md">
                <Sparkles size={20} className="text-cyan-400" />
            </div>
            <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
              Interact • 3D • Flip
            </div>
          </div>

          {/* Center Text (The Hero) */}
          <div className="flex flex-col items-center justify-center space-y-2 py-10 perspective-1000" style={{ transform: 'translateZ(50px)' }}>
            <FlipText text="HOVER" delay={100} triggerKey={triggerFlip} />
            <FlipText text="ME" delay={300} triggerKey={triggerFlip} />
            
            {/* Instruction Line */}
            <div 
              className="h-1 w-12 bg-cyan-500 rounded-full mt-6 transition-all duration-500 ease-out"
              style={{ 
                width: isHovered ? '80px' : '30px',
                opacity: isHovered ? 1 : 0.5,
                boxShadow: isHovered ? '0 0 20px rgba(6,182,212,0.8)' : 'none'
              }}
            />
          </div>

          {/* Footer Info */}
          <div className="space-y-4" style={{ transform: 'translateZ(30px)' }}>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
            <div className="flex items-center justify-between text-neutral-400 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>System Active</span>
                </div>
                <MousePointer2 
                    size={16} 
                    className={`transition-transform duration-300 ${isHovered ? 'translate-x-1 -translate-y-1 text-cyan-400' : ''}`} 
                />
            </div>
          </div>
          
          {/* Border Gradient Overlay */}
          <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>
          
          {/* Hover Border Highlight */}
          <div 
            className="absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none"
            style={{
                background: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent 40%)',
                opacity: isHovered ? 1 : 0
            }}
          ></div>
        </div>

        {/* Backside (Conceptual Depth) */}
        <div 
            className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-[30px] blur-md -z-10 transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0 }}
        />
        
      </div>
    </div>
  );
};

export default GeneratedComponent;