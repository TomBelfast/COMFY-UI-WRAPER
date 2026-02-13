const GeneratedComponent = () => {
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [shattered, setShattered] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 0.5, y: 0.5 });
  const containerRef = React.useRef(null);
  const cardRef = React.useRef(null);

  // Generate shards only once
  const shards = React.useMemo(() => {
    const rows = 5;
    const cols = 4;
    const items = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Create 2 triangles per grid cell for jagged look
        const top = (r / rows) * 100;
        const left = (c / cols) * 100;
        const width = (1 / cols) * 100;
        const height = (1 / rows) * 100;
        
        // Triangle 1: Top-Left
        items.push({
          id: `shard-${r}-${c}-1`,
          clipPath: `polygon(0% 0%, 100% 0%, 0% 100%)`,
          top: `${top}%`,
          left: `${left}%`,
          width: `${width}%`,
          height: `${height}%`,
          tx: (Math.random() - 0.5) * 250, // Explosion X distance
          ty: (Math.random() - 0.5) * 250, // Explosion Y distance
          rot: (Math.random() - 0.5) * 360,
          delay: Math.random() * 0.1
        });
        
        // Triangle 2: Bottom-Right
        items.push({
          id: `shard-${r}-${c}-2`,
          clipPath: `polygon(100% 0%, 100% 100%, 0% 100%)`,
          top: `${top}%`,
          left: `${left}%`,
          width: `${width}%`,
          height: `${height}%`,
          tx: (Math.random() - 0.5) * 250,
          ty: (Math.random() - 0.5) * 250,
          rot: (Math.random() - 0.5) * 360,
          delay: Math.random() * 0.1
        });
      }
    }
    return items;
  }, []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = React.useCallback((e) => {
    if (shattered || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  }, [shattered]);

  const handleMouseLeave = () => {
    setHovered(false);
    setMousePos({ x: 0.5, y: 0.5 });
  };

  const handleClick = () => {
    if (shattered) return;
    setShattered(true);
    
    // Auto reset for replayability
    setTimeout(() => {
      setShattered(false);
      setMounted(false);
      setTimeout(() => setMounted(true), 50); // Re-trigger entrance
    }, 2500);
  };

  // Calculate Tilt
  const tiltX = (0.5 - mousePos.y) * 20; // Max tilt deg
  const tiltY = (mousePos.x - 0.5) * 20;

  // Icons
  const { Sparkles, Zap, Fingerprint } = window.LucideReact || { Sparkles: () => null, Zap: () => null, Fingerprint: () => null };

  return (
    <div 
      ref={containerRef}
      className="flex items-center justify-center min-h-screen bg-[#050505] overflow-hidden p-8 font-sans selection:bg-cyan-500/30"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div 
        className="relative group w-[320px] h-[460px]"
        style={{ perspective: "1000px" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* SHARDS LAYER (Visible only when shattered) */}
        <div className={`absolute inset-0 pointer-events-none z-50 ${shattered ? 'opacity-100' : 'opacity-0'}`}>
            {shards.map((shard) => (
              <div
                key={shard.id}
                className="absolute bg-white/20 border border-white/40 shadow-xl backdrop-blur-sm"
                style={{
                  top: shard.top,
                  left: shard.left,
                  width: shard.width,
                  height: shard.height,
                  clipPath: shard.clipPath,
                  transform: shattered 
                    ? `translate3d(${shard.tx}px, ${shard.ty}px, 200px) rotate(${shard.rot}deg)` 
                    : 'translate3d(0,0,0) rotate(0deg)',
                  opacity: shattered ? 0 : 1,
                  transition: `transform 0.8s cubic-bezier(0.1, 0.9, 0.2, 1) ${shard.delay}s, opacity 0.6s ease-in 0.2s`,
                  willChange: 'transform, opacity'
                }}
              />
            ))}
        </div>

        {/* MAIN CARD OBJECT */}
        <div
          ref={cardRef}
          className={`relative w-full h-full transition-all duration-300 ease-out preserve-3d cursor-pointer ${shattered ? 'opacity-0 scale-105' : 'opacity-100'}`}
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${shattered ? 0 : tiltX}deg) rotateY(${shattered ? 0 : tiltY}deg) scale(${hovered && !shattered ? 1.02 : 1})`,
          }}
        >
          {/* FROST ENTRANCE OVERLAY */}
          <div 
            className={`absolute inset-0 z-40 bg-white/30 backdrop-blur-xl transition-all duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none rounded-2xl border border-white/50 ${mounted ? 'opacity-0 backdrop-blur-0' : 'opacity-100 backdrop-blur-xl'}`}
          />

          {/* GLASS CARD BASE */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-md overflow-hidden">
            
            {/* Dynamic Glare/Shine */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
                mixBlendMode: 'overlay'
              }}
            />
            
            {/* Decorative Grid Lines */}
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none" 
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
            />

            {/* Content Layer */}
            <div className="relative z-10 h-full flex flex-col items-center justify-between p-8 text-white select-none">
              
              {/* Header */}
              <div className="w-full flex justify-between items-center opacity-80">
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Glass.OS
                </div>
                <Zap size={16} className="text-cyan-200" />
              </div>

              {/* Center Hero */}
              <div className="text-center space-y-6 translate-z-10" style={{ transform: "translateZ(40px)" }}>
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full" />
                  <div className={`relative p-4 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm transition-all duration-500 ${hovered ? 'scale-110 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.4)]' : ''}`}>
                    <Fingerprint size={48} className={`text-white transition-all duration-500 ${hovered ? 'stroke-cyan-300' : 'stroke-white/80'}`} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 drop-shadow-lg">
                    HOVER ME
                  </h2>
                  <p className="text-sm text-cyan-100/60 font-medium tracking-wide">
                    Click to Break the Illusion
                  </p>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="bg-white/5 rounded-lg p-2 text-center backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <span className="block text-lg font-bold">98%</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">Opacity</span>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <span className="block text-lg font-bold flex items-center justify-center gap-1">
                    <Sparkles size={14} /> 60
                  </span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">FPS</span>
                </div>
              </div>

            </div>
          </div>

          {/* Depth/Thickness Layer (Simulated 3D side) */}
          <div className="absolute inset-0 rounded-2xl translate-z-[-10px] bg-white/10 border border-white/5 shadow-xl" style={{ transform: "translateZ(-10px)" }}></div>
        </div>
        
        {/* Reset hint */}
        {shattered && (
          <div className="absolute top-full left-0 right-0 pt-8 text-center animate-bounce">
            <span className="text-xs text-white/40 tracking-[0.2em] uppercase">Restoring System...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedComponent;