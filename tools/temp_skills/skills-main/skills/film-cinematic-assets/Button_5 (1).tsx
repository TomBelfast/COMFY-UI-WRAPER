const GeneratedComponent = () => {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isExploded, setIsExploded] = React.useState(false);
  
  // Configuration
  const PARTICLE_DENSITY = 4; // Lower is denser (pixels to skip)
  const MOUSE_RADIUS = 60;
  const RETURN_SPEED = 0.08;
  const FRICTION = 0.9;
  const EXPLOSION_FORCE = 40;
  const FONT_SIZE = 40;
  
  // Refs for animation loop to avoid dependency staleness
  const particles = React.useRef([]);
  const mouse = React.useRef({ x: -1000, y: -1000 });
  const animationFrameId = React.useRef();
  const stateRef = React.useRef({ isExploded: false });

  // Update ref when state changes
  React.useEffect(() => {
    stateRef.current.isExploded = isExploded;
  }, [isExploded]);

  // Initialize Particles based on Text
  const initParticles = React.useCallback((width, height, ctx) => {
    particles.current = [];
    
    // Draw text to an off-screen canvas (or current cleared canvas) to sample pixel data
    ctx.clearRect(0, 0, width, height);
    ctx.font = `900 ${FONT_SIZE}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CLICK ME', width / 2, height / 2);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Sample pixels
    for (let y = 0; y < height; y += PARTICLE_DENSITY) {
      for (let x = 0; x < width; x += PARTICLE_DENSITY) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 128) {
          // It's a pixel of the text
          particles.current.push({
            x: Math.random() * width, // Start random positions
            y: Math.random() * height,
            originX: x,
            originY: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`, // Cyan/Blue range
            size: Math.random() * 1.5 + 1,
          });
        }
      }
    }
    
    // Add some "border" particles for button shape definition
    const borderStep = 8;
    for(let x = 0; x < width; x+= borderStep) {
        // Top and bottom
        [0, height-1].forEach(y => {
             particles.current.push(createBorderParticle(x, y, width, height));
        });
    }
    for(let y = 0; y < height; y+= borderStep) {
        // Left and right
        [0, width-1].forEach(x => {
            particles.current.push(createBorderParticle(x, y, width, height));
        });
    }

  }, []);

  const createBorderParticle = (x, y, w, h) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        originX: x,
        originY: y,
        vx: 0,
        vy: 0,
        color: `hsl(${280 + Math.random() * 40}, 100%, 60%)`, // Purple/Pink
        size: Math.random() * 1.5 + 0.5,
        isBorder: true
  });

  // Animation Loop
  const render = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Fade effect for trails (optional, but clean clear is better for sharp text)
    ctx.clearRect(0, 0, width, height);

    particles.current.forEach((p) => {
      // 1. Calculate Distances
      const dx = mouse.current.x - p.x;
      const dy = mouse.current.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const homeDx = p.originX - p.x;
      const homeDy = p.originY - p.y;
      const homeDist = Math.sqrt(homeDx * homeDx + homeDy * homeDy);

      // 2. Physics Forces
      
      // Explosion Force
      if (stateRef.current.isExploded) {
        // Explode outward from center
        const centerX = width / 2;
        const centerY = height / 2;
        const exDx = p.x - centerX;
        const exDy = p.y - centerY;
        const angle = Math.atan2(exDy, exDx);
        
        // Add massive velocity
        p.vx += Math.cos(angle) * (Math.random() * EXPLOSION_FORCE * 0.1);
        p.vy += Math.sin(angle) * (Math.random() * EXPLOSION_FORCE * 0.1);
      } 
      // Repel Force (Mouse)
      else if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const angle = Math.atan2(dy, dx);
        p.vx -= Math.cos(angle) * force * 5;
        p.vy -= Math.sin(angle) * force * 5;
      }
      // Return to Home Force
      else {
        p.vx += homeDx * (p.isBorder ? RETURN_SPEED * 0.5 : RETURN_SPEED);
        p.vy += homeDy * (p.isBorder ? RETURN_SPEED * 0.5 : RETURN_SPEED);
      }

      // 3. Apply Velocity & Friction
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.x += p.vx;
      p.y += p.vy;

      // 4. Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    animationFrameId.current = requestAnimationFrame(render);
  }, []);

  // Handle Resize & Init
  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Set actual canvas size for sharpness (dpr)
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = width * dpr;
        canvasRef.current.height = height * dpr;
        
        // Scale context
        const ctx = canvasRef.current.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // Re-init particles with logic dimensions
        initParticles(width, height, ctx);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Start loop
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [initParticles, render]);

  // Mouse Handlers
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouse.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    mouse.current = { x: -1000, y: -1000 };
    setIsHovered(false);
  };

  const handleClick = () => {
    if (isExploded) return;
    
    setIsExploded(true);
    
    // Reset after a delay to reform the button
    setTimeout(() => {
      setIsExploded(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(22,78,99,0.2),_rgba(2,6,23,1))] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Interactive Button */}
      <div className="relative group">
        
        {/* Glow effect behind button */}
        <div 
          className={`absolute -inset-1 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg blur opacity-20 transition duration-1000 group-hover:opacity-60 group-hover:duration-200 ${isExploded ? 'opacity-0 duration-75' : ''}`} 
        />

        <button
          ref={containerRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-64 h-20 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-800/50 shadow-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 active:scale-95 transition-transform duration-100 ease-out cursor-pointer overflow-hidden"
          aria-label="Click me to explode particles"
        >
          {/* Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
            style={{ width: '100%', height: '100%' }}
          />
          
          {/* Fallback/Screen Reader Text (Hidden Visually if Canvas works, but kept for structure) */}
          <span className="sr-only">Click Me</span>
          
          {/* Optional: Subtle Scanline overlay for aesthetic */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
        </button>

        {/* Status Text (Optional decorative) */}
        <div className={`absolute -bottom-12 left-0 right-0 text-center text-xs font-mono tracking-[0.2em] text-cyan-500/50 transition-all duration-500 ${isExploded ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
          {isHovered ? 'SYSTEM READY' : 'WAITING FOR INPUT'}
        </div>

      </div>
      
      {/* Decorative Corner UI */}
      <div className="fixed top-8 left-8 text-xs font-mono text-slate-700">
         <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           PARTICLE ENGINE: ONLINE
         </div>
      </div>
    </div>
  );
};

export default GeneratedComponent;