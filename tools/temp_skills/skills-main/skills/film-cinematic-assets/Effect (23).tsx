const GeneratedComponent = () => {
  const { Sparkles, Zap, Wand2 } = window.LucideReact || {};
  const [isHovered, setIsHovered] = React.useState(false);

  // Custom animation styles injected into the component
  const styleInjection = `
    @keyframes rotating-border {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes wave-pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.05); opacity: 0.8; }
    }

    .animate-border-spin {
      animation: rotating-border 3s linear infinite;
    }
    
    .animate-fast-spin {
      animation: rotating-border 1.5s linear infinite;
    }
  `;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 p-8 overflow-hidden font-sans">
      <style>{styleInjection}</style>

      {/* Background Ambience */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px] mix-blend-screen animate-pulse" />
      </div>

      <div className="z-10 flex flex-col items-center gap-8">
        
        {/* Main Button Component */}
        <button
          className="group relative inline-flex items-center justify-center rounded-full p-[3px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-neutral-950 transition-transform duration-200 active:scale-95"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Generata Button"
        >
          {/* 
             THE COLORFUL WAVE EFFECT 
             We use a conic gradient scaled up significantly (inset-[-1000%]) so the center point is stable,
             and we rotate it behind the button content.
             The mask (overflow-hidden on parent) cuts it to just the border.
          */}
          <div 
            className={`absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#a855f7_40%,#ec4899_50%,#3b82f6_60%,#0000_100%)] ${isHovered ? 'animate-fast-spin' : 'animate-border-spin'} will-change-transform`}
            style={{ filter: 'blur(10px)' }} // Adds a soft glow to the wave itself
          />
          <div 
            className={`absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#a855f7_40%,#ec4899_50%,#3b82f6_60%,#0000_100%)] ${isHovered ? 'animate-fast-spin' : 'animate-border-spin'} will-change-transform opacity-100`}
          />

          {/* Button Content Container - Sits on top of the spinning gradient */}
          <span className="relative inline-flex h-14 w-48 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-2 text-base font-semibold text-white backdrop-blur-xl transition-all duration-300 group-hover:bg-neutral-900/90 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:via-pink-400 group-hover:to-blue-400">
            {Sparkles && (
              <Sparkles 
                className={`w-5 h-5 transition-colors duration-300 ${isHovered ? 'text-purple-400' : 'text-purple-500'}`} 
              />
            )}
            <span className="tracking-widest uppercase">GENERATA</span>
          </span>

          {/* Outer Glow / Reflection for extra polish */}
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40" />
        </button>

        {/* Instructions / Context (Optional) */}
        <p className="text-neutral-500 text-sm font-medium tracking-wide animate-pulse">
          Kliknij aby wygenerować
        </p>

      </div>
    </div>
  );
};

export default GeneratedComponent;