const GeneratedComponent = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);
  const buttonRef = useRef(null);

  // Appearance Animation (on mount)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!buttonRef.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();

    const x = clientX - (left + width / 2); // Mouse x relative to button center
    const y = clientY - (top + height / 2); // Mouse y relative to button center

    setMousePos({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 }); // Reset position when not hovered
  }, []);

  const handleClick = useCallback(() => {
    setIsClicked(true);
    // After animation, reset state for re-click or navigate
    setTimeout(() => {
      setIsClicked(false);
      setIsMounted(false); // Trigger full exit and re-entrance for demo
      setTimeout(() => setIsMounted(true), 100); // Re-trigger entrance after a brief delay
    }, 800); // Duration of the slingshot animation
  }, []);

  // Calculate transform styles for the text based on states
  const textTransformStyle = useMemo(() => {
    let currentTransform = '';
    let currentOpacity = '1';
    let currentTransition = 'transform 0.3s ease-[cubic-bezier(0.25,1,0.5,1)], opacity 0.3s ease-out'; // Default smooth transition

    if (!isMounted) {
      // Initial state before entrance animation
      currentTransform = 'translateY(-200%) scale(0) rotate(-30deg)';
      currentOpacity = '0';
      currentTransition = 'none'; // No transition initially to snap to start state
    } else if (isClicked) {
      // Clicked state (Slingshot Away)
      currentTransform = 'translateX(300%) scale(0.1) rotate(90deg)';
      currentOpacity = '0';
      currentTransition = 'transform 0.6s cubic-bezier(0.755, 0.05, 0.855, 0.06) forwards, opacity 0.4s ease-out forwards';
    } else if (isMounted && isHovered) {
      // Hovered state (Elastic Snap: Mouse follow and stretch)
      const maxTranslate = 10; // pixels, max amount text can move
      const maxScale = 0.05; // max 5% stretch

      const tx = Math.max(-maxTranslate, Math.min(maxTranslate, mousePos.x * 0.15));
      const ty = Math.max(-maxTranslate, Math.min(maxTranslate, mousePos.y * 0.15));

      const distFromCenter = Math.sqrt(mousePos.x * mousePos.x + mousePos.y * mousePos.y);
      // Scale based on distance from center, but capped
      const scaleFactor = Math.min(1 + maxScale, 1 + distFromCenter / 2000);

      currentTransform = `translateX(${tx}px) translateY(${ty}px) scale(${scaleFactor})`;
      currentOpacity = '1';
      currentTransition = 'transform 0.1s linear, opacity 0.3s ease-out'; // Fast transition for responsive hover
    } else if (isMounted) {
      // Mounted, not hovered, not clicked (Entrance animation target: Snap to normal)
      currentTransform = 'translateY(0) scale(1) rotate(0deg)';
      currentOpacity = '1';
      // Spring-like transition for the entrance bounce
      currentTransition = 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.1s, opacity 0.5s ease-out 0.1s';
    }

    return {
      transform: currentTransform,
      opacity: currentOpacity,
      transition: currentTransition,
    };
  }, [isMounted, isHovered, mousePos, isClicked]);


  return (
    <button
      ref={buttonRef}
      className={`
        relative inline-flex items-center justify-center p-4 pr-6 pl-6 overflow-hidden
        font-bold text-2xl rounded-full text-white cursor-pointer select-none
        group
        will-change-transform
        transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
        ${!isClicked ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-gray-500 to-gray-700 pointer-events-none'}
        ${!isClicked ? 'hover:scale-105 active:scale-95' : ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
          boxShadow: `
            0 0 15px rgba(168, 85, 247, ${isHovered && !isClicked ? 0.8 : 0.4}),
            0 0 30px rgba(129, 140, 248, ${isHovered && !isClicked ? 0.6 : 0.2})
          `
      }}
    >
      {/* Dynamic inner glow effect */}
      <span
        className={`
          absolute inset-0 z-0 rounded-full
          bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-400/80 to-blue-400/80
          blur-xl opacity-0 transition-opacity duration-500 ease-out
          ${isHovered && !isClicked ? 'opacity-40 scale-110' : 'opacity-0 scale-100'}
          will-change-transform
        `}
      ></span>

      <span
        className="relative z-10 whitespace-nowrap will-change-transform"
        style={{
          transform: textTransformStyle.transform,
          opacity: textTransformStyle.opacity,
          transition: textTransformStyle.transition,
        }}
      >
        Get Started
      </span>
    </button>
  );
};
export default GeneratedComponent;