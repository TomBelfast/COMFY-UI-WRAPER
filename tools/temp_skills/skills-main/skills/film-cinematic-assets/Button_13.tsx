const GeneratedComponent = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  // Normalized mouse position relative to button center, range -1 to 1
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const textContent = "Get Started";
  const chars = textContent.split("");

  // Effect to trigger entrance animation on component mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Callback for mouse movement within the button
  const handleMouseMove = useCallback((e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Mouse position relative to the button's center
      const mouseX = e.clientX - (rect.left + rect.width / 2);
      const mouseY = e.clientY - (rect.top + rect.height / 2);

      // Normalize mouse position relative to button's half-width/height
      const normalizedX = mouseX / (rect.width / 2);
      const normalizedY = mouseY / (rect.height / 2);

      setMousePos({ x: normalizedX, y: normalizedY });
    }
  }, []);

  // Callback for mouse leaving the button
  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 }); // Reset mouse position
    setIsHovered(false);
  }, []);

  // Callback for button click
  const handleClick = useCallback(() => {
    setIsClicked(true);
    // Optional: Reset button state after animation to allow re-interaction
    // setTimeout(() => {
    //   setIsClicked(false);
    //   setIsMounted(false); // Trigger remount for re-entrance
    //   setTimeout(() => setIsMounted(true), 50);
    // }, chars.length * 75 + 600); // Adjust delay based on exit animation duration
  }, [chars.length]);

  // Dynamic style generation for each character based on component state
  const getCharTransformStyle = useCallback((charIndex, totalChars) => {
    const staggerDelay = charIndex * 0.05; // Staggered delay for entrance
    const elasticEase = "cubic-bezier(0.68, -0.55, 0.265, 1.55)"; // For elastic snap effects
    const smoothEase = "cubic-bezier(0.25, 1, 0.5, 1)"; // For subtle, smooth movements

    let transform = "";
    let opacity = "1";
    let transitionDuration = "0.5s";
    let transitionTimingFunction = elasticEase;
    let transitionDelay = `${staggerDelay}s`;

    // 1. Appearance (Entrance Animation)
    if (!isMounted) {
      // Start characters off-screen, rotated, and scaled down
      transform = `translateY(100px) rotateX(90deg) scale(0.5)`;
      opacity = "0";
      transitionDelay = `${staggerDelay * 0.5}s`; // Shorter delay for initial appearance
    } else {
      // Default mounted state: characters in place
      transform = `translateY(0) rotateX(0) scale(1)`;
    }

    // 2. Disappearance/Interaction (Click Animation)
    if (isClicked) {
      // Slingshot characters away with random translation and rotation
      const exitY = Math.random() * 200 + 100; // Random vertical exit
      const exitX = (Math.random() - 0.5) * 150; // Random horizontal exit
      const exitRotate = (Math.random() - 0.5) * 360; // Random rotation
      transform = `translate(${exitX}px, ${exitY}px) rotate(${exitRotate}deg) scale(0)`;
      opacity = "0";
      transitionDuration = "0.6s";
      // Stagger in reverse for exit to create a "trailing" effect
      transitionDelay = `${(totalChars - charIndex - 1) * 0.05}s`;
    }

    // 3. Display (Hover/Mouse Move "Elastic Pull") - only active when not clicked
    if (isHovered && !isClicked) {
      const pullStrength = 15; // Max pixels characters can translate
      const skewStrength = 5; // Max degrees characters can skew
      const rotateStrength = 5; // Max degrees characters can rotate

      // Calculate character's relative position within the text block (-1 for first, 1 for last)
      const relativeCharX = (charIndex / (totalChars - 1)) * 2 - 1;

      // Apply translation based on mouse position, creating a pull effect
      // Characters move more if closer to the mouse's respective axis
      const translateX = mousePos.x * pullStrength * (1 + relativeCharX * mousePos.x * 0.5);
      const translateY = mousePos.y * pullStrength * (1 + Math.sin(relativeCharX * Math.PI) * mousePos.y * 0.5);

      // Apply skew and rotation for a stretching, elastic visual
      const skewX = mousePos.x * skewStrength * relativeCharX;
      const rotate = mousePos.x * rotateStrength * -relativeCharX; // Rotate opposite to mouse for stretch

      // Combine with the base (entrance/default) transform
      transform = `${transform} translateX(${translateX}px) translateY(${translateY}px) skewX(${skewX}deg) rotate(${rotate}deg)`;
      transitionDuration = "0.2s"; // Faster transition for interactive mouse movement
      transitionTimingFunction = smoothEase;
      transitionDelay = `0s`; // No delay for direct mouse interaction
    }

    return {
      transition: `transform ${transitionDuration} ${transitionTimingFunction} ${transitionDelay}, opacity ${transitionDuration} ${transitionTimingFunction} ${transitionDelay}`,
      willChange: "transform, opacity", // Optimize for animation performance
      transform: transform,
      opacity: opacity,
      display: 'inline-block', // Essential for transform properties to work on spans
    };
  }, [isMounted, isClicked, isHovered, mousePos, chars.length]);

  // Custom cubic-bezier easing for the button's own scale transition
  const buttonEase = "cubic-bezier(0.25, 1, 0.5, 1)";

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden
        px-8 py-4 rounded-full
        font-extrabold text-xl tracking-wider
        bg-gradient-to-br from-indigo-600 to-purple-700
        text-white
        shadow-lg shadow-indigo-500/50
        group
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900
        will-change-transform
      `}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={handleClick}
      style={{
        // Apply button's own scale transitions based on hover/click
        transform: `scale(${isClicked ? 0.9 : (isHovered ? 1.05 : 1)})`,
        transition: `transform 0.3s ${buttonEase}, box-shadow 0.3s ${buttonEase}`,
      }}
      disabled={isClicked} // Disable button interaction during click animation
    >
      <div className="flex justify-center items-center h-full whitespace-nowrap">
        {chars.map((char, i) => (
          <span
            key={i}
            // Use non-breaking space for actual spaces to maintain layout for transforms
            className="inline-block relative z-10"
            style={getCharTransformStyle(i, chars.length)}
            aria-hidden={isClicked} // Hide from screen readers if disappearing
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
      {/* Subtle background glow effect on hover */}
      <span
        className={`
          absolute inset-0 rounded-full
          bg-white/10 opacity-0
          transition-opacity duration-300 ${buttonEase}
          group-hover:opacity-100
        `}
      ></span>
    </button>
  );
};

export default GeneratedComponent;