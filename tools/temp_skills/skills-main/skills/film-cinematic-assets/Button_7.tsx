const GeneratedComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Trigger entrance animation on mount after a small delay to ensure CSS is ready
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Reset mouse position influence
    setMousePos({ x: 0, y: 0 });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (buttonRef.current) {
      const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - (left + width / 2); // Mouse X relative to button center
      const y = e.clientY - (top + height / 2); // Mouse Y relative to button center

      // Normalize to -1 to 1 range, then apply a dampening factor
      const normalizedX = x / (width / 2) * 0.15; // Max 15% deviation
      const normalizedY = y / (height / 2) * 0.1;  // Max 10% deviation

      setMousePos({ x: normalizedX, y: normalizedY });
    }
  }, []);

  const handleClick = useCallback(() => {
    if (clicked) return; // Prevent multiple clicks during animation
    setClicked(true);

    // Simulate an action after the click animation completes
    setTimeout(() => {
      alert("Button Clicked! Slingshot!");
      // Reset for re-interaction. Optionally, if the button should vanish permanently,
      // you wouldn't reset `clicked` or `mounted`.
      setClicked(false);
      setMounted(false); // Trigger re-entrance
      setTimeout(() => setMounted(true), 100); // Allow some time before re-appearing
    }, 600); // Match this duration with the exit animation
  }, [clicked]);

  // Calculate dynamic text styles for the elastic effect
  const textTransformStyle = useMemo(() => {
    let tx = 0;
    let ty = 0;
    let scaleX = 1;
    let scaleY = 1;
    let opacity = 1;

    // Entrance animation
    if (!mounted && !clicked) {
      tx = -200; // Start off-screen left
      opacity = 0;
    } else if (mounted && !clicked) {
      tx = 0;
      opacity = 1;
    }

    // Slingshot exit animation
    if (clicked) {
      tx = 250; // Slingshot off-screen right
      scaleX = 0;
      scaleY = 0;
      opacity = 0;
    }

    // Rubber-band effect on hover (overrides entrance/exit for micro-movement)
    if (isHovered && !clicked) {
      // Small translation towards the cursor
      tx = mousePos.x * 25; // Max 25px translation horizontally
      ty = mousePos.y * 15; // Max 15px translation vertically

      // Slight stretch based on horizontal mouse movement, and subtle squash
      scaleX = 1 + Math.abs(mousePos.x) * 0.12; // Max 12% stretch
      scaleY = 1 - Math.abs(mousePos.x) * 0.05; // Max 5% squash
    }

    return {
      transform: `translateX(${tx}px) translateY(${ty}px) scaleX(${scaleX}) scaleY(${scaleY})`,
      opacity: opacity,
    };
  }, [mounted, isHovered, mousePos, clicked]);

  // Determine transition classes based on state
  const textTransitionClasses = useMemo(() => {
    if (clicked) {
      // Fast slingshot out
      return "transition-[transform,opacity] duration-[600ms] ease-[cubic-bezier(0.8,0,1,0.5)]";
    } else if (mounted) {
      // Elastic snap in
      return "transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.25,1,0.5,1.2)]"; // Slightly more aggressive bounce
    } else {
      // Instant snap when not mounted and not clicked, to prevent transition on initial render before mounted effect.
      return "transition-none";
    }
  }, [mounted, clicked]);

  const buttonHoverEffectClasses = isHovered && !clicked
    ? "transition-[transform,box-shadow] duration-100 ease-out" // Fast response for hover micro-movements
    : "transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"; // Slower for general state changes

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden
        p-0 rounded-full
        bg-gradient-to-br from-indigo-600 to-purple-600
        text-white text-2xl font-extrabold tracking-wide
        cursor-pointer
        group
        will-change-transform
        shadow-lg hover:shadow-xl shadow-indigo-500/50 hover:shadow-purple-500/70
        focus:outline-none focus:ring-4 focus:ring-indigo-500/50
        ${buttonHoverEffectClasses}
        ${!clicked ? 'hover:scale-[1.03] active:scale-95' : 'scale-[0.98]'}
        ${clicked ? 'pointer-events-none' : ''}
        flex items-center justify-center
        w-[240px] h-[72px]
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        // Button itself also responds to mouse for a subtle "pull" effect
        transform: isHovered && !clicked
          ? `scale(${1 + Math.abs(mousePos.x) * 0.01 + Math.abs(mousePos.y) * 0.01}) translateX(${mousePos.x * 5}px) translateY(${mousePos.y * 3}px)`
          : '',
      }}
    >
      <span
        className={`
          absolute inset-0 flex items-center justify-center
          whitespace-nowrap
          will-change-transform
          ${textTransitionClasses}
        `}
        style={textTransformStyle}
      >
        Get Started
      </span>
      {/* Background radial glow on hover */}
      <span
        aria-hidden="true"
        className={`
          absolute z-0
          bg-radial-gradient
          from-indigo-400/50 via-transparent to-transparent
          rounded-full
          opacity-0 group-hover:opacity-100
          transition-[opacity,transform] duration-300 ease-out
          scale-0 group-hover:scale-125
          w-[150%] h-[150%]
          pointer-events-none
        `}
        style={{
          background: `radial-gradient(circle at ${(mousePos.x * 100 * 2) + 50}% ${(mousePos.y * 100 * 2) + 50}%, var(--tw-gradient-from), var(--tw-gradient-to))`,
          // This ensures the gradient origin also shifts with mouse movement relative to the button
        }}
      />
    </button>
  );
};
export default GeneratedComponent;