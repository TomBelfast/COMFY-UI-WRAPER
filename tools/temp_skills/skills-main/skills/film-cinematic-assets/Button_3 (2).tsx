const GeneratedComponent = () => {
  const [status, setStatus] = React.useState('off'); // 'off' | 'power-up' | 'on' | 'short' | 'broken'
  const [sparks, setSparks] = React.useState([]);
  const buttonRef = React.useRef(null);
  const { Zap, RefreshCw } = window.LucideReact || { Zap: () => null, RefreshCw: () => null };

  // Audio Context Simulation (Visual only, but timings match sound design)
  // Timings:
  // 0ms: Mount
  // 500ms: Attempt Power On
  // 500ms - 2000ms: Flicker/Struggle
  // 2000ms: Stable On

  React.useEffect(() => {
    let timeout;
    
    // Initial Power Up Sequence
    const powerUpSequence = () => {
      setStatus('power-up');
      
      // Simulate erratic starter
      setTimeout(() => {
        setStatus('on');
      }, 1800);
    };

    timeout = setTimeout(powerUpSequence, 500);

    return () => clearTimeout(timeout);
  }, []);

  // Handle Repair/Reset if broken
  React.useEffect(() => {
    if (status === 'broken') {
      const timer = setTimeout(() => {
        setStatus('off');
        setTimeout(() => setStatus('power-up'), 100);
        setTimeout(() => setStatus('on'), 2000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleClick = (e) => {
    if (status !== 'on') return;

    // Trigger Short Circuit / Burnout
    setStatus('short');

    // Create Sparks
    const rect = buttonRef.current.getBoundingClientRect();
    const newSparks = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: e.clientX - rect.left + (Math.random() - 0.5) * 40,
      y: e.clientY - rect.top + (Math.random() - 0.5) * 40,
      angle: Math.random() * 360,
      speed: 2 + Math.random() * 5,
      size: 2 + Math.random() * 4,
    }));
    setSparks(newSparks);

    // Transition to Broken
    setTimeout(() => {
      setStatus('broken');
      setSparks([]);
    }, 400); // Duration of the "short" bright flash
  };

  // Dynamic Styles based on state
  const getContainerStyles = () => {
    switch (status) {
      case 'off': return 'opacity-20 scale-95 grayscale';
      case 'power-up': return 'animate-neon-flicker opacity-100';
      case 'on': return 'opacity-100 shadow-[0_0_50px_-10px_rgba(217,70,239,0.5)]';
      case 'short': return 'opacity-100 scale-105 brightness-200 contrast-200 shake-hard';
      case 'broken': return 'opacity-30 grayscale scale-95 rotate-2 transition-all duration-1000 ease-out';
      default: return '';
    }
  };

  const getButtonStyles = () => {
    const base = "relative group isolate px-12 py-5 border-2 rounded-lg font-mono text-xl tracking-widest uppercase transition-all duration-100 ease-out select-none overflow-hidden ";
    
    if (status === 'broken') {
      return base + "border-zinc-700 text-zinc-600 bg-transparent cursor-not-allowed";
    }

    if (status === 'short') {
      return base + "border-white bg-white text-black shadow-[0_0_100px_white]";
    }

    // Default Neon Look (On / Power-up)
    return base + "border-fuchsia-500 text-fuchsia-400 bg-fuchsia-950/20 shadow-[0_0_20px_rgba(217,70,239,0.3),inset_0_0_10px_rgba(217,70,239,0.2)] hover:bg-fuchsia-900/30 hover:shadow-[0_0_40px_rgba(217,70,239,0.6),inset_0_0_20px_rgba(217,70,239,0.4)] active:scale-95 cursor-pointer";
  };

  const getTextStyles = () => {
    if (status === 'broken') return "text-zinc-700";
    if (status === 'short') return "text-black font-black";
    return "drop-shadow-[0_0_5px_rgba(217,70,239,0.8)] group-hover:drop-shadow-[0_0_15px_rgba(217,70,239,1)]";
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[400px] bg-neutral-950 p-8 overflow-hidden relative">
      <style>
        {`
          @keyframes flicker {
            0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
              opacity: 1;
              box-shadow: 0 0 20px rgba(217,70,239,0.5), inset 0 0 10px rgba(217,70,239,0.4);
            }
            20%, 24%, 55% {
              opacity: 0.2;
              box-shadow: none;
            }
          }
          .animate-neon-flicker {
            animation: flicker 2s linear forwards;
          }
          
          @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
          }
          .shake-hard {
            animation: shake 0.1s cubic-bezier(.36,.07,.19,.97) both infinite;
          }

          @keyframes fly-spark {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0); opacity: 0; }
          }
        `}
      </style>

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-neutral-950/80 to-neutral-950 pointer-events-none" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
            backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}
      />

      {/* Main Button Container */}
      <div className={`relative transition-all duration-300 ${getContainerStyles()}`}>
        
        {/* Connection Wires */}
        <div className="absolute -left-12 top-1/2 w-12 h-1 bg-neutral-800 -z-10 rounded-l-full shadow-inner">
           <div className={`w-full h-full bg-fuchsia-900 transition-opacity duration-100 ${status === 'on' || status === 'power-up' ? 'opacity-100' : 'opacity-0'}`} />
        </div>
        <div className="absolute -right-12 top-1/2 w-12 h-1 bg-neutral-800 -z-10 rounded-r-full shadow-inner">
           <div className={`w-full h-full bg-fuchsia-900 transition-opacity duration-100 ${status === 'on' || status === 'power-up' ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        <button
          ref={buttonRef}
          onClick={handleClick}
          disabled={status === 'broken'}
          className={getButtonStyles()}
        >
          {/* Glass Reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            {status !== 'broken' ? (
              <Zap className={`w-5 h-5 ${status === 'on' ? 'animate-[pulse_0.1s_ease-in-out_infinite] opacity-80' : ''}`} />
            ) : (
              <span className="w-5 h-5 block" />
            )}
            
            <span className={getTextStyles()}>
              {status === 'broken' ? 'BROKEN' : 'CLICK ME'}
            </span>

            {/* Subtle tube flicker overlay */}
            {(status === 'on' || status === 'power-up') && (
               <div className="absolute inset-0 bg-fuchsia-500 mix-blend-overlay opacity-10 animate-[pulse_0.05s_ease-in-out_infinite] pointer-events-none" />
            )}
          </div>
          
          {/* Sparks Rendering */}
          {status === 'short' && sparks.map(spark => (
            <div
              key={spark.id}
              className="absolute w-1 h-1 bg-white rounded-full z-50 pointer-events-none"
              style={{
                left: spark.x,
                top: spark.y,
                '--tw-translate-x': `${Math.cos(spark.angle) * spark.speed * 50}px`,
                '--tw-translate-y': `${Math.sin(spark.angle) * spark.speed * 50}px`,
                animation: `fly-spark 0.4s ease-out forwards`,
                boxShadow: '0 0 10px 2px rgba(255,255,255,0.8)'
              }}
            />
          ))}
        </button>

        {/* Halo Glow Underneath */}
        <div className={`absolute -inset-4 bg-fuchsia-500/20 blur-2xl -z-10 rounded-full transition-opacity duration-300 ${status === 'on' ? 'opacity-100' : 'opacity-0'}`} />

      </div>

      {/* Instructions / Status Text */}
      <div className="absolute bottom-12 text-neutral-500 font-mono text-xs tracking-widest uppercase opacity-60">
        {status === 'broken' ? (
          <div className="flex items-center gap-2 text-red-900 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            System Failure... Rebooting
          </div>
        ) : (
          "High Voltage • Do Not Touch"
        )}
      </div>
    </div>
  );
};

export default GeneratedComponent;