const GeneratedComponent = () => {
  const { Zap, Sparkles, Wand2 } = window.LucideReact || { 
    Zap: () => null, 
    Sparkles: () => null, 
    Wand2: () => null 
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  // Handle click ripple or active state logic if needed, 
  // currently purely driven by CSS/State for visuals.
  
  return (
    <div className="min-h-[500px] w-full bg-neutral-950 flex flex-col items-center justify-center p-8 font-sans antialiased overflow-hidden relative">
      
      {/* Ambient Background Glows to set the mood */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      {/* 
        MAIN BUTTON COMPONENT 
        Structure:
        1. Outer Wrapper (Grouping)
        2. Rotating Gradient (The "Wave") - blurred for glow
        3. Rotating Gradient (The "Wave") - sharp for border
        4. Inner Background (Blocking the center)
        5. Content (Text + Icon)
      */}
      <button
        className={`
          relative group cursor-pointer select-none
          transition-transform duration-300 cubic-bezier(0.25, 1, 0.5, 1)
          ${isActive ? 'scale-95' : isHovered ? 'scale-110' : 'scale-100'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        onTouchStart={() => setIsActive(true)}
        onTouchEnd={() => setIsActive(false)}
        aria-label="Generate"
      >
        {/* 
          1. The "Wave" Border (Glow Layer) 
          We use a conic gradient that spins.
          The colors create the "colorful wave" effect.
        */}
        <div 
          className={`
            absolute -inset-[3px] rounded-xl opacity-75 blur-lg transition-opacity duration-500
            ${isHovered ? 'opacity-100' : 'opacity-60'}
          `}
          style={{
            background: `conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`,
            animation: 'spin 4s linear infinite'
          }}
        />

        {/* 
          2. The "Wave" Border (Sharp Layer) 
          This is the actual visible border line moving around.
        */}
        <div 
          className="absolute -inset-[2px] rounded-xl"
          style={{
            background: `conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`,
            animation: 'spin 4s linear infinite'
          }}
        />

        {/* 
          3. Inner Container 
          This blocks the center of the gradient, creating the border effect.
        */}
        <div className="relative px-8 py-4 bg-neutral-900 rounded-[10px] flex items-center justify-center gap-3 z-10 w-full h-full border border-white/10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-neutral-800/90">
          
          {/* Animated Icon */}
          <div className={`relative transition-all duration-300 ${isHovered ? 'rotate-12 scale-110 text-yellow-400' : 'text-indigo-400'}`}>
            <Sparkles size={20} fill={isHovered ? "currentColor" : "none"} />
            
            {/* Tiny particles around icon when hovered */}
            {isHovered && (
              <>
                <span className="absolute -top-2 -right-2 w-1 h-1 bg-white rounded-full animate-ping" />
                <span className="absolute -bottom-1 -left-1 w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
              </>
            )}
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-start">
            <span className="text-lg font-bold tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 group-hover:from-white group-hover:to-white">
              GENERATA
            </span>
            <span className="text-[10px] text-neutral-500 tracking-[0.2em] font-medium uppercase group-hover:text-indigo-300 transition-colors">
              AI Powered
            </span>
          </div>

          {/* End Icon (Subtle Arrow/Zap) */}
          <div className={`
             ml-2 text-neutral-500 transition-all duration-300 transform
             ${isHovered ? 'translate-x-1 text-white' : 'translate-x-0'}
          `}>
             <Zap size={16} className={`${isHovered ? 'fill-white' : ''}`} />
          </div>

        </div>

        {/* Optional: Shine effect passing through on click */}
        {isActive && (
           <div className="absolute inset-0 bg-white/20 rounded-[10px] z-20 animate-pulse pointer-events-none mix-blend-overlay" />
        )}
      </button>

      {/* Description / Helper Text */}
      <div className="mt-12 text-center space-y-2 opacity-50">
        <p className="text-sm text-neutral-400 font-mono">
          Interactive "Walking Wave" Border
        </p>
        <p className="text-xs text-neutral-600 max-w-xs mx-auto">
          Hover to intensify the glow. Click to activate active state.
        </p>
      </div>

      {/* Custom Styles for proper spinning animation without tailwind config override */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default GeneratedComponent;