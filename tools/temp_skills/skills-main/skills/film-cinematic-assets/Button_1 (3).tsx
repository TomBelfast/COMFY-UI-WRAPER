const GeneratedComponent = () => {
  const { useState, useEffect, useRef, useCallback } = React;
  const { Droplets, ArrowRight } = LucideReact;

  // Configuration for the visual effects
  const BLOB_COUNT = 12;
  const DROPLET_COUNT = 6;
  
  // State management
  const [status, setStatus] = useState('mounting'); // mounting, idle, melting, recovering
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blobs, setBlobs] = useState([]);
  const [droplets, setDroplets] = useState([]);
  
  const buttonRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize random blob positions for the entrance animation
  useEffect(() => {
    const newBlobs = Array.from({ length: BLOB_COUNT }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 300, // Random start X spread
      y: (Math.random() - 0.5) * 200, // Random start Y spread
      scale: 0.5 + Math.random() * 0.5,
      delay: Math.random() * 0.5,
      speed: 0.5 + Math.random(),
    }));
    setBlobs(newBlobs);

    // Initialize melt droplets
    const newDroplets = Array.from({ length: DROPLET_COUNT }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 100, // Relative to button center
      delay: Math.random() * 0.2,
      scale: 0.4 + Math.random() * 0.4,
    }));
    setDroplets(newDroplets);

    // Trigger entrance
    const timer = setTimeout(() => {
      setStatus('idle');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle Mouse Move for Liquid Distortion
  const handleMouseMove = useCallback((e) => {
    if (status !== 'idle' || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });
  }, [status]);

  // Handle Click / Melt
  const handleClick = () => {
    if (status !== 'idle') return;

    setStatus('melting');

    // Reset after animation
    setTimeout(() => {
      setStatus('recovering');
      setTimeout(() => {
        setStatus('idle');
      }, 600); // Time to recover shape
    }, 2000); // Time to stay melted
  };

  return (
    <div 
      className="min-h-screen w-full bg-slate-950 flex items-center justify-center overflow-hidden relative font-sans"
    >
      {/* Decorative Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* SVG Filter Definition for the "Gooey" Effect */}
      <svg className="hidden">
        <defs>
          <filter id="liquid-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>

      {/* Main Interactive Component */}
      <div 
        ref={containerRef}
        className="relative z-10 p-20" // Padding for blobs to move outside bounds
      >
        <button
          ref={buttonRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: 100, y: 30 })} // Reset to roughly center-ish
          className="group relative bg-transparent border-none outline-none cursor-pointer select-none touch-none"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            transform: 'translateZ(0)' // Hardware acceleration
          }}
        >
          {/* 
            Gooey Layer 
            This layer contains the main button shape and all the animated blobs.
            The SVG filter is applied here to merge them.
          */}
          <div 
            className="absolute inset-[-100px] pointer-events-none transition-opacity duration-500"
            style={{ 
              filter: "url(#liquid-filter)",
              opacity: status === 'recovering' ? 0 : 1 // Flicker fix on recover
            }}
          >
            {/* The Main Button Body (Morphable) */}
            <div 
              className={`
                absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                w-48 h-16 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full
                transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                will-change-transform
              `}
              style={{
                transform: status === 'mounting' 
                  ? 'translate(-50%, -50%) scale(0)' 
                  : status === 'melting'
                    ? 'translate(-50%, 100%) scale(0.8, 0.2)'
                    : status === 'recovering'
                       ? 'translate(-50%, -50%) scale(0)'
                       : 'translate(-50%, -50%) scale(1)',
                opacity: status === 'melting' ? 0.8 : 1
              }}
            />

            {/* Entrance Blobs (Coalescing) */}
            {status !== 'idle' && status !== 'melting' && blobs.map((blob) => (
              <div
                key={`blob-${blob.id}`}
                className={`
                  absolute left-1/2 top-1/2 bg-indigo-500 rounded-full
                  transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]
                `}
                style={{
                  width: '40px',
                  height: '40px',
                  transform: status === 'mounting' || status === 'recovering'
                    ? `translate(calc(-50% + ${blob.x}px), calc(-50% + ${blob.y}px)) scale(${blob.scale})`
                    : `translate(-50%, -50%) scale(0)`, // Merge into center
                  opacity: status === 'mounting' ? 1 : 0,
                  transitionDelay: `${blob.delay * 100}ms`
                }}
              />
            ))}

            {/* Mouse Interaction Blob (The Bulge/Wave) */}
            {status === 'idle' && (
              <div 
                className="absolute left-0 top-0 w-24 h-24 bg-cyan-400 rounded-full opacity-80 blur-md transition-transform duration-100 ease-out will-change-transform"
                style={{
                  // Position relative to the container (-100px inset + mousePos)
                  transform: `translate(${mousePos.x + 50}px, ${mousePos.y + 50}px) scale(0.6)`,
                }}
              />
            )}

            {/* Melt Droplets */}
            {status === 'melting' && droplets.map((drop) => (
              <div
                key={`drop-${drop.id}`}
                className="absolute left-1/2 top-1/2 bg-indigo-500 rounded-full w-8 h-8"
                style={{
                  animation: `meltDrop 1.5s cubic-bezier(0.5, 0, 1, 1) forwards`,
                  animationDelay: `${drop.delay}s`,
                  // Start position
                  transform: `translate(calc(-50% + ${drop.x}px), 0px) scale(${drop.scale})`,
                }}
              />
            ))}
          </div>

          {/* 
            Content Layer 
            Sitting on top of the gooey layer, clean and sharp.
          */}
          <div className="relative z-20 w-48 h-16 flex items-center justify-center overflow-hidden rounded-full">
            {/* Inner Gradient Border/Highlight Effect */}
            <div className={`absolute inset-0 rounded-full border border-white/20 pointer-events-none transition-opacity duration-300 ${status === 'melting' ? 'opacity-0' : 'opacity-100'}`}></div>

            {/* Text & Icon */}
            <div 
              className={`
                flex items-center gap-2 text-white font-bold text-lg tracking-wide
                transition-all duration-500 ease-out
              `}
              style={{
                transform: status === 'melting' ? 'translateY(200%)' : 'translateY(0)',
                opacity: status === 'melting' ? 0 : 1,
              }}
            >
              <span className="drop-shadow-md">Get Started</span>
              <ArrowRight 
                className={`w-5 h-5 transition-transform duration-300 ${status === 'idle' ? 'group-hover:translate-x-1' : ''}`} 
              />
            </div>

            {/* Loading/Success State (Optional Visual Feedback) */}
            {status === 'melting' && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <Droplets className="w-8 h-8 text-white/80 animate-bounce" />
              </div>
            )}
          </div>

          {/* Glossy Reflection (Glassmorphism touch) */}
          <div 
            className={`
              absolute top-1 left-2 right-2 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none
              transition-all duration-500
            `}
            style={{
              opacity: status === 'melting' ? 0 : 0.4
            }}
          />
        </button>
      </div>

      {/* Animation Keyframes defined inline for self-containment */}
      <style>{`
        @keyframes meltDrop {
          0% {
            transform: translate(calc(-50% + var(--tx, 0px)), 0) scale(1);
          }
          50% {
             transform: translate(calc(-50% + var(--tx, 0px)), 150px) scale(0.8, 1.2);
          }
          100% {
            transform: translate(calc(-50% + var(--tx, 0px)), 400px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GeneratedComponent;