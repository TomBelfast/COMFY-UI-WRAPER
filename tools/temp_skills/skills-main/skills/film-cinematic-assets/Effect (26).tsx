const GeneratedComponent = () => {
  const { useState, useRef, useEffect, useCallback } = React;
  const { Zap, Rocket, Activity, ChevronRight, Sparkles } = LucideReact;

  // Particle Effect Component
  const Particle = ({ x, y, onComplete }) => {
    const [style, setStyle] = useState({
      opacity: 1,
      transform: `translate(${x}px, ${y}px) scale(1)`,
    });

    useEffect(() => {
      // Random direction and distance
      const angle = Math.random() * Math.PI * 2;
      const velocity = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      // Random color variation
      const colors = ['#60A5FA', '#818CF8', '#C084FC', '#38BDF8'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const duration = 500 + Math.random() * 500;

      // Trigger animation
      requestAnimationFrame(() => {
        setStyle({
          opacity: 0,
          transform: `translate(${x + tx}px, ${y + ty}px) scale(0)`,
          transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          backgroundColor: color,
        });
      });

      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }, [x, y, onComplete]);

    return (
      <div
        className="pointer-events-none absolute w-2 h-2 rounded-full z-50 mix-blend-screen"
        style={style}
      />
    );
  };

  // Main 3D Button Component
  const Component3D = () => {
    const btnRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [particles, setParticles] = useState([]);

    const handleMouseMove = (e) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      
      // Calculate normalized position (-1 to 1)
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate percent for gradient
      const xPct = (x / rect.width) * 100;
      const yPct = (y / rect.height) * 100;

      // Calculate rotation (Max 15 degrees)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -12; // Invert Y for correct tilt
      const rotateY = ((x - centerX) / centerX) * 12;

      setRotation({ x: rotateX, y: rotateY });
      setGlowPos({ x: xPct, y: yPct });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsPressed(false);
      setRotation({ x: 0, y: 0 });
      setGlowPos({ x: 50, y: 50 }); // Center glow
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseDown = (e) => {
      setIsPressed(true);
      
      // Spawn particles
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        x: clickX,
        y: clickY,
      }));

      setParticles(prev => [...prev, ...newParticles]);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const removeParticle = useCallback((id) => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, []);

    return (
      <div className="relative group perspective-1000">
        {/* Particles Container */}
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          {particles.map(p => (
            <Particle key={p.id} x={p.x} y={p.y} onComplete={() => removeParticle(p.id)} />
          ))}
        </div>

        <button
          ref={btnRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{
            transform: `
              rotateX(${isPressed ? rotation.x * 0.5 : rotation.x}deg) 
              rotateY(${isPressed ? rotation.y * 0.5 : rotation.y}deg)
              translateZ(${isPressed ? -10 : 0}px)
              scale(${isPressed ? 0.95 : 1})
            `,
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
          className="relative w-72 h-20 rounded-xl outline-none select-none cursor-pointer transform-style-3d will-change-transform"
        >
          {/* Ambient Glow behind the button */}
          <div 
            className={`absolute -inset-4 rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 blur-2xl`}
            style={{
              background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(56, 189, 248, 0.6), rgba(129, 140, 248, 0.2), transparent)`
            }}
          />

          {/* 3D Side/Depth Layers (Simulating thickness) */}
          <div className="absolute inset-0 rounded-xl bg-slate-800 transform translate-y-2 translate-z-[-10px] shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform duration-100" 
             style={{
               transform: isPressed ? 'translateY(1px) translateZ(-2px)' : 'translateY(8px) translateZ(-10px)'
             }}
          />
          
          {/* Main Button Face */}
          <div 
            className="absolute inset-0 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shadow-2xl"
          >
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            {/* Dynamic Spotlight Sheen */}
            <div 
              className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle 150px at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.15), transparent 100%)`,
                opacity: isHovered ? 1 : 0
              }}
            />

            {/* Content Container */}
            <div className="relative z-10 flex items-center gap-4 px-8 py-4">
              <div className="relative">
                <div className={`absolute inset-0 bg-blue-500 blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300 animate-pulse`} />
                <Zap className="w-8 h-8 text-blue-400 relative z-10 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12" />
              </div>
              
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-blue-200 tracking-wider uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                  Initiate
                </span>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] group-hover:tracking-widest transition-all duration-300">
                  WARP SPEED
                </span>
              </div>
              
              <ChevronRight className={`w-6 h-6 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300`} />
            </div>

            {/* Border Glow Gradient */}
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none border border-transparent"
              style={{
                maskImage: 'linear-gradient(black, black), content-box',
                maskComposite: 'exclude',
                background: `linear-gradient(${rotation.x * 10 + 90}deg, rgba(56,189,248,0) 0%, rgba(56,189,248,0.8) 50%, rgba(56,189,248,0) 100%)`,
                opacity: isHovered ? 1 : 0.3,
                transition: 'opacity 0.3s ease'
              }}
            />
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center p-8 overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-16">
        <div className="text-center space-y-4 max-w-lg">
          <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
             Interactive 3D Button <Sparkles className="text-yellow-400 w-8 h-8" />
          </h2>
          <p className="text-slate-400 text-lg">
            Hover to engage magnetic tilt field. Click to discharge kinetic energy.
          </p>
        </div>

        <Component3D />
        
        <div className="flex gap-8 text-slate-500 text-sm font-mono mt-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>WebGL-Free</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-75" />
            <span>Pure CSS + React</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150" />
            <span>60fps</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedComponent;