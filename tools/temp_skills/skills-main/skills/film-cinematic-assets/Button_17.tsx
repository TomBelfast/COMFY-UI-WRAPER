const GeneratedComponent = () => {
  const buttonRef = useRef(null);
  const feTurbulenceRef = useRef(null);
  const feDisplacementMapRef = useRef(null);
  const feGaussianBlurRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Use refs to store current filter parameters for direct manipulation.
  // Initialize with subtle idle values.
  const currentDistortionScale = useRef(2);
  const currentBlurDeviation = useRef(0);
  const currentTurbulenceFreqX = useRef(0.005);
  const currentTurbulenceFreqY = useRef(0.01);

  // A ref to keep track of active animation frames for cancellation
  const activeAnimationId = useRef(null);

  // Function to apply current filter parameters to SVG elements
  const updateFilterAttributes = useCallback(() => {
    if (feDisplacementMapRef.current) {
      feDisplacementMapRef.current.setAttribute('scale', currentDistortionScale.current);
    }
    if (feGaussianBlurRef.current) {
      feGaussianBlurRef.current.setAttribute('stdDeviation', currentBlurDeviation.current);
    }
    if (feTurbulenceRef.current) {
      feTurbulenceRef.current.setAttribute('baseFrequency', `${currentTurbulenceFreqX.current} ${currentTurbulenceFreqY.current}`);
    }
  }, []);

  // Entrance Animation: Blobs coalesce into text
  useEffect(() => {
    const startDistortion = 80;
    const startBlur = 10;
    const startFreqX = 0.1;
    const startFreqY = 0.5;

    const targetDistortion = 2; // Subtle idle distortion
    const targetBlur = 0;
    const targetFreqX = 0.005; // Subtle idle turbulence
    const targetFreqY = 0.01;

    const duration = 1500; // milliseconds
    let startTime;

    const animateEntrance = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

      currentDistortionScale.current = startDistortion - (startDistortion - targetDistortion) * easedProgress;
      currentBlurDeviation.current = startBlur - (startBlur - targetBlur) * easedProgress;
      currentTurbulenceFreqX.current = startFreqX - (startFreqX - targetFreqX) * easedProgress;
      currentTurbulenceFreqY.current = startFreqY - (startFreqY - targetFreqY) * easedProgress;

      updateFilterAttributes();

      if (progress < 1) {
        activeAnimationId.current = requestAnimationFrame(animateEntrance);
      } else {
        // Ensure final values are exactly the target values
        currentDistortionScale.current = targetDistortion;
        currentBlurDeviation.current = targetBlur;
        currentTurbulenceFreqX.current = targetFreqX;
        currentTurbulenceFreqY.current = targetFreqY;
        updateFilterAttributes();
      }
    };
    activeAnimationId.current = requestAnimationFrame(animateEntrance);

    return () => cancelAnimationFrame(activeAnimationId.current);
  }, [updateFilterAttributes]); // Re-run if updateFilterAttributes changes (though unlikely with useCallback)

  // Mouse Move Interaction: Fluid wave distortion
  const handleMouseMove = useCallback((e) => {
    if (isClicked) return; // Disable interaction after click

    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left; // Mouse X relative to button
      const y = e.clientY - rect.top; // Mouse Y relative to button

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distanceX = Math.abs(x - centerX);
      const distanceY = Math.abs(y - centerY);

      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
      const currentDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Invert proximity: 1 at center, 0 at edge. This creates a "pulling" effect towards the center.
      const proximityFactor = 1 - (currentDistance / maxDistance);

      const maxDistortionOnHover = 20; // Max additional distortion scale
      const baseDistortion = 2; // Base distortion when idle

      // Set distortion scale based on hover and proximity
      currentDistortionScale.current = baseDistortion + maxDistortionOnHover * (isHovered ? proximityFactor : 0);

      // Adjust turbulence frequency slightly
      const baseFreqX = 0.005;
      const baseFreqY = 0.01;
      const freqMultiplier = 0.005;

      currentTurbulenceFreqX.current = baseFreqX + freqMultiplier * (isHovered ? proximityFactor : 0);
      currentTurbulenceFreqY.current = baseFreqY + freqMultiplier * 2 * (isHovered ? proximityFactor : 0);

      updateFilterAttributes(); // Apply changes directly
    }
  }, [isHovered, isClicked, updateFilterAttributes]);

  // Mouse Leave Animation: Settle back to idle
  const handleMouseLeave = useCallback(() => {
    if (isClicked) return;
    setIsHovered(false);

    // Cancel any ongoing animation
    cancelAnimationFrame(activeAnimationId.current);

    const startDistortion = currentDistortionScale.current;
    const startFreqX = currentTurbulenceFreqX.current;
    const startFreqY = currentTurbulenceFreqY.current;

    const targetDistortion = 2;
    const targetFreqX = 0.005;
    const targetFreqY = 0.01;

    const duration = 500;
    let startTime;

    const animateLeave = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = progress * progress; // Ease-in quadratic

      currentDistortionScale.current = startDistortion - (startDistortion - targetDistortion) * easedProgress;
      currentTurbulenceFreqX.current = startFreqX - (startFreqX - targetFreqX) * easedProgress;
      currentTurbulenceFreqY.current = startFreqY - (startFreqY - targetFreqY) * easedProgress;

      updateFilterAttributes();

      if (progress < 1) {
        activeAnimationId.current = requestAnimationFrame(animateLeave);
      } else {
        currentDistortionScale.current = targetDistortion;
        currentTurbulenceFreqX.current = targetFreqX;
        currentTurbulenceFreqY.current = targetFreqY;
        updateFilterAttributes();
      }
    };
    activeAnimationId.current = requestAnimationFrame(animateLeave);
  }, [isClicked, updateFilterAttributes]);

  // Click Interaction: Melt downwards and disappear
  const handleClick = useCallback(() => {
    setIsClicked(true);
    // Cancel any ongoing animation
    cancelAnimationFrame(activeAnimationId.current);

    const startDistortion = currentDistortionScale.current;
    const startBlur = currentBlurDeviation.current;
    const targetDistortion = 60; // Max out distortion
    const targetBlur = 20; // Max out blur

    const duration = 800;
    let startTime;

    const animateDisappearanceFilter = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = Math.pow(progress, 2); // Ease-in quadratic

      currentDistortionScale.current = startDistortion + (targetDistortion - startDistortion) * easedProgress;
      currentBlurDeviation.current = startBlur + (targetBlur - startBlur) * easedProgress;

      updateFilterAttributes();

      if (progress < 1) {
        activeAnimationId.current = requestAnimationFrame(animateDisappearanceFilter);
      } else {
        currentDistortionScale.current = targetDistortion;
        currentBlurDeviation.current = targetBlur;
        updateFilterAttributes();
        // At this point, the button content is likely fully distorted and moving away.
        // In a real app, this would trigger the actual button action or navigation.
      }
    };
    activeAnimationId.current = requestAnimationFrame(animateDisappearanceFilter);

  }, [updateFilterAttributes]);

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden
        px-8 py-3 rounded-full
        bg-gradient-to-br from-indigo-500 to-purple-600
        text-white font-extrabold text-2xl
        shadow-lg
        transition-[transform] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
        ${isHovered && !isClicked ? 'scale-105' : ''}
        ${isClicked ? 'pointer-events-none' : 'active:scale-95'}
        will-change-transform
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        // Custom shadow glow based on hover state
        boxShadow: isHovered && !isClicked
          ? '0 0 40px rgba(124, 58, 237, 0.7), 0 0 80px rgba(168, 85, 247, 0.5)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* SVG for Liquid Filter Definition */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <filter id="liquid-morpher-filter">
          {/* Generates a turbulence noise pattern */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.05"
            numOctaves="1"
            seed="0" // Consistent noise pattern
            result="noise"
            ref={feTurbulenceRef}
          />
          {/* Displaces the SourceGraphic (the button text) based on the noise */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0" // Initial scale, will be animated
            xChannelSelector="R"
            yChannelSelector="G"
            ref={feDisplacementMapRef}
          />
          {/* Applies a Gaussian blur to the SourceGraphic */}
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="0" // Initial blur, will be animated
            result="blurred"
            ref={feGaussianBlurRef}
          />
          {/* No feBlend is needed here as feDisplacementMap and feGaussianBlur act directly on SourceGraphic in sequence */}
        </filter>
      </svg>

      {/* The actual button text */}
      <span
        className={`
          relative z-10 block
          transition-[transform,opacity] ease-[cubic-bezier(0.4,0,0.2,1)] duration-[800ms]
          will-change-transform
          ${isClicked ? 'translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'}
        `}
        style={{
          filter: 'url(#liquid-morpher-filter)', // Apply the SVG filter to the text
        }}
      >
        Get Started
      </span>
    </button>
  );
};
export default GeneratedComponent;