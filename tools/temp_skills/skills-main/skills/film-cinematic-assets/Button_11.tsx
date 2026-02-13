const GeneratedComponent = () => {
  const buttonRef = useRef(null);
  const particleDivRefs = useRef([]); // To hold refs to particle DOM elements
  const [particlesData, setParticlesData] = useState([]); // Base data for particles
  const [buttonRect, setButtonRect] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

  const NUM_PARTICLES = 180; // Number of particles for the effect
  const TEXT = "Get Started"; // The text to be formed by particles

  // Ref for global mouse position, updated by event listener
  const globalMouse = useRef({ x: 0, y: 0 });
  const handleGlobalMouseMove = useCallback((e) => {
    globalMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Set up global mouse move listener once on mount
  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [handleGlobalMouseMove]);

  // Initial particle setup and calculation of target positions on mount
  useEffect(() => {
    const buttonEl = buttonRef.current;
    if (!buttonEl) return;

    const rect = buttonEl.getBoundingClientRect();
    setButtonRect(rect);

    // Use a temporary invisible span to calculate text dimensions for particle distribution
    const tempSpan = document.createElement('span');
    tempSpan.textContent = TEXT;
    tempSpan.style.position = 'absolute';
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.fontSize = '2.25rem'; // Matches button's effective font size for particle spread
    tempSpan.style.fontWeight = 'bold';
    tempSpan.style.letterSpacing = '0.5px';
    tempSpan.style.whiteSpace = 'nowrap';
    document.body.appendChild(tempSpan);
    const textRect = tempSpan.getBoundingClientRect();
    document.body.removeChild(tempSpan);

    const particles = Array.from({ length: NUM_PARTICLES }).map((_, i) => {
      // Particles start randomly outside the button's initial area for an 'assemble' effect
      const startX = (Math.random() - 0.5) * rect.width * 2.5;
      const startY = (Math.random() - 0.5) * rect.height * 2.5;

      // Target positions, relative to button's top-left, to loosely form the text
      const targetX = (Math.random() * textRect.width) - (textRect.width / 2) + (rect.width / 2);
      const targetY = (Math.random() * textRect.height) - (textRect.height / 2) + (rect.height / 2);

      return {
        id: i,
        currentX: startX, // Initial position for CSS transition start
        currentY: startY,
        targetX: targetX, // Final position after entrance animation
        targetY: targetY,
        opacity: 0, // Particles are initially invisible
        scale: 0.3 + Math.random() * 0.7, // Varied particle sizes for depth
        delay: Math.random() * 800, // Staggered entrance delay for a dynamic feel
        baseHue: 270 + (Math.random() - 0.5) * 60, // Hues around purple for a vibrant glow
      };
    });
    setParticlesData(particles);

  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Main animation loop for hover repulsion using requestAnimationFrame
  const animationFrameId = useRef(null);
  const previousTimestamp = useRef(0);

  const animate = useCallback((timestamp) => {
    // Skip animation if buttonRect or particlesData is not ready, or if already clicked
    if (!buttonRef.current || !buttonRect || particlesData.length === 0 || isClicked) {
      animationFrameId.current = requestAnimationFrame(animate);
      return;
    }

    const deltaTime = timestamp - previousTimestamp.current;
    previousTimestamp.current = timestamp;

    const mouseX = globalMouse.current.x;
    const mouseY = globalMouse.current.y;

    // Determine if the mouse cursor is currently over the button
    const isMouseOverButton = (
      mouseX > buttonRect.left && mouseX < buttonRect.right &&
      mouseY > buttonRect.top && mouseY < buttonRect.bottom
    );

    particlesData.forEach((p, i) => {
      const particleDiv = particleDivRefs.current[i];
      if (!particleDiv) return;

      // Retrieve current animated position from CSS variables for accurate interaction
      let currentX = parseFloat(particleDiv.style.getPropertyValue('--x')) || p.currentX;
      let currentY = parseFloat(particleDiv.style.getPropertyValue('--y')) || p.currentY;

      let tempTargetX = p.targetX;
      let tempTargetY = p.targetY;

      // Apply repulsion force if mouse is over the button
      if (isMouseOverButton) {
        // Calculate particle's screen position relative to the viewport
        const particleScreenX = buttonRect.left + currentX;
        const particleScreenY = buttonRect.top + currentY;

        const dx = particleScreenX - mouseX;
        const dy = particleScreenY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const repulsionRadius = 100; // How far the mouse influences particles
        const repulsionStrength = 10; // How much particles are pushed away

        if (dist < repulsionRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - dist / repulsionRadius) * repulsionStrength;
          tempTargetX += Math.cos(angle) * force;
          tempTargetY += Math.sin(angle) * force;
        }
      }

      // Smoothly interpolate current particle position towards its (potentially perturbed) target
      const easeFactor = 0.08; // Controls the speed at which particles return to their base position
      currentX += (tempTargetX - currentX) * easeFactor;
      currentY += (tempTargetY - currentY) * easeFactor;

      // Update CSS variables, which in turn updates the particle's transform
      particleDiv.style.setProperty('--x', `${currentX}px`);
      particleDiv.style.setProperty('--y', `${currentY}px`);
    });

    animationFrameId.current = requestAnimationFrame(animate);
  }, [buttonRect, particlesData, isClicked]); // Dependencies for useCallback to re-create if needed

  // Start/Stop the main requestAnimationFrame loop
  useEffect(() => {
    if (particlesData.length > 0) {
      animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [animate, particlesData]); // Rerun if 'animate' function or particlesData changes

  // Trigger entrance animation for particles after initial mount
  useEffect(() => {
    if (particlesData.length > 0 && !isClicked) {
      setParticlesData(prev =>
        prev.map(p => ({
          ...p,
          currentX: p.targetX, // Particles transition from startX to targetX
          currentY: p.targetY, // Particles transition from startY to targetY
          opacity: 1, // Particles fade in
        }))
      );
    }
  }, [particlesData.length, isClicked]); // Only on initial particlesData population and if not clicked

  // Handle button click for explosion animation
  const handleClick = useCallback(() => {
    if (isClicked) return; // Prevent multiple clicks
    setIsClicked(true);

    const explosionParticles = particlesData.map(p => {
      const particleDiv = particleDivRefs.current[p.id];
      if (!particleDiv) return p;

      // Get current animated position for the start of the explosion
      const currentX = parseFloat(particleDiv.style.getPropertyValue('--x')) || p.currentX;
      const currentY = parseFloat(particleDiv.style.getPropertyValue('--y')) || p.currentY;

      return {
        ...p,
        x: currentX, // Start explosion from current particle location
        y: currentY,
        vx: (Math.random() - 0.5) * 20, // Random initial horizontal velocity
        vy: (Math.random() - 0.5) * 20, // Random initial vertical velocity
        gravity: 0.5, // Simulate gravity pulling particles down
        fadeDuration: 1000 + Math.random() * 1000, // Random fade duration
        startTime: performance.now(),
        isExploded: true,
      };
    });
    setParticlesData(explosionParticles); // Update state to trigger explosion logic

    cancelAnimationFrame(animationFrameId.current); // Stop the main animation loop

    // Separate requestAnimationFrame loop for explosion physics
    let explosionAnimationFrameId;
    const explode = (timestamp) => {
      explosionParticles.forEach((p, i) => {
        const particleDiv = particleDivRefs.current[i];
        if (!particleDiv || !p.isExploded) return;

        const elapsed = timestamp - p.startTime;
        const progress = Math.min(elapsed / p.fadeDuration, 1);

        if (progress < 1) {
          p.x += p.vx;
          p.vy += p.gravity; // Apply gravity to vertical velocity
          p.y += p.vy;
          p.opacity = 1 - progress; // Fade out as particles move

          particleDiv.style.setProperty('--x', `${p.x}px`);
          particleDiv.style.setProperty('--y', `${p.y}px`);
          particleDiv.style.opacity = `${p.opacity}`;
          // Ensure scale is maintained during explosion for consistency
          particleDiv.style.transform = `translate(var(--x), var(--y)) scale(${p.scale})`;
        } else {
          particleDiv.style.opacity = '0'; // Ensure particle is fully hidden
          particleDiv.style.display = 'none'; // Remove from layout after fade
        }
      });

      // Continue explosion animation as long as some particles are still visible/moving
      if (explosionParticles.some(p => p.isExploded && p.opacity > 0)) {
        explosionAnimationFrameId = requestAnimationFrame(explode);
      }
    };
    explosionAnimationFrameId = requestAnimationFrame(explode);
  }, [isClicked, particlesData]); // Dependencies for useCallback

  return (
    <button
      ref={buttonRef}
      className="relative flex items-center justify-center w-[200px] h-[60px] p-0 overflow-hidden
                 bg-zinc-800 rounded-lg text-white font-bold text-2xl
                 shadow-lg transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
                 hover:scale-105 active:scale-95 will-change-transform
                 hover:shadow-[0_0_20px_theme(colors.purple.500),0_0_40px_theme(colors.purple.700)]
                 group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
      onClick={handleClick}
      aria-label={TEXT} // Provide accessible label for the button
      disabled={isClicked} // Disable button after click to prevent re-triggering explosion
    >
      {particlesData.map((p, i) => (
        <div
          key={p.id}
          ref={el => particleDivRefs.current[i] = el} // Store ref to each particle div
          className="absolute w-2 h-2 rounded-full will-change-transform" // Particle styling
          style={{
            // CSS custom properties for dynamic position updates
            '--x': `${p.currentX}px`,
            '--y': `${p.currentY}px`,
            // Apply initial transform and transition for entrance animation
            transform: `translate(var(--x), var(--y)) scale(${p.scale})`,
            opacity: p.opacity, // Initially 0, transitions to 1
            // Disable CSS transitions during explosion for direct JS control
            transition: p.isExploded
              ? 'none'
              : `transform 1s ease-[cubic-bezier(0.25,1,0.5,1)] var(--delay), opacity 0.8s ease-out var(--delay)`,
            '--delay': `${p.delay}ms`, // Staggered transition delay
            backgroundColor: `hsl(${p.baseHue}, 80%, 70%)`, // Varied and vibrant particle colors
          }}
        />
      ))}
      {/* Visually hidden text for accessibility, as particles form the visible text */}
      <span className="sr-only">{TEXT}</span>
    </button>
  );
};
export default GeneratedComponent;