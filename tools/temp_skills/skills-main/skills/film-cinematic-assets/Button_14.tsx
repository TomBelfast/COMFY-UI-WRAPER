const GeneratedComponent = () => {
  const buttonRef = useRef(null);
  const [letters, setLetters] = useState([]);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Mouse position relative to the button
  const [isHovered, setIsHovered] = useState(false);

  const buttonText = "Get Started";

  // 1. APPEARANCE: Cinematic Text Reveal on Mount
  useEffect(() => {
    const chars = buttonText.split('').map((char, index) => ({
      char,
      id: index,
      initial: true,
      clicked: false,
      randX: (Math.random() - 0.5) * 400, // Pre-calculate random values for dispersal
      randY: (Math.random() - 0.5) * 300,
      randRotate: (Math.random() - 0.5) * 1080,
      randScale: 0.2 + Math.random() * 0.4,
    }));
    setLetters(chars);

    const initialAnimationTimer = setTimeout(() => {
      setLetters(prev => prev.map(l => ({ ...l, initial: false })));
    }, 100); // Small delay to ensure initial state is rendered

    return () => clearTimeout(initialAnimationTimer);
  }, []);

  // 2. DISPLAY: Mouse move for subtle interaction
  const handleMouseMove = useCallback((e) => {
    if (buttonRef.current && !isClicked) {
      const { left, top } = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - left; // X position within the element
      const y = e.clientY - top;  // Y position within the element
      setMousePos({ x, y });
    }
  }, [isClicked]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 }); // Reset mouse position
  }, []);

  // 3. DISAPPEARANCE/INTERACTION: On Click
  const handleClick = useCallback(() => {
    if (isClicked) return;
    setIsClicked(true);

    setLetters(prev => prev.map(l => ({ ...l, clicked: true })));

    // Optional: After dispersal, maybe re-enable or navigate
    // For this example, the button will remain in the dispersed state.
  }, [isClicked]);

  const getLetterStyle = useCallback((letter, index) => {
    const appearanceDelayFactor = 70; // ms per letter delay for entrance
    const appearanceDuration = 700; // ms for entrance animation
    const clickDuration = 1200; // ms for dispersal animation
    const idleGlowColor = '#c4b5fd'; // light purple-200
    const hoverGlowColor = '#a78bfa'; // purple-400

    let baseTransform = `scale(1) translateY(0px)`;
    let baseOpacity = 1;
    let baseFilter = 'blur(0px)';
    let baseTransition = `
      opacity ${appearanceDuration}ms cubic-bezier(0.25,1,0.5,1) ${index * appearanceDelayFactor}ms,
      filter ${appearanceDuration}ms cubic-bezier(0.25,1,0.5,1) ${index * appearanceDelayFactor}ms,
      transform ${appearanceDuration}ms cubic-bezier(0.25,1,0.5,1) ${index * appearanceDelayFactor}ms
    `;

    // 1. Appearance (Mount)
    if (letter.initial) {
      baseOpacity = 0;
      baseFilter = 'blur(8px)';
      baseTransform = `scale(0.8) translateY(20px)`;
    }

    // 3. Disappearance (onClick)
    if (letter.clicked) {
      return {
        opacity: 0,
        filter: 'blur(10px)',
        transform: `translate(${letter.randX}px, ${letter.randY}px) scale(${letter.randScale}) rotate(${letter.randRotate}deg)`,
        transition: `opacity ${clickDuration}ms ease-out ${index * 40}ms,
                     filter ${clickDuration}ms ease-out ${index * 40}ms,
                     transform ${clickDuration}ms ease-out ${index * 40}ms`,
        pointerEvents: 'none',
        willChange: 'opacity, filter, transform',
        position: 'relative',
        zIndex: 10 + index,
      };
    }

    // 2. Display (Idle/Hover/MouseMove)
    let dynamicTransform = '';
    let dynamicTextShadow = `
      0 0 8px ${idleGlowColor},
      0 0 15px rgba(167, 139, 250, 0.7),
      0 0 25px rgba(167, 139, 250, 0.5)
    `;
    let transitionProperties = baseTransition;

    if (isHovered && buttonRef.current) {
      // Find the specific letter's bounding box for more precise interaction
      const letterSpan = buttonRef.current.querySelector(`[data-letter-id="${letter.id}"]`);
      if (letterSpan) {
        const letterRect = letterSpan.getBoundingClientRect();
        const buttonRect = buttonRef.current.getBoundingClientRect();

        const letterCenterX = letterRect.left - buttonRect.left + (letterRect.width / 2);
        const letterCenterY = letterRect.top - buttonRect.top + (letterRect.height / 2);

        const dx = mousePos.x - letterCenterX;
        const dy = mousePos.y - letterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxDistance = 150; // Max distance for effect from mouse cursor
        const influence = Math.max(0, 1 - (distance / maxDistance)); // 1 when close, 0 when far

        const moveX = dx * 0.12 * influence; // Move 12% towards mouse
        const moveY = dy * 0.12 * influence;
        const rotateZ = (dx / letterRect.width) * 6 * influence; // Small rotation

        dynamicTransform = `translate(${moveX}px, ${moveY}px) rotateZ(${rotateZ}deg)`;
        dynamicTextShadow = `
          0 0 10px ${hoverGlowColor},
          0 0 20px rgba(167, 139, 250, 0.8),
          0 0 35px rgba(167, 139, 250, 0.6),
          ${-moveX * 0.5}px ${-moveY * 0.5}px 12px rgba(167, 139, 250, ${influence * 0.4})
        `;

        transitionProperties += `, transform 0.15s ease-out, text-shadow 0.15s ease-out`;
      }
    }

    return {
      opacity: baseOpacity,
      filter: baseFilter,
      transform: `${baseTransform} ${dynamicTransform}`,
      textShadow: dynamicTextShadow,
      transition: transitionProperties,
      willChange: 'opacity, filter, transform, text-shadow',
      position: 'relative',
      zIndex: 10,
    };
  }, [isClicked, isHovered, mousePos, letters]); // Re-evaluate if letter properties change

  // Dynamic style for the button's background glow on hover
  const buttonBackgroundGlowStyle = isHovered && !isClicked
    ? {
        background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(167, 139, 250, 0.2) 0%, transparent 60%)`,
        opacity: 1,
        transition: 'opacity 0.3s ease, background 0.05s linear',
        willChange: 'background, opacity',
      }
    : {
        opacity: 0,
        transition: 'opacity 0.3s ease',
      };

  const clickEffectStyle = isClicked
    ? {
        opacity: 1,
        transform: 'scale(1.5)', // Expands rapidly
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }
    : {
        opacity: 0,
        transform: 'scale(0.1)', // Starts small
        transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
      };


  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden
        px-8 py-4
        rounded-xl
        text-white text-3xl font-extrabold tracking-wider
        bg-gradient-to-br from-purple-900 to-indigo-950
        border-2 border-purple-700
        shadow-lg
        hover:scale-[1.03] active:scale-[0.97]
        transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
        focus:outline-none focus:ring-4 focus:ring-purple-600 focus:ring-opacity-75
        will-change-transform
        ${isClicked ? 'cursor-not-allowed' : 'cursor-pointer'}
        min-w-[200px] flex justify-center items-center
      `}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={isClicked}
    >
      <span className="sr-only">{buttonText}</span>
      <span aria-hidden="true" className="relative z-10 flex">
        {letters.map((letter) => (
          <span
            key={letter.id}
            data-letter-id={letter.id} // Custom attribute for precise targeting
            className={`
              inline-block
              ${letter.char === ' ' ? 'w-4 h-full pointer-events-none' : ''}
            `}
            style={getLetterStyle(letter, letter.id)}
          >
            {letter.char === ' ' ? '\u00A0' : letter.char}
          </span>
        ))}
      </span>

      {/* Background radial glow following mouse on hover */}
      <div
        className="absolute inset-0 z-0 rounded-xl pointer-events-none"
        style={buttonBackgroundGlowStyle}
      />

      {/* Click effect: rapid radial glow from center */}
      <div
        className="absolute inset-0 flex justify-center items-center z-20 pointer-events-none"
      >
        <div
          className="w-20 h-20 rounded-full bg-purple-400 opacity-0"
          style={{
            ...clickEffectStyle,
            boxShadow: '0 0 50px 20px #a78bfa, 0 0 100px 40px #a78bfa', // Intense glow
          }}
        />
      </div>
    </button>
  );
};
export default GeneratedComponent;