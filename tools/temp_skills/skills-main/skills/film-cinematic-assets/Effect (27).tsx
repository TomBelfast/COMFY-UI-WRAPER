const GeneratedComponent = () => {
  const { useState, useRef, useEffect, useCallback } = React;
  const { Zap, Rocket, Activity, ChevronRight } = window.LucideReact || { 
    Zap: () => null, 
    Rocket: () => null, 
    Activity: () => null, 
    ChevronRight: () => null 
  };

  const buttonRef = useRef(null);
  const glowRef = useRef(null);
  const reflectionRef = useRef(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Configuration for the physics/feel
  const ROTATION_RANGE = 18; // Degrees
  const TRANSLATE_RANGE = 8; // Pixels
  const PERSPECTIVE = 800;

  const handleMouseMove = useCallback((e) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center normalized (-1 to 1)
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);

    // Apply rotation based on mouse position
    const rotateX = -mouseY * ROTATION_RANGE;
    const rotateY = mouseX * ROTATION_RANGE;

    // Apply translation for "magnetic" feel
    const translateX = mouseX * TRANSLATE_RANGE;
    const translateY = mouseY * TRANSLATE_RANGE;

    // Update CSS variables for high performance
    buttonRef.current.style.setProperty('--r-x', `${rotateX}deg`);
    buttonRef.current.style.setProperty('--r-y', `${rotateY}deg`);
    buttonRef.current.style.setProperty('--t-x', `${translateX}px`);
    buttonRef.current.style.setProperty('--t-y', `${translateY}px`);

    // Move the glow effect
    if (glowRef.current) {
      glowRef.current.style.transform = `translate(${mouseX * 50}px, ${mouseY * 50}px)`;
    }

    // Move the reflection gradient
    if (reflectionRef.current) {
      const percentageX = (mouseX + 1) * 50;
      const percentageY = (mouseY + 1) * 50;
      reflectionRef.current.style.background = `radial-gradient(circle at ${percentageX}% ${percentageY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`;
    }

  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
    
    if (buttonRef.current) {
      // Reset transforms with a smooth transition handled by CSS class
      buttonRef.current.style.setProperty('--r-x', `0deg`);
      buttonRef.current.style.setProperty('--r-y', `0deg`);
      buttonRef.current.style.setProperty('--t-x', `0px`);
      buttonRef.current.style.setProperty('--t-y', `0px`);
    }
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-8 overflow-hidden relative">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.3),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-900 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-fuchsia-900 blur-[100px] rounded-full mix-blend-screen" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12">
        
        {/* The 3D Button Container */}
        <div 
          className="relative perspective-container"
          style={{ perspective: `${PERSPECTIVE}px` }}
        >
          <button
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`
              relative group
              w-64 h-20 
              outline-none focus:outline-none
              [transform-style:preserve-3d]
              [transform:rotateX(var(--r-x,0deg))_rotateY(var(--r-y,0deg))_translate3d(var(--t-x,0px),var(--t-y,0px),0px)]
              transition-transform duration-100 ease-out
              ${!isHovered ? 'duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]' : ''}
              ${isPressed ? 'scale-95' : 'scale-100'}
            `}
          >
            {/* 1. Back Glow / Shadow (Furthest back) */}
            <div 
              ref={glowRef}
              className={`
                absolute -inset-4 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500
                blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500
                [transform:translateZ(-50px)] will-change-transform
              `}
            />

            {/* 2. Dark Base Block (The "Side" of the 3D button) */}
            <div className="absolute inset-0 rounded-xl bg-neutral-900 border border-neutral-700 [transform:translateZ(-10px)] shadow-2xl" />

            {/* 3. The Main Body (Front Face) */}
            <div className={`
              absolute inset-0 rounded-xl 
              bg-neutral-900/90 backdrop-blur-md
              border border-white/10
              overflow-hidden
              flex items-center justify-center
              [transform:translateZ(10px)]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(255,255,255,0.05)]
            `}>
              
              {/* Internal Animated Gradient Border/Sheen */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_90deg,#8b5cf6_180deg,transparent_270deg,transparent_360deg)] opacity-30 mix-blend-overlay" />
              </div>

              {/* Surface Texture (Grid) */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[size:4px_4px]" />

              {/* Interactive Reflection Overlay */}
              <div 
                ref={reflectionRef}
                className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Button Content */}
              <div className={`
                relative z-30 flex items-center gap-3
                text-white font-bold tracking-widest text-lg
                transition-transform duration-200
                ${isPressed ? 'scale-95' : 'scale-100'}
                [text-shadow:0_2px_10px_rgba(139,92,246,0.5)]
              `}>
                <div className={`
                  relative flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-violet-600 to-indigo-600 
                  shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow duration-300
                `}>
                  <Zap size={18} className={`text-white transition-all duration-300 ${isHovered ? 'scale-110 fill-white' : ''}`} />
                  
                  {/* Icon Glint */}
                  <div className="absolute inset-0 rounded bg-white/20 animate-pulse opacity-0 group-hover:opacity-100" />
                </div>
                
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-white">
                  LAUNCH
                </span>
                
                <ChevronRight 
                  size={20} 
                  className={`
                    text-violet-400 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    ${isHovered ? 'translate-x-1 opacity-100' : '-translate-x-2 opacity-0'}
                  `} 
                />
              </div>

              {/* Bottom "Led" Strip */}
              <div className={`
                absolute bottom-0 left-0 w-full h-[2px]
                bg-gradient-to-r from-transparent via-cyan-400 to-transparent
                transition-all duration-300 ease-out
                ${isHovered ? 'opacity-100 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'opacity-30'}
              `} />
            </div>

            {/* 4. Click Depth Animation Layer (Visual feedback for pressing) */}
            <div className={`
              absolute inset-0 rounded-xl bg-black/50 pointer-events-none
              transition-opacity duration-100
              ${isPressed ? 'opacity-30' : 'opacity-0'}
              [transform:translateZ(11px)]
            `} />

          </button>
        </div>

        <div className="text-neutral-500 text-sm font-mono tracking-widest flex items-center gap-2">
           SYSTEM READY <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,199,89,0.8)]" />
        </div>
      </div>
    </div>
  );
};

export default GeneratedComponent;