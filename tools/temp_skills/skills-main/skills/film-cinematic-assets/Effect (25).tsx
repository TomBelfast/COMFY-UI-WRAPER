const GeneratedComponent = () => {
  const { Zap, MousePointer2, Star, Sparkles } = window.LucideReact || { 
    Zap: () => null, 
    MousePointer2: () => null, 
    Star: () => null, 
    Sparkles: () => null 
  };

  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const buttonRef = React.useRef(null);

  // Handle mouse movement for 3D tilt and spotlight effect
  const handleMouseMove = React.useCallback((e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentages for gradients
    const xPct = x / rect.width;
    const yPct = y / rect.height;

    // Calculate rotation (limit to +/- 10 degrees)
    const rotateX = ((yPct - 0.5) * -20).toFixed(2);
    const rotateY = ((xPct - 0.5) * 20).toFixed(2);

    setMousePos({ x, y, xPct, yPct, rotateX, rotateY });
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsPressed(false);
    // Reset position slightly slower for a smooth return
    setMousePos((prev) => ({ ...prev, rotateX: 0, rotateY: 0, xPct: 0.5, yPct: 0.5 }));
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <div className="min-h-[600px] w-full bg-[#09090b] flex items-center justify-center font-sans overflow-hidden relative perspective-1000">
      
      {/* Background Decor - Grid & Glow */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-violet-500 opacity-20 blur-[100px]"></div>
      </div>

      {/* Floating Particles in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute bg-white rounded-full opacity-20 animate-pulse`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* 3D Container */}
      <div 
        className="relative group perspective-[1000px] z-10"
        style={{ perspective: '1000px' }}
      >
        {/* The Button Wrapper */}
        <button
          ref={buttonRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="relative w-64 h-20 outline-none select-none cursor-pointer touch-none appearance-none bg-transparent border-0 p-0"
          style={{
            transformStyle: 'preserve-3d',
            transform: isHovering 
              ? `rotateX(${mousePos.rotateX}deg) rotateY(${mousePos.rotateY}deg) scale3d(1.05, 1.05, 1.05)` 
              : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.15s ease-out'
          }}
        >
          {/* Back Shadow / Glow (Ambient Light) */}
          <div 
            className={`absolute inset-0 rounded-xl bg-violet-600 blur-[20px] transition-opacity duration-500 ease-in-out ${isHovering ? 'opacity-60' : 'opacity-0'}`}
            style={{
              transform: 'translateZ(-20px) scale(0.9)',
            }}
          />

          {/* 3D Depth Layer (The sides of the button) */}
          <div 
            className="absolute inset-0 rounded-xl bg-violet-900/80 transition-transform duration-100 ease-out border border-violet-800"
            style={{
              transform: isPressed 
                ? 'translateY(2px) translateZ(-2px)' 
                : 'translateY(8px) translateZ(-10px)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
            }}
          />

          {/* Main Button Face */}
          <div 
            className="absolute inset-0 rounded-xl bg-slate-900 border border-violet-500/30 overflow-hidden flex items-center justify-center transition-transform duration-100 ease-out"
            style={{
              transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
              background: `
                radial-gradient(
                  circle at ${mousePos.xPct * 100}% ${mousePos.yPct * 100}%, 
                  rgba(139, 92, 246, 0.15) 0%, 
                  transparent 50%
                ),
                linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)
              `
            }}
          >
            {/* Inner Grid Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>

            {/* Moving Sheen Effect on Hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-soft-light"
              style={{
                background: `
                  linear-gradient(
                    110deg, 
                    transparent 30%, 
                    rgba(255,255,255,0.1) 45%, 
                    rgba(255,255,255,0.3) 50%, 
                    rgba(255,255,255,0.1) 55%, 
                    transparent 70%
                  )
                `,
                transform: `translateX(${(mousePos.xPct - 0.5) * 200}%)`,
                transition: 'transform 0.1s ease-out'
              }}
            />

            {/* Top Border Highlight (simulates light catching the edge) */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-50"></div>
            
            {/* Content Container with slight Parallax */}
            <div 
              className="relative flex items-center gap-3 z-10"
              style={{
                transform: `translateX(${(mousePos.xPct - 0.5) * 10}px) translateY(${(mousePos.yPct - 0.5) * 10}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {/* Icon with spin/pulse effect */}
              <div className={`relative p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 transition-all duration-300 ${isHovering ? 'scale-110 shadow-[0_0_15px_rgba(139,92,246,0.5)] border-violet-400/50' : ''}`}>
                 <Zap className={`w-6 h-6 ${isHovering ? 'fill-violet-300 animate-pulse' : ''}`} />
                 
                 {/* Sparkles appearing on hover */}
                 <Sparkles 
                   className={`absolute -top-2 -right-2 w-4 h-4 text-cyan-300 transition-all duration-500 ${isHovering ? 'opacity-100 scale-100 rotate-12' : 'opacity-0 scale-0 -rotate-45'}`} 
                 />
              </div>

              {/* Text */}
              <div className="flex flex-col items-start">
                <span className={`text-sm font-bold tracking-wider text-white transition-all duration-300 ${isHovering ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-cyan-200 tracking-[0.15em] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`}>
                  AKTYWUJ
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
                  Ultimate Mode
                </span>
              </div>
            </div>

            {/* Corner Accents */}
            <div className={`absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 transition-all duration-300 ${isHovering ? 'shadow-[0_0_10px_#22d3ee]' : 'opacity-30'}`}></div>
            <div className={`absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-violet-400 transition-all duration-300 ${isHovering ? 'shadow-[0_0_10px_#a78bfa]' : 'opacity-30'}`}></div>
          </div>
          
        </button>

        {/* Floating text below */}
        <div className={`absolute -bottom-12 left-0 right-0 text-center transition-all duration-500 ${isHovering ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <span className="text-xs font-mono text-violet-400/70 tracking-[0.3em] uppercase drop-shadow-md">
            Ready to Launch
          </span>
        </div>

      </div>
      
      {/* Instructions Overlay (Optional styling to guide user) */}
      <div className="absolute bottom-8 text-slate-600 text-xs font-mono flex items-center gap-2">
         <MousePointer2 size={12} />
         <span>Hover & Click for Effects</span>
      </div>
    </div>
  );
};

export default GeneratedComponent;