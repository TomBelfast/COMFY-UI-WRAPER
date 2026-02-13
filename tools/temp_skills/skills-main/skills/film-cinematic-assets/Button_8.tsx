const GeneratedComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [deviation, setDeviation] = useState(0); // Normalized deviation for elastic effect (-1 to 1)

  const buttonRef = useRef(null);
  const clickAnimationTimeout = useRef(null);

  // Mount animation for the button and text
  useEffect(() => {
    const mountTimer = setTimeout(() => {
      setIsMounted(true);
    }, 50); // Small delay to ensure initial state is applied before transition
    return () => clearTimeout(mountTimer);
  }, []);

  // Calculate mouse deviation from the button's center for the elastic effect
  const handleMouseMove = useCallback((e) => {
    if (buttonRef.current && isHovered && !isClicked) {
      const { left, width } = buttonRef.current.getBoundingClientRect();
      const mouseX = e.clientX - left; // Mouse position relative to button's left edge
      const centerX = width / 2;
      const currentDeviation = (mouseX - centerX) / centerX; // Normalize to -1 (left) to 1 (right)
      setDeviation(currentDeviation);
    }
  }, [isHovered, isClicked]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setDeviation(0); // Reset deviation when mouse leaves
  }, []);

  // Handle button click for the "slingshot away" effect
  const handleClick = useCallback(() => {
    setIsClicked(true);

    if (clickAnimationTimeout.current) {
      clearTimeout(clickAnimationTimeout.current);
    }

    // After the slingshot animation completes, reset state
    clickAnimationTimeout.current = setTimeout(() => {
      setIsClicked(false);
      setDeviation(0); // Reset deviation for potential re-hover
    }, 600); // Matches the slingshot animation duration
  }, []);

  // Custom styles for the inner span to achieve the elastic text effect
  const innerElasticTextStyle = {
    transform: `translateX(${isHovered && !isClicked ? deviation * 10 : 0}px) scaleX(${isHovered && !isClicked ? 1 - Math.abs(deviation) * 0.05 : 1})`,
    transition: 'transform 100ms ease-out', // Fast transition for a responsive "rubber-band" feel
    willChange: 'transform',
  };

  return (
    <button
      ref={buttonRef}
      className={`
        relative
        flex items-center justify-center
        overflow-hidden // Crucial for text shooting in/out cleanly
        px-10 py-4
        bg-gradient-to-br from-purple-600 to-indigo-700
        text-white text-xl font-bold tracking-wide
        rounded-full
        shadow-[0_0_25px_rgba(128,90,213,0.5)] // Subtle shadow glow
        focus:outline-none focus:ring-4 focus:ring-purple-500/50
        will-change-transform
        // Base transition for button's scale and opacity
        transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
        // Entrance animation for the button itself
        ${isMounted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        // Hover and active scale effects for the button
        ${isHovered && !isClicked ? 'scale-[1.05]' : ''}
        ${isClicked ? 'scale-95' : ''}
      `}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span // This outer span handles entrance/exit animations (transform, opacity, rotate)
        className={`
          relative z-10 // Ensures text is above any click effects
          inline-block // Allows transform on the span
          will-change-transform
          // Defines the properties being transitioned
          transition-[transform,opacity,rotate]
          // Slingshot exit animation
          ${isClicked
            ? 'duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] translate-x-[200%] opacity-0 rotate-12'
            : // Entrance animation for the text
              `duration-700 delay-100 ease-[cubic-bezier(0.25,1,0.5,1)] ${isMounted ? 'translate-x-0 opacity-100' : 'translate-x-[-100%] opacity-0'}`
          }
        `}
      >
        <span // This inner span handles the continuous elastic pull effect
          className="inline-block"
          style={innerElasticTextStyle}
        >
          Get Started
        </span>
      </span>

      {/* Visual feedback for click: a subtle, expanding burst */}
      {isClicked && (
        <div
          // Custom animation using arbitrary value for keyframes
          // animate-[name_duration_timing-function_delay_fill-mode_direction_iteration-count]
          className="absolute inset-0 z-0 bg-white/20 rounded-full animate-[ping-once_0.4s_ease-out_forwards]"
          // Define ping-once keyframes using arbitrary syntax. This allows for a one-off animation.
          style={{ '--ping-once': '0%{transform:scale(0);opacity:0.5;} 100%{transform:scale(2);opacity:0;}' }}
        ></div>
      )}
    </button>
  );
};
export default GeneratedComponent;