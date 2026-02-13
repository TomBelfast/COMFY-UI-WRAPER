const GeneratedComponent = () => {
  const buttonRef = useRef(null);
  const glowRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [buttonRect, setButtonRect] = useState(null);

  const buttonText = "Get Started";
  const words = buttonText.split(" ");

  // --- Mount Animation (Appearance) ---
  useEffect(() => {
    setIsMounted(true);
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, []);

  // Update button rect on resize for accurate mouse tracking
  useEffect(() => {
    const handleResize = () => {
      if (buttonRef.current) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Interactive Glow (Display) ---
  const handleMouseMove = useCallback((e) => {
    if (buttonRect && glowRef.current) {
      const x = e.clientX - buttonRect.left;
      const y = e.clientY - buttonRect.top;
      // Directly manipulate CSS variables for performance, avoiding state updates on every mouse move
      glowRef.current.style.setProperty('--mouse-x', `${x}px`);
      glowRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  }, [buttonRect]);

  // --- Click Animation (Disappearance) ---
  const handleClick = () => {
    if (isClicked) return; // Prevent multiple rapid clicks
    setIsClicked(true);
  };

  // Component for the burst effect, rendered conditionally
  const BurstEffect = ({ onComplete }) => {
    const [animateOut, setAnimateOut] = useState(false);

    useEffect(() => {
      // Trigger the animation immediately after component mounts
      setAnimateOut(true);
      const timer = setTimeout(onComplete, 800); // Match CSS transition duration
      return () => clearTimeout(timer);
    }, [onComplete]);

    return (
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          pointer-events-none z-20
        `}
      >
        {/* Main "smoke" burst effect: a rapidly expanding, fading radial gradient */}
        <div
          className={`
            absolute rounded-full
            w-[calc(100%+80px)] h-[calc(100%+80px)]
            bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.7)_0%,_transparent_70%)]
            transform transition-[transform,opacity,filter] duration-[800ms] ease-[cubic-bezier(0.33,1,0.68,1)]
            will-change-[transform,opacity,filter]
            ${animateOut ? 'scale-[1.5] opacity-0 blur-lg' : 'scale-0 opacity-100 blur-none'}
          `}
        ></div>
        {/* Optional: Add a few smaller particles for more detail */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute rounded-full bg-white/70 opacity-0
              w-2 h-2
              transition-[transform,opacity,filter] duration-[800ms] ease-[cubic-bezier(0.33,1,0.68,1)]
              will-change-[transform,opacity,filter]
              ${animateOut ?
                `opacity-0 blur-sm
                 translate-x-[calc(var(--rand-x)*1.5)]
                 translate-y-[calc(var(--rand-y)*1.5)]
                 scale-0`
                :
                `opacity-100 blur-none scale-100`
              }
            `}
            style={{
              transitionDelay: `${i * 50}ms`,
              '--rand-x': `${(Math.random() - 0.5) * 100}px`, // Random offset for particles
              '--rand-y': `${(Math.random() - 0.5) * 100}px`,
            }}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden
        py-4 px-8 rounded-full
        bg-gradient-to-br from-purple-800 to-indigo-900
        text-white font-bold text-2xl tracking-wide
        shadow-lg
        transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
        hover:scale-[1.03] active:scale-[0.98]
        hover:shadow-[0_0_40px_rgba(147,51,234,0.7)]
        focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/70
        group
        will-change-transform
      `}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      aria-label={buttonText}
    >
      {/* Inner Glow / Mouse-follow effect */}
      <div
        ref={glowRef}
        className={`
          absolute inset-0 rounded-full
          pointer-events-none
          [background-image:radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),_rgba(168,85,247,0.7)_0%,_transparent_50%)]
          transition-opacity duration-300
          ${isClicked ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}
          [will-change:opacity,background-image]
        `}
        // Initial values for CSS variables
        style={{
          '--mouse-x': `${mousePosition.x}px`,
          '--mouse-y': `${mousePosition.y}px`,
        }}
      ></div>

      {/* Text Container */}
      <div
        className={`
          relative z-10 flex justify-center items-center gap-x-2
          [text-shadow:0_0_10px_rgba(255,255,255,0.5)]
          ${isClicked ? 'transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] opacity-0 scale-90 blur-sm' : ''}
        `}
      >
        {words.map((word, index) => (
          <span
            key={index}
            className={`
              inline-block whitespace-nowrap
              ${isMounted && !isClicked ? 'opacity-100 scale-100 blur-none translate-y-0' : 'opacity-0 scale-[0.8] blur-sm translate-y-2'}
              transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
              will-change-[opacity,transform,filter]
            `}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            {word}
          </span>
        ))}
      </div>

      {/* Disperse Effect Overlay (triggered on click) */}
      {isClicked && (
        <BurstEffect onComplete={() => setIsClicked(false)} />
      )}
    </button>
  );
};

export default GeneratedComponent;