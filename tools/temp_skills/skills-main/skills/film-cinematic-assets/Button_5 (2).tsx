const GeneratedComponent = () => {
  const { useState, useEffect, useRef, useCallback } = React;
  const { Zap, Power } = LucideReact;

  // --- Particle System for Sparks ---
  const [particles, setParticles] = useState([]);
  
  const createSparks = (x, y, count = 15) => {
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 1) * 15,
      life: 1.0,
      color: Math.random() > 0.5 ? '#ff00ff' : '#00ffff',
      size: Math.random() * 4 + 2,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  useEffect(() => {
    if (particles.length === 0) return;
    const interval = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.8, // Gravity
            life: p.life - 0.03,
          }))
          .filter((p) => p.life > 0)
      );
    });
    return () => cancelAnimationFrame(interval);
  }, [particles]);

  // --- Button State Logic ---
  const [status, setStatus] = useState('off'); // off, flickering, on, burning, burnt
  const [hovered, setHovered] = useState(false);
  const btnRef = useRef(null);

  // Initial Power On Sequence
  useEffect(() => {
    let timeouts = [];
    
    // Start delay
    timeouts.push(setTimeout(() => setStatus('flickering'), 800));

    // Stabilize after flickering
    timeouts.push(setTimeout(() => setStatus('on'), 2500));

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Interaction Handler
  const handleClick = (e) => {
    if (status === 'burnt' || status === 'burning') return;

    // Create explosion origin relative to button center
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStatus('burning');
    createSparks(x, y, 40);

    // Flash white then die
    setTimeout(() => {
      setStatus('burnt');
    }, 200);
  };

  // Reset function for demo purposes (optional, keeps it interactive)
  const handleReset = (e) => {
    e.stopPropagation();
    setStatus('off');
    setTimeout(() => setStatus('flickering'), 500);
    setTimeout(() => setStatus('on'), 2000);
  };

  // --- Dynamic Styles for Neon Effect ---
  // We construct the shadow strings based on state to ensure optimal Tailwind arbitrary value usage isn't cluttered
  const getGlowStyles = () => {
    const baseColor = '#ff00aa'; // Hot Pink
    const secondaryColor = '#bc13fe'; // Purple
    
    if (status === 'off' || status === 'burnt') {
      return {
        boxShadow: 'none',
        textShadow: 'none',
        borderColor: '#333',
        color: '#333',
        opacity: 0.3,
        transform: 'scale(0.98)',
      };
    }

    if (status === 'burning') {
      return {
        boxShadow: `0 0 50px 20px #ffffff, inset 0 0 20px #ffffff`,
        textShadow: `0 0 20px #ffffff`,
        borderColor: '#fff',
        color: '#fff',
        backgroundColor: '#fff',
        opacity: 1,
        transform: 'scale(1.05)',
      };
    }

    // Default ON state (includes flickering logic via CSS classes, but here are base values)
    const intensity = hovered ? 1.2 : 1;
    return {
      boxShadow: `
        0 0 ${10 * intensity}px ${baseColor},
        0 0 ${20 * intensity}px ${baseColor},
        0 0 ${40 * intensity}px ${baseColor},
        0 0 ${80 * intensity}px ${secondaryColor},
        inset 0 0 ${10 * intensity}px ${baseColor}
      `,
      textShadow: `
        0 0 5px #fff,
        0 0 10px #fff,
        0 0 20px ${baseColor},
        0 0 30px ${baseColor},
        0 0 40px ${baseColor}
      `,
      borderColor: '#fff',
      color: '#fff',
      transform: hovered ? 'scale(1.02)' : 'scale(1)',
    };
  };

  // CSS Keyframes injection
  const cssKeyframes = `
    @keyframes flick {
      0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
        opacity: 0.99;
      }
      20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
        opacity: 0.4;
      }
    }
    @keyframes buzz {
      0% { transform: translate(0.5px, 0.5px) rotate(0deg); }
      10% { transform: translate(-0.5px, -0.5px) rotate(-0.5deg); }
      20% { transform: translate(-1.5px, 0.5px) rotate(0.5deg); }
      30% { transform: translate(1.5px, 1.5px) rotate(0deg); }
      40% { transform: translate(0.5px, -0.5px) rotate(0.5deg); }
      50% { transform: translate(-0.5px, 1.5px) rotate(-0.5deg); }
      60% { transform: translate(-1.5px, 0.5px) rotate(0deg); }
      70% { transform: translate(1.5px, 0.5px) rotate(-0.5deg); }
      80% { transform: translate(-0.5px, -0.5px) rotate(0.5deg); }
      90% { transform: translate(0.5px, 1.5px) rotate(0deg); }
      100% { transform: translate(0.5px, -1.5px) rotate(-0.5deg); }
    }
    .neon-flicker {
      animation: flick 3s infinite alternate;
    }
    .neon-buzz {
      animation: buzz 0.2s infinite linear;
    }
    .scanline {
      background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
      background-size: 100% 4px;
    }
  `;

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden flex flex-col items-center justify-center font-sans">
      <style>{cssKeyframes}</style>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Brick wall texture simulation */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
             backgroundImage: `radial-gradient(#1a1a1a 15%, transparent 16%), radial-gradient(#1a1a1a 15%, transparent 16%)`,
             backgroundSize: '20px 20px',
             backgroundPosition: '0 0, 10px 10px'
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]" />
        {/* Scanlines */}
        <div className="absolute inset-0 scanline opacity-10 pointer-events-none mix-blend-overlay" />
      </div>

      {/* Main Component Wrapper */}
      <div className="relative z-10 flex flex-col items-center gap-8 p-12">
        
        {/* The Button */}
        <button
          ref={btnRef}
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          disabled={status === 'burnt'}
          className={`
            relative group px-12 py-6 
            border-[3px] rounded-lg 
            text-4xl font-black tracking-[0.2em] uppercase
            transition-all duration-100 ease-[cubic-bezier(0.25,1,0.5,1)]
            select-none outline-none
            ${status === 'flickering' ? 'neon-flicker' : ''}
            ${status === 'on' && hovered ? 'neon-buzz' : ''}
          `}
          style={getGlowStyles()}
        >
          {/* Inner Tube Effect (Simulated with pseudo-element borders/shadows) */}
          <div className="absolute inset-0 rounded-md border border-white/20 pointer-events-none mix-blend-overlay"></div>
          
          <span className="relative z-10 flex items-center gap-4">
             {status !== 'burnt' && status !== 'burning' ? (
                <Zap 
                    className={`w-8 h-8 transition-opacity duration-75 ${status === 'flickering' ? 'opacity-50' : 'opacity-100'}`} 
                    strokeWidth={3}
                />
             ) : (
                 <Power className="w-8 h-8 text-gray-600" />
             )}
             Click Me
          </span>

          {/* Wire decoration */}
          <div className="absolute -top-20 left-10 w-1 h-20 bg-gray-800 -z-10 shadow-lg"></div>
          <div className="absolute -top-20 right-10 w-1 h-20 bg-gray-800 -z-10 shadow-lg"></div>
        </button>

        {/* Reflection on the floor/wall */}
        <div 
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[120%] h-20 bg-gradient-to-t from-transparent to-[#ff00aa] opacity-20 blur-3xl pointer-events-none transition-all duration-300"
          style={{
            opacity: status === 'on' ? (hovered ? 0.3 : 0.2) : 0,
            transform: `translateX(-50%) scale(${status === 'burning' ? 2 : 1})`
          }}
        />

        {/* Status Text / Hint */}
        <div className={`mt-12 text-gray-500 font-mono text-sm tracking-widest transition-opacity duration-1000 ${status === 'off' ? 'opacity-0' : 'opacity-60'}`}>
          {status === 'burnt' ? (
             <button 
                onClick={handleReset} 
                className="hover:text-white underline decoration-dotted cursor-pointer hover:neon-buzz"
             >
                SYSTEM FAILURE. REBOOT?
             </button>
          ) : (
            status === 'flickering' ? "INITIALIZING..." : "SYSTEM ONLINE"
          )}
        </div>
      </div>

      {/* Particle Rendering Layer */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: 0,
            top: 0,
            transform: `translate(${btnRef.current?.getBoundingClientRect().left + p.x}px, ${btnRef.current?.getBoundingClientRect().top + p.y}px)`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.life,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Foreground Overlay for atmosphere */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/40" />

    </div>
  );
};

export default GeneratedComponent;