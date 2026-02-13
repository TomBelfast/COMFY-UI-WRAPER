const GeneratedComponent = () => {
  const [mounted, setMounted] = React.useState(false);
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);
  const cardRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const text = "HOVER ME";

  // Trigger entrance animation
  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle Tilt Effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (max 15 degrees)
    // We invert Y calculation for X axis rotation to make it follow naturally
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -12;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 12;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 }); // Reset position
  };

  const handleClick = () => {
    setIsClicked(true);
    // Reset click animation after delay so it can be clicked again
    setTimeout(() => setIsClicked(false), 2000);
    
    // Optional: Reset mount to replay entrance
    if(mounted) {
        setMounted(false);
        setTimeout(() => setMounted(true), 800);
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-8 overflow-hidden font-sans perspective-container"
      style={{ perspective: '2000px' }}
    >
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen transition-all duration-1000 ease-in-out ${isHovering ? 'bg-blue-600/30 scale-125' : ''}`} />
            <div className={`absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[80px] animate-pulse`} />
        </div>

      {/* The 3D Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`
          relative w-[400px] h-[500px] rounded-3xl cursor-pointer
          transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]
          group
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: `
            rotateX(${rotation.x}deg) 
            rotateY(${rotation.y}deg) 
            scale(${isClicked ? 0.95 : isHovering ? 1.05 : 1})
          `
        }}
      >
        {/* Card Border & Glass Effect */}
        <div 
            className="absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md shadow-2xl overflow-hidden"
            style={{ 
                transform: 'translateZ(0px)',
                boxShadow: isHovering ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
            }}
        >
            {/* Dynamic Glare Gradient */}
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at ${50 - rotation.y * 3}% ${50 - rotation.x * 3}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
                }}
            />
            
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        {/* Floating Content Container */}
        <div 
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ transform: 'translateZ(60px)' }}
        >
            {/* Main Text Animation */}
            <div className="flex space-x-2 text-6xl font-black tracking-tighter text-white">
                {text.split("").map((char, index) => (
                    <span
                        key={index}
                        className="inline-block origin-bottom will-change-transform"
                        style={{
                            transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s`,
                            transform: mounted 
                                ? `rotateX(0deg) translateY(0px) scale(1)` 
                                : `rotateX(-90deg) translateY(-40px) scale(0.5)`,
                            opacity: mounted ? 1 : 0,
                            textShadow: isHovering 
                                ? '0 10px 20px rgba(0,0,0,0.5)' 
                                : '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))}
            </div>

            {/* Subtext Reveal */}
            <div 
                className="mt-6 text-sm font-medium tracking-widest text-blue-300 uppercase overflow-hidden"
                style={{ transform: 'translateZ(40px)' }}
            >
                <div 
                    className="transition-transform duration-700 delay-500 ease-out"
                    style={{ transform: mounted ? 'translateY(0)' : 'translateY(100%)' }}
                >
                    Interactive 3D Card
                </div>
            </div>

            {/* Decoration Lines */}
            <div 
                className="absolute bottom-12 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ 
                    width: isHovering ? '80%' : '3rem',
                    opacity: mounted ? 1 : 0,
                    transform: 'translateZ(30px)'
                }}
            />
        </div>

        {/* 3D Depth Layers for aesthetic complexity */}
        <div 
            className="absolute top-10 right-10 w-20 h-20 border border-white/5 rounded-full"
            style={{ transform: 'translateZ(20px)' }}
        />
        <div 
            className="absolute bottom-10 left-10 w-12 h-12 border border-blue-500/20 rounded-full"
            style={{ transform: 'translateZ(30px)' }}
        />
        
        {/* Click Feedback Ripple/Flash */}
        {isClicked && (
             <div className="absolute inset-0 bg-white/20 animate-ping rounded-3xl" style={{ animationDuration: '0.5s' }} />
        )}
      </div>

      {/* Instructions */}
      <div className={`fixed bottom-8 text-neutral-500 text-xs tracking-widest uppercase transition-opacity duration-1000 ${mounted ? 'opacity-50' : 'opacity-0'}`}>
         {isClicked ? "Reshuffling..." : "Tilt • Hover • Click"}
      </div>
    </div>
  );
};

export default GeneratedComponent;