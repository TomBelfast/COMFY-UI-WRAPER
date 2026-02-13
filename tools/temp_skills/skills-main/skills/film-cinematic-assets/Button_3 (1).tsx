const GeneratedComponent = () => {
  const canvasRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const animationRef = React.useRef(null);
  
  // Particle system state
  const particles = React.useRef([]);
  const mouse = React.useRef({ x: -1000, y: -1000, active: false });
  const isExploded = React.useRef(false);
  const explosionTime = React.useRef(0);

  // Configuration
  const PARTICLE_DENSITY = 2; // Step size (lower = more particles, higher = performance)
  const TEXT = "Click Me";
  const FONT_SIZE = 20;
  const FONT_FAMILY = '"Inter", sans-serif';
  const COLOR_PRIMARY = "#38bdf8"; // sky-400
  const COLOR_SECONDARY = "#818cf8"; // indigo-400

  // Physics constants
  const SPRING_STRENGTH = 0.05;
  const FRICTION = 0.92;
  const MOUSE_RADIUS = 60;
  const MOUSE_FORCE = 0.8;
  const EXPLOSION_FORCE = 15;
  const RETURN_SPEED = 0.03;

  // Initialize Canvas & Particles
  const initParticles = React.useCallback((width, height) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    // Draw text to off-screen canvas to sample pixels
    ctx.fillStyle = "white";
    ctx.font = `bold ${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(TEXT, width / 2, height / 2);

    const imageData = ctx.getImageData(0, 0, width, height).data;
    const newParticles = [];

    // Scan pixel data
    for (let y = 0; y < height; y += PARTICLE_DENSITY) {
      for (let x = 0; x < width; x += PARTICLE_DENSITY) {
        const index = (y * width + x) * 4;
        const alpha = imageData[index + 3];

        if (alpha > 128) {
          // Found a pixel that is part of the text
          newParticles.push({
            x: Math.random() * width, // Start random
            y: Math.random() * height,
            originX: x, // Target position
            originY: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color: Math.random() > 0.5 ? COLOR_PRIMARY : COLOR_SECONDARY,
            size: Math.random() * 1.5 + 0.5,
          });
        }
      }
    }
    particles.current = newParticles;
  }, []);

  // Handle Resize
  React.useEffect(() => {
    const updateSize = () => {
      if (buttonRef.current) {
        const { width, height } = buttonRef.current.getBoundingClientRect();
        // Scale for high DPI
        const dpr = window.devicePixelRatio || 1;
        setDimensions({ width: width * dpr, height: height * dpr });
        
        if (canvasRef.current) {
          canvasRef.current.width = width * dpr;
          canvasRef.current.height = height * dpr;
          canvasRef.current.style.width = `${width}px`;
          canvasRef.current.style.height = `${height}px`;
        }
        initParticles(width * dpr, height * dpr);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [initParticles]);

  // Animation Loop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update particles
      particles.current.forEach((p) => {
        // 1. Calculate Force to Return to Origin (Home)
        let dx = p.originX - p.x;
        let dy = p.originY - p.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        // Explosion State Logic
        if (isExploded.current) {
          // If recently exploded, ignore home force briefly
          if (Date.now() - explosionTime.current < 1000) {
            dx = 0;
            dy = 0;
          }
        }

        // Apply Spring Force (Hooke's Law)
        const forceX = dx * SPRING_STRENGTH;
        const forceY = dy * SPRING_STRENGTH;

        p.vx += forceX;
        p.vy += forceY;

        // 2. Mouse Repulsion
        if (!isExploded.current) {
            const mDx = p.x - mouse.current.x;
            const mDy = p.y - mouse.current.y;
            const mDist = Math.sqrt(mDx * mDx + mDy * mDy);

            if (mDist < MOUSE_RADIUS) {
            const angle = Math.atan2(mDy, mDx);
            const force = (MOUSE_RADIUS - mDist) / MOUSE_RADIUS;
            const repelForce = force * MOUSE_FORCE * 5; // Multiplier for stronger effect

            p.vx += Math.cos(angle) * repelForce;
            p.vy += Math.sin(angle) * repelForce;
            }
        }

        // 3. Friction
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // 4. Update Position
        p.x += p.vx;
        p.y += p.vy;

        // 5. Draw
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow
        if (Math.random() > 0.98) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
        } else {
            ctx.shadowBlur = 0;
        }
      });

      // Check if we should reset explosion state
      if (isExploded.current && Date.now() - explosionTime.current > 1500) {
        // Slowly bring them back? 
        // The spring force naturally brings them back once we stop overriding dx/dy
        // We just toggle the flag off to let them return.
        isExploded.current = false;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, [dimensions]);

  // Interaction Handlers
  const handleMouseMove = (e) => {
    if (buttonRef.current && canvasRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      mouse.current = {
        x: (e.clientX - rect.left) * dpr,
        y: (e.clientY - rect.top) * dpr,
        active: true,
      };
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    mouse.current = { x: -1000, y: -1000, active: false };
    setIsHovered(false);
  };

  const handleClick = (e) => {
    if (isExploded.current) return;

    isExploded.current = true;
    explosionTime.current = Date.now();

    // Trigger visual explosion physics
    const rect = buttonRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const clickX = (e.clientX - rect.left) * dpr;
    const clickY = (e.clientY - rect.top) * dpr;

    particles.current.forEach((p) => {
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Randomize explosion direction slightly for chaos
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
      
      // Force is stronger closer to click, but applied everywhere
      const force = (EXPLOSION_FORCE * (Math.random() * 0.5 + 0.5)) + (100 / (dist + 1)); 
      
      p.vx = Math.cos(angle) * force * 4; // High velocity
      p.vy = Math.sin(angle) * force * 4;
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] w-full bg-slate-950 p-8">
      {/* Container to center and present the button */}
      
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setIsHovered(true)}
        onBlur={handleMouseLeave}
        className={`
          relative group cursor-pointer outline-none select-none
          w-48 h-14 rounded-full 
          bg-slate-900/50 backdrop-blur-sm
          border border-slate-700/50
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          hover:border-sky-500/50 hover:bg-slate-800/80
          active:scale-95
          overflow-hidden
        `}
        aria-label="Click Me Particle Button"
      >
        {/* Background Glow Effect */}
        <div className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700
          bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-sky-500/10
        `} />

        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-transparent via-sky-400/30 to-transparent blur-sm animate-spin-slow" />
        </div>

        {/* The Particle Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Accessible Text (Hidden visually, present for screen readers) */}
        <span className="sr-only">Click Me</span>
        
        {/* Fallback Text (Hidden if canvas loads, but good for SSR/No-JS safety if we were using progressive enhancement) */}
        {/* In this strict React component, we rely on Canvas, but we can add a subtle text hint if particles are still forming? No, let's keep it clean. */}
        
        {/* Corner Accents */}
        <div className="absolute top-2 left-4 w-1 h-1 bg-slate-600 rounded-full opacity-50 group-hover:bg-sky-400 group-hover:shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all duration-300"></div>
        <div className="absolute bottom-2 right-4 w-1 h-1 bg-slate-600 rounded-full opacity-50 group-hover:bg-indigo-400 group-hover:shadow-[0_0_8px_rgba(129,140,248,0.8)] transition-all duration-300"></div>

      </button>

      {/* Instructions/Caption for the demo */}
      <div className="absolute bottom-8 text-slate-500 text-sm font-mono tracking-wider pointer-events-none animate-pulse">
        HOVER TO DISPERSE • CLICK TO EXPLODE
      </div>
    </div>
  );
};

export default GeneratedComponent;