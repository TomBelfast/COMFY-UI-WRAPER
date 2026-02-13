const GeneratedComponent = () => {
  const { useState, useEffect, useRef, useCallback } = React;
  const { Zap } = LucideReact;

  // --- Internal State & Logic ---
  const [powerState, setPowerState] = useState('off'); // off, flickering, on, burnout, recovering
  const [sparks, setSparks] = useState([]);
  const buttonRef = useRef(null);

  // Sound effect simulation via visuals: "Buzz" intensity
  const [buzzIntensity, setBuzzIntensity] = useState(0);

  // --- Animation Lifecycle ---
  useEffect(() => {
    // 1. Initial Power On Sequence
    let timer;
    const startSequence = () => {
      setPowerState('flickering');
      // Simulate the random nature of a neon sign starting up
      const flickerDuration = 1200; 
      timer = setTimeout(() => {
        setPowerState('on');
      }, flickerDuration);
    };

    // Small delay before start to let UI settle
    const initTimer = setTimeout(startSequence, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(initTimer);
    };
  }, []);

  // --- Interaction Handlers ---
  const handleHoverStart = () => {
    if (powerState === 'on') setBuzzIntensity(1);
  };

  const handleHoverEnd = () => {
    if (powerState === 'on') setBuzzIntensity(0);
  };

  const handleClick = (e) => {
    if (powerState !== 'on') return;

    // Trigger Burnout
    setPowerState('burnout');
    createSparks(e.clientX, e.clientY);

    // Reset after some time
    setTimeout(() => {
      setPowerState('recovering');
      setTimeout(() => {
        setPowerState('off');
        // Restart sequence
        setTimeout(() => {
          setPowerState('flickering');
          setTimeout(() => setPowerState('on'), 1200);
        }, 100);
      }, 500);
    }, 2000);
  };

  // --- Particle System for Sparks ---
  const createSparks = (x, y) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Center sparks on button if clicked or specific coords
    const originX = x || rect.left + rect.width / 2;
    const originY = y || rect.top + rect.height / 2;

    const newSparks = Array.from({ length: 12 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 12;
      const velocity = 2 + Math.random() * 4;
      return {
        id: Date.now() + i,
        dx: Math.cos(angle) * velocity,
        dy: Math.sin(angle) * velocity,
        life: 1.0,
        x: originX - rect.left, // relative to button for easier containment if needed, but we'll use fixed overlay
        y: originY - rect.top
      };
    });
    setSparks(newSparks);
  };

  // Animate Sparks
  useEffect(() => {
    if (sparks.length === 0) return;

    let animationFrame;
    const updateSparks = () => {
      setSparks(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + p.dx,
          y: p.y + p.dy + 0.5, // Gravity
          life: p.life - 0.05
        })).filter(p => p.life > 0)
      );
      animationFrame = requestAnimationFrame(updateSparks);
    };
    animationFrame = requestAnimationFrame(updateSparks);
    return () => cancelAnimationFrame(animationFrame);
  }, [sparks.length]);

  // --- CSS Generator ---
  // We generate dynamic styles based on state to keep things encapsulated but powerful
  const getNeonStyles = () => {
    const mainColor = '#ff00ff'; // Neon Magenta
    const secondaryColor = '#00ffff'; // Neon Cyan accent
    
    // Base glow layers
    const glowOff = `0 0 0 transparent`;
    const glowFlicker = `0 0 2px ${mainColor}, 0 0 5px ${mainColor}`;
    const glowOn = `
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px ${mainColor},
      0 0 40px ${mainColor},
      0 0 80px ${mainColor},
      0 0 90px ${mainColor},
      0 0 100px ${mainColor},
      0 0 150px ${mainColor}
    `;
    const glowBurnout = `0 0 50px #fff, 0 0 100px #fff`; // Flash

    // Text Shadow
    const textGlowOn = `
      0 0 2px #fff,
      0 0 5px #fff,
      0 0 10px ${mainColor},
      0 0 20px ${mainColor},
      0 0 30px ${mainColor},
      0 0 40px ${mainColor},
      0 0 55px ${mainColor}
    `;

    let currentBoxShadow = glowOff;
    let currentTextShadow = 'none';
    let currentOpacity = 0.1;
    let currentFilter = 'brightness(0.5) grayscale(1)';
    let transform = 'scale(1)';

    switch (powerState) {
      case 'off':
        currentOpacity = 0.2;
        currentBoxShadow = 'none';
        break;
      case 'flickering':
        // Animation handled by CSS class
        currentOpacity = 1;
        currentFilter = 'none';
        break;
      case 'on':
        currentOpacity = 1;
        currentBoxShadow = glowOn;
        currentTextShadow = textGlowOn;
        currentFilter = 'brightness(1)';
        transform = buzzIntensity ? 'scale(1.02)' : 'scale(1)';
        break;
      case 'burnout':
        currentOpacity = 1;
        currentBoxShadow = glowBurnout; // Flash
        currentFilter = 'brightness(3) contrast(2)'; // Blinding white
        transform = 'scale(0.95)';
        break;
      case 'recovering':
        currentOpacity = 0.1;
        currentBoxShadow = 'none';
        currentFilter = 'grayscale(1) brightness(0.2)';
        break;
      default: break;
    }

    return {
      boxShadow: currentBoxShadow,
      textShadow: currentTextShadow,
      opacity: currentOpacity,
      filter: currentFilter,
      transform,
      borderColor: powerState === 'on' || powerState === 'flickering' ? '#fff' : '#333',
      color: powerState === 'on' || powerState === 'flickering' ? '#fff' : '#444',
      backgroundColor: powerState === 'on' ? 'rgba(255, 0, 255, 0.05)' : 'rgba(0,0,0,0.5)',
    };
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-neutral-950 overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#2a0a2a_0%,_#000_70%)] opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none" />
      </div>

      <style>{`
        @keyframes flicker-in {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
            opacity: 0.99;
            filter: brightness(1);
            box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00ff, 0 0 40px #ff00ff;
          }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
            opacity: 0.4;
            filter: brightness(0.5);
            box-shadow: none;
          }
        }

        @keyframes buzz {
          0% { transform: translate(0.5px, 0.5px) rotate(0deg); }
          10% { transform: translate(-0.5px, -0.5px) rotate(-0.5deg); }
          20% { transform: translate(-1.5px, 0.5px) rotate(0.5deg); }
          30% { transform: translate(0.5px, -0.5px) rotate(0deg); }
          40% { transform: translate(0.5px, 0.5px) rotate(0.5deg); }
          50% { transform: translate(-0.5px, 1.5px) rotate(-0.5deg); }
          60% { transform: translate(-0.5px, -0.5px) rotate(0deg); }
          70% { transform: translate(0.5px, 0.5px) rotate(0.5deg); }
          80% { transform: translate(-0.5px, -0.5px) rotate(-0.5deg); }
          90% { transform: translate(0.5px, -0.5px) rotate(0deg); }
          100% { transform: translate(0.5px, 0.5px) rotate(0deg); }
        }

        @keyframes spark-fly {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }

        .neon-flicker {
          animation: flicker-in 1.2s infinite steps(1);
        }

        .neon-buzz {
          animation: buzz 0.1s infinite linear;
        }

        .neon-text-shadow {
          text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00ff, 0 0 30px #ff00ff, 0 0 40px #ff00ff;
        }
      `}</style>

      {/* Main Button Container */}
      <div className="relative group z-10">
        <button
          ref={buttonRef}
          onClick={handleClick}
          onMouseEnter={handleHoverStart}
          onMouseLeave={handleHoverEnd}
          style={getNeonStyles()}
          className={`
            relative px-12 py-6 
            border-[3px] rounded-2xl
            text-4xl font-black uppercase tracking-widest
            transition-all duration-75 ease-[cubic-bezier(0.25,1,0.5,1)]
            cursor-pointer select-none outline-none
            ${powerState === 'flickering' ? 'neon-flicker' : ''}
            ${powerState === 'on' && buzzIntensity ? 'neon-buzz' : ''}
            ${powerState === 'burnout' ? 'duration-0' : 'duration-300'}
          `}
        >
          {/* Inner Light Tube Simulation */}
          <div className={`absolute inset-0 rounded-xl border border-white/20 pointer-events-none ${powerState === 'on' ? 'opacity-100' : 'opacity-0'}`} />
          
          <div className="flex items-center gap-4 relative z-20">
            <Zap 
              className={`w-8 h-8 transition-opacity duration-100 ${powerState === 'on' ? 'text-cyan-300 fill-cyan-100' : 'text-neutral-700'}`} 
              style={{ filter: powerState === 'on' ? 'drop-shadow(0 0 8px cyan)' : 'none' }}
            />
            <span className="relative">
              CLICK ME
              {/* Faulty letter flicker overlay */}
              {powerState === 'on' && (
                 <span className="absolute left-0 top-0 text-white/80 animate-pulse opacity-50 mix-blend-overlay">CLICK ME</span>
              )}
            </span>
          </div>

          {/* Burnout Smoke / Overlay */}
          {powerState === 'recovering' && (
            <div className="absolute inset-0 bg-black/60 rounded-2xl backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-sm text-neutral-500 font-mono">SYSTEM REBOOT</span>
            </div>
          )}
        </button>

        {/* Electrical Sparks Layer */}
        {sparks.map(spark => (
          <div
            key={spark.id}
            className="absolute bg-white rounded-full pointer-events-none z-50 mix-blend-screen"
            style={{
              left: '50%', // Centered relative to button wrapper, adjusted by particle x/y
              top: '50%',
              width: Math.max(2, spark.life * 4) + 'px',
              height: Math.max(2, spark.life * 4) + 'px',
              transform: `translate(${spark.x}px, ${spark.y}px)`,
              opacity: spark.life,
              boxShadow: `0 0 ${spark.life * 10}px #00ffff`
            }}
          />
        ))}

        {/* Floor Reflection */}
        <div 
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[120%] h-16 bg-gradient-to-t from-transparent to-fuchsia-500/20 blur-xl rounded-[100%] transition-opacity duration-300 pointer-events-none"
          style={{ opacity: powerState === 'on' ? 0.4 : 0 }}
        />
      </div>

      {/* Instructions / Footer */}
      <div className="absolute bottom-10 text-neutral-600 font-mono text-xs tracking-widest uppercase opacity-40">
        Interactivity: Hover to Buzz • Click to Short Circuit
      </div>
    </div>
  );
};

export default GeneratedComponent;