const GeneratedComponent = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [textTransform, setTextTransform] = useState({ x: 0, y: 0, skew: 0 });
  const buttonRef = useRef(null);

  // Appearance: Text shoots in from off-screen when component mounts
  useEffect(() => {
    // A small delay ensures the initial CSS state is applied before transitioning
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Display: Rubber-band stretching on pull (hover, mouse move)
  const handleMouseMove = useCallback((e) => {
    if (isClicked || !buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Normalize deltas to a range like -1 to 1 based on button half-width/height
    const normalizedX = deltaX / (buttonRect.width / 2);
    const normalizedY = deltaY / (buttonRect.height / 2);

    // Apply inverse transform for pull effect and skew for stretching feel
    // These values can be tweaked for desired intensity
    setTextTransform({
      x: -normalizedX * 12, // Move text opposite to mouse X
      y: -normalizedY * 8,  // Move text opposite to mouse Y
      skew: normalizedX * 8 // Skew text with mouse X
    });
  }, [isClicked]);

  const handleMouseLeave = useCallback(() => {
    if (isClicked) return;
    // Reset text transform to its original state smoothly
    setTextTransform({ x: 0, y: 0, skew: 0 });
  }, [isClicked]);

  // Disappearance/Interaction: Slingshot away on click
  const handleClick = useCallback(() => {
    if (isClicked) return; // Prevent multiple activations
    setIsClicked(true);
    // Optionally trigger an action or redirect after the animation completes
    // setTimeout(() => {
    //   console.log('Button interaction complete!');
    // }, 600); // Matches exit animation duration
  }, [isClicked]);

  // Combined Tailwind classes for the text container's entrance/exit animations
  const textContainerClasses = `
    absolute inset-0 flex items-center justify-center
    will-change-[transform,opacity]
    transition-[transform,opacity]
    ${isClicked
      // Exit animation: Slingshot out to the right, shrinking
      ? 'duration-600 ease-[cubic-bezier(0.7,0,0.84,0)] translate-x-[200%] scale-x-50 opacity-0'
      // Entrance animation: Shoots in from the left
      : isMounted
        ? 'duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] translate-x-0 opacity-100'
        // Initial state before mount animation
        : 'translate-x-[-100%] opacity-0'
    }
  `;

  // Inline style for the interactive pull effect on the actual text span
  // Using transform3d for hardware acceleration, and a short transition for smoothness
  const interactiveTextStyle = {
    transform: `translate3d(${textTransform.x}px, ${textTransform.y}px, 0) skewX(${textTransform.skew}deg)`,
    willChange: 'transform',
    // Apply transition for interactive movements, but disable it during click exit to avoid conflict
    transition: isClicked ? 'none' : 'transform 100ms ease-out',
  };

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden
        px-8 py-3 rounded-full
        bg-gradient-to-br from-indigo-600 to-purple-600
        text-white font-extrabold text-lg tracking-wide
        shadow-lg shadow-indigo-500/50
        transition-[transform,background-color,box-shadow]
        duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
        ${isClicked ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'}
      `}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={isClicked} // Disable button to prevent re-clicks during animation
    >
      {/* Outer div for entrance/exit animations */}
      <div className={textContainerClasses}>
        {/* Inner span for interactive mouse-pull effect */}
        <span style={interactiveTextStyle}>
          Get Started
        </span>
      </div>
    </button>
  );
};
export default GeneratedComponent;