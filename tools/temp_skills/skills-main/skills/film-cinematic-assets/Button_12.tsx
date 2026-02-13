const GeneratedComponent = () => {
  const buttonRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Staggered entrance animation for the component
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 100); // Small initial delay for overall component mounting
    return () => clearTimeout(timeout);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!buttonRef.current) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - (left + width / 2); // Mouse X relative to center of button
    const y = e.clientY - (top + height / 2); // Mouse Y relative to center of button
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 }); // Reset position on mouse leave
  }, []);

  const handleClick = useCallback(() => {
    if (clicked) return; // Prevent multiple clicks
    setClicked(true);
    // For demonstration, you could add a callback here for actual button action after animation
    // setTimeout(() => {
    //   alert('Button Action Triggered!');
    //   setClicked(false); // Optionally reset button after action
    // }, 700);
  }, [clicked]);

  // Calculate shard transforms based on mouse position
  // xOffset and yOffset are base offsets for the shard's natural position
  // depth controls parallax intensity
  const getShardTransform = (xOffset, yOffset, depth = 1) => {
    const rx = mousePos.x * 0.04 * depth; // Adjust multiplier for intensity
    const ry = mousePos.y * 0.04 * depth;
    // For mounted state, we want them at their 'natural' position plus mouse effect
    return `translateX(calc(${xOffset} + ${rx}px)) translateY(calc(${yOffset} + ${ry}px))`;
  };

  const commonShardClasses = `
    absolute will-change-transform will-change-opacity rounded-lg 
    backdrop-blur-[10px] bg-white/[0.03] border border-white/[0.1] 
    transition-[transform,opacity,background-color,border-color] ease-[cubic-bezier(0.25,1,0.5,1)] duration-500
    group-hover:bg-white/[0.05] group-hover:border-blue-300/[0.3]
  `;
  
  // Custom cubic-bezier for entrance/exit smoothness
  const entranceExitEase = 'ease-[cubic-bezier(0.25,1,0.5,1)]';
  const textEntranceDelay = 0.6; // delay for "Get Started" text

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden p-6 min-w-[200px] h-[70px] flex items-center justify-center
        rounded-xl text-white font-bold text-lg tracking-wide shadow-lg
        border border-blue-500/[0.3]
        transform transition-[transform,opacity,box-shadow] ${entranceExitEase} duration-300
        hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
        group cursor-pointer
        ${clicked ? 'pointer-events-none' : ''}
      `}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform: clicked ? 'scale(0.01) perspective(500px) rotateX(20deg)' : (mounted ? 'scale(1)' : 'scale(0.8)'),
        opacity: clicked ? '0' : (mounted ? '1' : '0'),
        transitionDelay: clicked ? '0s' : '0.1s', // Ensure click animation starts immediately
        boxShadow: clicked ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      }}
    >
      {/* Shard 1 (Top-Left) */}
      <div
        className={commonShardClasses}
        style={{
          width: '40%', height: '40%', top: '0', left: '0',
          transform: clicked
            ? 'scale(0) translate(-50%, -50%)'
            : mounted
              ? getShardTransform('0%', '0%', 1)
              : 'translate(-150%, -150%)', // Initial off-screen position
          opacity: mounted ? '1' : '0',
          transitionDelay: clicked ? '0s' : (mounted ? '0.15s' : '0s'),
        }}
      ></div>

      {/* Shard 2 (Bottom-Right) */}
      <div
        className={commonShardClasses}
        style={{
          width: '50%', height: '50%', bottom: '0', right: '0',
          transform: clicked
            ? 'scale(0) translate(50%, 50%)'
            : mounted
              ? getShardTransform('0%', '0%', 1.2)
              : 'translate(150%, 150%)', // Initial off-screen position
          opacity: mounted ? '1' : '0',
          transitionDelay: clicked ? '0s' : (mounted ? '0.25s' : '0s'),
        }}
      ></div>

      {/* Shard 3 (Center-Left vertical strip) */}
      <div
        className={commonShardClasses}
        style={{
          width: '60%', height: '30%', top: '50%', left: '0',
          transform: clicked
            ? 'scale(0) translateX(-100%)'
            : mounted
              ? getShardTransform('0%', '-50%', 0.8)
              : 'translate(-150%, -50%)', // Initial off-screen position
          opacity: mounted ? '1' : '0',
          transitionDelay: clicked ? '0s' : (mounted ? '0.35s' : '0s'),
        }}
      ></div>

      {/* Shard 4 (Center-Right vertical strip) */}
      <div
        className={commonShardClasses}
        style={{
          width: '60%', height: '30%', top: '50%', right: '0',
          transform: clicked
            ? 'scale(0) translateX(100%)'
            : mounted
              ? getShardTransform('0%', '-50%', 0.9)
              : 'translate(150%, -50%)', // Initial off-screen position
          opacity: mounted ? '1' : '0',
          transitionDelay: clicked ? '0s' : (mounted ? '0.45s' : '0s'),
        }}
      ></div>

      {/* Shard 5 (Central Overlay - covers most, reactive) */}
      <div
        className={commonShardClasses}
        style={{
          inset: '8px', // Slightly inset from button edges
          transform: clicked
            ? 'scale(0) perspective(500px) rotateX(30deg) translateY(20%)' // More dramatic disappear
            : mounted
              ? getShardTransform('0%', '0%', 1.5) // Most reactive to mouse
              : 'scale(0) translate(0%, 0%)', // Initial scaled-down position
          opacity: mounted ? '1' : '0',
          transitionDelay: clicked ? '0s' : (mounted ? '0.55s' : '0s'),
          zIndex: 5, // Ensure this shard is below text but above others
        }}
      ></div>

      <span
        className={`relative z-10 will-change-transform will-change-opacity
                   transition-[transform,opacity] ${entranceExitEase} duration-300
        `}
        style={{
          transform: clicked ? 'scale(0.75) translateY(-10px)' : (mounted ? 'translateY(0)' : 'translateY(10px)'),
          opacity: clicked ? '0' : (mounted ? '1' : '0'),
          transitionDelay: clicked ? '0s' : (mounted ? `${textEntranceDelay}s` : '0s'),
        }}
      >
        Get Started
      </span>
    </button>
  );
};
export default GeneratedComponent;