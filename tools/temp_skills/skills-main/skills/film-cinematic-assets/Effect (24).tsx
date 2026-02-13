const GeneratedComponent = () => {
  const { Zap, Cpu, CheckCircle2, Sparkles, Lock, RefreshCw } = LucideReact;
  const [status, setStatus] = React.useState('idle'); // 'idle' | 'generating' | 'success'
  const [progress, setProgress] = React.useState(0);
  const cardRef = React.useRef(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  // Handle generation simulation
  React.useEffect(() => {
    if (status === 'generating') {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          setTimeout(() => setStatus('success'), 500);
        }
        setProgress(currentProgress);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Handle 3D Tilt Logic
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize to -1 to 1
    const xPct = (x / rect.width - 0.5) * 2;
    const yPct = (y / rect.height - 0.5) * 2;

    setMousePos({ x, y });
    
    // Only apply tilt if success or if specifically desired in other states
    // We'll apply a subtle tilt in idle, and intense tilt in success
    const intensity = status === 'success' ? 20 : 5;
    setTilt({ x: yPct * -intensity, y: xPct * intensity });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setMousePos({ x: 0, y: 0 });
  };

  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setTilt({ x: 0, y: 0 });
  };

  // Dynamic Styles
  const transformStyle = {
    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1, 1, 1)`,
    transition: 'transform 0.1s ease-out',
  };

  const glowStyle = status === 'success' ? {
    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.4), transparent 80%)`,
  } : {};

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-8 font-sans overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-purple-900 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-900 rounded-full blur-[120px]" />
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-scanline {
          animation: scanline 2s linear infinite;
        }
      `}</style>

      {/* Main Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={transformStyle}
        className={`
          relative w-full max-w-md h-[600px] bg-neutral-900/80 backdrop-blur-xl border 
          rounded-2xl shadow-2xl overflow-hidden flex flex-col will-change-transform
          ${status === 'success' ? 'border-purple-500/50 shadow-purple-500/20' : 'border-white/10 shadow-black/50'}
          transition-colors duration-500
        `}
      >
        {/* Holographic Overlay (Only Visible on Success Hover) */}
        {status === 'success' && (
          <div 
            className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={glowStyle}
          />
        )}
        
        {/* Animated Grid Background inside card */}
        <div className="absolute inset-0 z-0 opacity-10" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }} 
        />

        {/* --- Header Section --- */}
        <div className="relative z-20 p-6 flex justify-between items-center border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status === 'success' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'} transition-colors duration-500`}>
              <Cpu size={20} />
            </div>
            <span className="font-bold text-white tracking-wide text-sm">
              {status === 'idle' ? 'SYSTEM_READY' : status === 'generating' ? 'PROCESSING...' : 'ASSET_GENERATED'}
            </span>
          </div>
          {status === 'success' && (
            <button onClick={reset} className="text-white/50 hover:text-white transition-colors">
              <RefreshCw size={18} />
            </button>
          )}
        </div>

        {/* --- Main Content Area --- */}
        <div className="relative z-20 flex-1 p-6 flex flex-col items-center justify-center text-center">
          
          {/* IDLE STATE */}
          {status === 'idle' && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
              <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative group">
                <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin-slow duration-[10s]" />
                <Lock size={40} className="text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Neural Synthesizer</h2>
                <p className="text-white/50 text-sm max-w-[260px]">
                  Initialize the quantum core to generate a unique digital asset.
                </p>
              </div>
              <button
                onClick={() => setStatus('generating')}
                className="group relative px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center gap-2">
                  <Zap size={18} className="group-hover:text-yellow-300 transition-colors" />
                  INITIATE
                </span>
              </button>
            </div>
          )}

          {/* GENERATING STATE */}
          {status === 'generating' && (
            <div className="w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">
              <div className="relative w-48 h-48 bg-black/50 rounded-xl border border-blue-500/30 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                {/* Scanning Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,1)] z-10 animate-scanline" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="font-mono text-xs text-blue-400/80 leading-none opacity-50 whitespace-nowrap overflow-hidden">
                     {Array.from({length: 20}).map((_, i) => (
                       <div key={i} style={{transform: `translateX(${Math.random() * 20 - 10}px)`}}>
                         010010111010100101
                       </div>
                     ))}
                   </div>
                </div>
              </div>
              
              <div className="w-full max-w-[240px] space-y-2">
                <div className="flex justify-between text-xs font-mono text-blue-400">
                  <span>COMPILING...</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-blue-900/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in-90 duration-500">
              {/* Result Visual */}
              <div className="relative group perspective-1000 w-full flex justify-center">
                <div className="relative w-64 h-64 rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105 border border-purple-500/30 bg-black">
                  <img 
                    src="https://picsum.photos/id/132/600/600" 
                    alt="Generated Asset"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  {/* Overlay text on image */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                     <h3 className="text-white font-bold text-lg">Neon Artifact #842</h3>
                     <p className="text-purple-300 text-xs">Legendary Rarity</p>
                  </div>
                  
                  {/* Shiny Glare effect inside image container */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" style={{ transform: `translate(${mousePos.x/10}px, ${mousePos.y/10}px)` }} />
                </div>
              </div>

              {/* Stats / Info */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                <div className="bg-white/5 border border-white/10 p-2 rounded text-center">
                  <p className="text-xs text-white/40 uppercase">Power</p>
                  <p className="text-white font-mono">98.4%</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-2 rounded text-center">
                  <p className="text-xs text-white/40 uppercase">Stability</p>
                  <p className="text-white font-mono">100%</p>
                </div>
              </div>

              <button className="w-full max-w-[280px] bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all flex justify-center items-center gap-2 group">
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                CLAIM ASSET
              </button>
            </div>
          )}

        </div>

        {/* --- Footer Status Bar --- */}
        <div className="relative z-20 h-8 bg-black/40 border-t border-white/5 flex items-center justify-between px-4 text-[10px] text-white/30 font-mono uppercase">
          <span>ID: {status === 'idle' ? 'NULL' : status === 'generating' ? `GEN-${Math.floor(progress * 482)}` : '842-XF'}</span>
          <div className="flex items-center gap-2">
            <span>SECURE</span>
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'generating' ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default GeneratedComponent;