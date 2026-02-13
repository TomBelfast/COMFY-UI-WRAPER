const GeneratedComponent = () => {
  const { Sparkles, Zap, ArrowRight } = LucideReact;
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 p-8 font-sans selection:bg-purple-500/30">
      
      {/* Decorative background elements to show component context */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 flex flex-col items-center gap-12">
        
        {/* Header Text */}
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Generuj Przyszłość
          </h2>
          <p className="text-neutral-400">
            Example of the requested "colorful wave" animation walking around the button border.
          </p>
        </div>

        {/* --- MAIN BUTTON IMPLEMENTATION --- */}
        <div className="group relative">
          {/* 
             Background Glow Layer 
             This creates a diffused ambient light matching the border colors 
          */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 blur-xl transition-all duration-500 group-hover:opacity-60 group-hover:blur-2xl" />

          {/* 
             Main Button Container 
             We use p-[2px] to create the gap for the border to show through 
          */}
          <button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex items-center justify-center overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-95 transition-transform duration-200"
          >
            {/* 
               The Spinning Wave Layer 
               - Uses a conic gradient for the colorful effect.
               - Spins continuously.
               - Large inset ensures coverage during rotation.
            */}
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Alternative Colorful Wave (Always visible or specific style) */}
            {/* Using a full spectrum rainbow for the "colorful" requirement */}
            <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,#ff0000_0deg,#ff8800_45deg,#ffff00_90deg,#00ff00_135deg,#00ffff_180deg,#0000ff_225deg,#ff00ff_270deg,#ff0000_360deg)] will-change-transform" />

            {/* 
               Inner Content Layer 
               - Sits on top of the spinner.
               - Has a dark background to mask the center of the conic gradient.
            */}
            <span className="relative flex h-full w-full items-center gap-2 rounded-full bg-slate-950 px-8 py-4 text-base font-semibold text-white backdrop-blur-3xl transition-colors duration-300 group-hover:bg-slate-900/90">
              <Sparkles 
                className={`h-5 w-5 transition-all duration-300 ${isHovered ? 'text-yellow-300 rotate-12 scale-110' : 'text-slate-400'}`} 
              />
              <span className="tracking-wide">GENERATA</span>
              <div className={`flex items-center overflow-hidden w-0 transition-all duration-300 ${isHovered ? 'w-5 ml-2' : ''}`}>
                 <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </span>
          </button>
        </div>


        {/* --- VARIATION: NEON PULSE (For comparison) --- */}
        <div className="mt-8 pt-8 border-t border-white/10 w-full flex flex-col items-center">
          <p className="text-xs text-neutral-500 mb-6 uppercase tracking-widest font-medium">Alternative Style</p>
          
          <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 group">
            {/* The "Head" of the snake/wave moving around */}
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#333333_50%,#ffffff_100%)] opacity-100 mix-blend-overlay" />
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_85%,#0ea5e9_90%,#8b5cf6_95%,#ec4899_100%)]" />

            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl transition-colors hover:bg-slate-950/80">
              <Zap className="mr-2 h-4 w-4 text-sky-400 fill-sky-400/20" />
              Generata
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default GeneratedComponent;