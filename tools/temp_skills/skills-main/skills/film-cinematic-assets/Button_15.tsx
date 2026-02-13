const GeneratedComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const buttonRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 }); // Normalized 0-1, centered by default

  useEffect(() => {
    // Trigger entrance animation on mount
    setIsMounted(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (buttonRef.current) {
      const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
      // Normalize mouse position relative to the button (0 to 1)
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      setMousePosition({ x, y });
    }
  }, []);

  const handleClick = () => {
    if (!isClicked) {
      setIsClicked(true);
      // Simulate an action and reset the button after the disappearance animation
      setTimeout(() => {
        // Here you would typically perform the button's intended action
        // For demonstration, we just reset the state to allow re-clicking
        setIsClicked(false);
        setIsMounted(false); // Prepare for re-entrance
        setTimeout(() => setIsMounted(true), 50); // Small delay to ensure state reset before re-triggering entrance
      }, 700); // Matches the disappearance animation duration
    }
  };

  // Define segments for the bento grid effect.
  // Each segment has an initial off-screen position, a staggered delay,
  // and `xOffset`/`yOffset` for subtle parallax on hover.
  const segments = [
    { id: 1, initialX: -100, initialY: -100, delay: '0ms', duration: '500ms', xOffset: -0.04, yOffset: -0.04, className: 'w-[50%] h-[50%] top-0 left-0 border-b border-r' },
    { id: 2, initialX: 100, initialY: -100, delay: '50ms', duration: '550ms', xOffset: 0.04, yOffset: -0.04, className: 'w-[50%] h-[50%] top-0 right-0 border-b border-l' },
    { id: 3, initialX: -100, initialY: 100, delay: '100ms', duration: '600ms', xOffset: -0.04, yOffset: 0.04, className: 'w-[50%] h-[50%] bottom-0 left-0 border-t border-r' },
    { id: 4, initialX: 100, initialY: 100, delay: '150ms', duration: '650ms', xOffset: 0.04, yOffset: 0.04, className: 'w-[50%] h-[50%] bottom-0 right-0 border-t border-l' },
    // Additional segments for more dynamic appearance
    { id: 5, initialX: 0, initialY: -150, delay: '200ms', duration: '700ms', xOffset: 0, yOffset: -0.06, className: 'w-[60%] h-[20%] top-[-10%] left-1/2 -translate-x-1/2 border' },
    { id: 6, initialX: 0, initialY: 150, delay: '250ms', duration: '750ms', xOffset: 0, yOffset: 0.06, className: 'w-[60%] h-[20%] bottom-[-10%] left-1/2 -translate-x-1/2 border' },
  ];

  // Common Tailwind classes for transitions and glassmorphism style
  const commonTransitionProps = 'transition-[transform,opacity,filter,box-shadow,background-color] ease-[cubic-bezier(0.25,1,0.5,1)]';
  const commonGlassProps = 'absolute will-change-transform backdrop-blur-md bg-white/5 border border-white/10 rounded-xl';

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden
        h-14 w-56 p-px rounded-xl
        flex items-center justify-center
        text-lg font-semibold text-white
        ${commonTransitionProps} duration-300
        hover:scale-105 active:scale-95
        ${isHovered ? 'shadow-[0_0_30px_rgba(79,70,229,0.7)]' : 'shadow-[0_0_15px_rgba(79,70,229,0.4)]'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
        ${isClicked ? 'pointer-events-none' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMousePosition({ x: 0.5, y: 0.5 }); }} // Reset mouse position to center
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      disabled={isClicked}
    >
      {segments.map((segment) => {
        // Calculate current transform based on mount, click, and hover states
        const translateX = isMounted && !isClicked ? 0 : segment.initialX;
        const translateY = isMounted && !isClicked ? 0 : segment.initialY;
        const scale = isClicked ? 0.05 : (isMounted ? 1 : 0.05); // Minimize to center on click
        const opacity = isClicked ? 0 : (isMounted ? 1 : 0);

        // Parallax effect on hover, scaling the offset based on mouse position relative to center (0.5)
        const parallaxStrength = 15; // How much elements move on hover
        const parallaxX = isHovered ? (mousePosition.x - 0.5) * 2 * parallaxStrength * segment.xOffset : 0;
        const parallaxY = isHovered ? (mousePosition.y - 0.5) * 2 * parallaxStrength * segment.yOffset : 0;

        return (
          <div
            key={segment.id}
            className={`
              ${commonGlassProps} ${segment.className}
              ${commonTransitionProps}
              duration-[var(--segment-duration)] delay-[var(--segment-delay)]
              ${isHovered ? 'bg-white/10' : 'bg-white/5'}
            `}
            style={{
              '--segment-duration': segment.duration,
              '--segment-delay': isClicked ? '0ms' : segment.delay, // Click animation is immediate
              transform: `
                translateX(calc(${translateX}px + ${parallaxX}px))
                translateY(calc(${translateY}px + ${parallaxY}px))
                scale(${scale})
              `,
              opacity: opacity,
              // Subtle brightness change on hover for the glass effect
              filter: `brightness(${isHovered ? 1.2 : 1})`,
            }}
          ></div>
        );
      })}

      <span
        className={`
          relative z-10
          ${commonTransitionProps} duration-300
          ${isClicked ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
        `}
      >
        Get Started
      </span>
    </button>
  );
};
export default GeneratedComponent;