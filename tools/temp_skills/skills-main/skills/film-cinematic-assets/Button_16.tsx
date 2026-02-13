const GeneratedComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const buttonRef = useRef(null);
  const textRef = useRef(null);
  const turbulenceRef = useRef(null);
  const displacementRef = useRef(null);
  const animationFrameRef = useRef(null);
  const filterId = useRef(`liquid-filter-${Math.random().toString(36).substring(7)}`);

  // Define key filter values for different states
  const initialBaseFrequency = 0.01;
  const initialScale = 0;
  const hoverScale = 12; // Max displacement on hover
  const hoverFreq = 0.06; // Max frequency on hover
  const meltScale = 50; // Max displacement on click
  const meltFreq = 0.11; // Max frequency on click

  // Store current filter values to animate from
  const currentFilterValues = useRef({
    baseFrequencyX: initialBaseFrequency,
    baseFrequencyY: initialBaseFrequency,
    scale: initialScale
  });

  // Helper to update filter attributes directly on SVG elements
  const updateFilter = useCallback((freqX, freqY, scale) => {
    if (turbulenceRef.current && displacementRef.current) {
      turbulenceRef.current.setAttribute('baseFrequency', `${freqX} ${freqY}`);
      displacementRef.current.setAttribute('scale', scale.toString());
    }
    currentFilterValues.current = { baseFrequencyX: freqX, baseFrequencyY: freqY, scale: scale };
  }, []);

  // Entrance Animation: Blobs coalesce into text
  useEffect(() => {
    // Set initial distorted state for filter
    updateFilter(0.05, 0.05, 20); // More distortion initially

    const entranceStart = performance.now();
    const entranceDuration = 800; // milliseconds for the animation

    const animateEntrance = (timestamp) => {
      const elapsed = timestamp - entranceStart;
      const progress = Math.min(1, elapsed / entranceDuration);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic easing out for text and filter to settle

      // Animate filter values from distorted to initial
      const freqX = 0.05 - (0.05 - initialBaseFrequency) * easeProgress;
      const freqY = 0.05 - (0.05 - initialBaseFrequency) * easeProgress;
      const scale = 20 - (20 - initialScale) * easeProgress;
      updateFilter(freqX, freqY, scale);

      // Animate text opacity and transform
      if (textRef.current) {
        textRef.current.style.opacity = easeProgress.toString();
        textRef.current.style.transform = `translateY(${20 - 20 * easeProgress}px)`;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateEntrance);
      } else {
        // Ensure final state is accurately set
        updateFilter(initialBaseFrequency, initialBaseFrequency, initialScale);
        if (textRef.current) {
          textRef.current.style.opacity = '1';
          textRef.current.style.transform = 'translateY(0px)';
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateEntrance);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [updateFilter]);

  // Mouse Move / Hover interaction: Fluid wave distortion
  const handleMouseMove = useCallback((e) => {
    if (isClicked) return;
    setIsHovered(true);

    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize mouse position to [0, 1] relative to button
    const normX = x / rect.width;
    const normY = y / rect.height;

    // Calculate dynamic values for filter based on mouse position
    // This creates a "wave" effect where distortion is stronger near the mouse pointer.
    const currentFreqX = initialBaseFrequency + (hoverFreq - initialBaseFrequency) * Math.sin(normX * Math.PI);
    const currentFreqY = initialBaseFrequency + (hoverFreq - initialBaseFrequency) * Math.sin(normY * Math.PI);
    const currentScale = initialScale + (hoverScale - initialScale) * Math.sin(normX * Math.PI) * Math.sin(normY * Math.PI); // Strongest near center

    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      updateFilter(currentFreqX, currentFreqY, currentScale);
    });
  }, [isClicked, updateFilter, initialBaseFrequency, hoverFreq, initialScale, hoverScale]);

  const handleMouseLeave = useCallback(() => {
    if (isClicked) return;
    setIsHovered(false);

    // Animate filter values back to idle state
    const leaveStart = performance.now();
    const leaveDuration = 300; // milliseconds
    const startValues = { ...currentFilterValues.current }; // Capture current values to animate from

    const animateLeave = (timestamp) => {
      const elapsed = timestamp - leaveStart;
      const progress = Math.min(1, elapsed / leaveDuration);
      const easeProgress = progress; // Linear or custom easing

      const freqX = startValues.baseFrequencyX - (startValues.baseFrequencyX - initialBaseFrequency) * easeProgress;
      const freqY = startValues.baseFrequencyY - (startValues.baseFrequencyY - initialBaseFrequency) * easeProgress;
      const scale = startValues.scale - (startValues.scale - initialScale) * easeProgress;

      updateFilter(freqX, freqY, scale);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateLeave);
      } else {
        updateFilter(initialBaseFrequency, initialBaseFrequency, initialScale); // Ensure final state
      }
    };

    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animateLeave);
  }, [isClicked, updateFilter, initialBaseFrequency, initialScale]);

  // Click Animation: Melt downwards
  const handleClick = useCallback(() => {
    if (isClicked) return;
    setIsClicked(true);

    cancelAnimationFrame(animationFrameRef.current);

    // Animate text melt (opacity and translateY) using CSS transitions
    if (textRef.current) {
      textRef.current.style.transition = 'opacity 0.8s cubic-bezier(0.25,1,0.5,1), transform 0.8s cubic-bezier(0.25,1,0.5,1)';
      textRef.current.style.opacity = '0';
      textRef.current.style.transform = 'translateY(50px)'; // Melt downwards
    }

    // Animate filter distortion for melting effect using requestAnimationFrame
    const meltStart = performance.now();
    const meltDuration = 800; // milliseconds
    const startValues = { ...currentFilterValues.current };

    const animateMelt = (timestamp) => {
      const elapsed = timestamp - meltStart;
      const progress = Math.min(1, elapsed / meltDuration);
      const easeProgress = progress; // Linear easing for a consistent "melt"

      const freqX = startValues.baseFrequencyX + (meltFreq - startValues.baseFrequencyX) * easeProgress;
      const freqY = startValues.baseFrequencyY + (meltFreq - startValues.baseFrequencyY) * easeProgress;
      const scale = startValues.scale + (meltScale - startValues.scale) * easeProgress;

      updateFilter(freqX, freqY, scale);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateMelt);
      } else {
        // Hide button completely after melt animation
        if (buttonRef.current) {
          buttonRef.current.style.pointerEvents = 'none';
          buttonRef.current.style.transition = 'opacity 0.5s ease-out 0.2s';
          buttonRef.current.style.opacity = '0';
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateMelt);

  }, [isClicked, updateFilter, meltFreq, meltScale]);

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden
        px-8 py-3 rounded-full
        text-white text-lg font-semibold
        bg-purple-600 hover:bg-purple-700
        shadow-lg hover:shadow-purple-500/50
        transition-[transform,background-color,shadow] ease-[cubic-bezier(0.25,1,0.5,1)] duration-300
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-purple-500/50
        will-change-transform
        ${isClicked ? 'cursor-not-allowed opacity-100' : ''} /* Ensure visible initially, then JS handles fade */
      `}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={isClicked}
    >
      {/* Hidden SVG for filter definitions */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0">
        <filter id={filterId.current}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.01" // Initial subtle frequency
            numOctaves="3"
            seed="0"
            result="noise"
            ref={turbulenceRef}
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0" // Initial no displacement
            xChannelSelector="R"
            yChannelSelector="G"
            ref={displacementRef}
          />
        </filter>
      </svg>

      {/* Button text, styled to use the SVG filter */}
      <span
        ref={textRef}
        className="
          relative z-10 block whitespace-nowrap
          /* Initial state for entrance animation, will be overridden by JS */
          opacity-0 transform translate-y-4
          will-change-transform
        "
        style={{
          filter: `url(#${filterId.current})`,
        }}
      >
        Get Started
      </span>

      {/* Background glow effect on hover */}
      <div
        className={`
          absolute inset-0 rounded-full
          bg-gradient-to-r from-purple-400 to-pink-500
          transition-opacity duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isHovered ? 'opacity-20' : 'opacity-0'}
        `}
      ></div>
    </button>
  );
};

export default GeneratedComponent;