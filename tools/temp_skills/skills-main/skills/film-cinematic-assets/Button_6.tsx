const GeneratedComponent = () => {
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blurDeviation, setBlurDeviation] = useState(15);

  // Initial blob state (start small and off-screen for entrance)
  const initialBlobs = useRef([
    { id: 1, cx: -10, cy: -10, r: 0 },
    { id: 2, cx: -10, cy: 110, r: 0 },
    { id: 3, cx: 110, cy: -10, r: 0 },
    { id: 4, cx: 110, cy: 110, r: 0 },
    { id: 5, cx: 50, cy: 50, r: 0 }, // Central blob
  ]);
  const [blobPositions, setBlobPositions] = useState(initialBlobs.current);

  const buttonText = "Get Started";

  // Animation states for appearance
  const [textOpacity, setTextOpacity] = useState(0);
  const [textScale, setTextScale] = useState(0.8);
  const [textTranslateY, setTextTranslateY] = useState(10);
  const [blobsVisible, setBlobsVisible] = useState(false);

  useEffect(() => {
    // Entrance Animation on Mount
    const timeoutBlobs = setTimeout(() => {
      setBlobsVisible(true);
      // Animate blobs to form a general button shape
      setBlobPositions([
        { id: 1, cx: 30, cy: 50, r: 25 },
        { id: 2, cx: 70, cy: 50, r: 25 },
        { id: 3, cx: 50, cy: 30, r: 20 },
        { id: 4, cx: 50, cy: 70, r: 20 },
        { id: 5, cx: 50, cy: 50, r: 30 },
      ]);
    }, 100);

    const timeoutText = setTimeout(() => {
      setTextOpacity(1);
      setTextScale(1);
      setTextTranslateY(0);
    }, 600); // After blobs are mostly formed

    return () => {
      clearTimeout(timeoutBlobs);
      clearTimeout(timeoutText);
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Calculate mouse position relative to button's top-left corner
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setBlurDeviation(18); // More blur on hover for a softer look
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 }); // Reset mouse position
    setBlurDeviation(15); // Reset blur
  }, []);

  const handleClick = useCallback(() => {
    if (isClicked) return; // Prevent multiple clicks
    setIsClicked(true);

    // Disappearance: Melt downwards
    setTextOpacity(0);
    setTextScale(0.7);
    setTextTranslateY(30);
    setBlurDeviation(30); // Max blur for melt effect

    setBlobPositions(currentBlobs =>
      currentBlobs.map(blob => ({
        ...blob,
        cy: blob.cy + 50, // Move blobs down
        r: blob.r * 0.5,  // Shrink blobs
      }))
    );
    setBlobsVisible(false); // Hide blobs completely after moving

    // Optional: After animation, trigger actual button action or reset
    setTimeout(() => {
      console.log("Button clicked and melted!");
      // In a real application, you might navigate or submit a form here.
      // For this demo, we can reset the state to allow re-clicking:
      // setIsClicked(false);
      // setTextOpacity(0); setTextScale(0.8); setTextTranslateY(10);
      // setBlobsVisible(false); setBlobPositions(initialBlobs.current);
      // setTimeout(() => {
      //   setBlobsVisible(true);
      //   setBlobPositions([...initialBlobs.current].map((b, i) => {
      //     return i === 0 ? { id: 1, cx: 30, cy: 50, r: 25 } :
      //            i === 1 ? { id: 2, cx: 70, cy: 50, r: 25 } :
      //            i === 2 ? { id: 3, cx: 50, cy: 30, r: 20 } :
      //            i === 3 ? { id: 4, cx: 50, cy: 70, r: 20 } :
      //            { id: 5, cx: 50, cy: 50, r: 30 };
      //   }));
      // }, 100);
      // setTimeout(() => {
      //   setTextOpacity(1); setTextScale(1); setTextTranslateY(0);
      // }, 600);
    }, 700);
  }, [isClicked]);

  // Dynamic blob styling for mouse interaction (fluid wave distortion)
  const getBlobTransform = useCallback((blobCx, blobCy) => {
    if (!buttonRef.current || !isHovered) return "translate(0, 0)";

    const rect = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = rect.width / 2;
    const buttonCenterY = rect.height / 2;

    // Normalize mouse position relative to button center
    const mouseX = mousePos.x - buttonCenterX;
    const mouseY = mousePos.y - buttonCenterY;

    // Calculate influence based on proximity to the blob itself
    const distToBlobX = blobCx - mousePos.x;
    const distToBlobY = blobCy - mousePos.y;
    const dist = Math.sqrt(distToBlobX * distToBlobX + distToBlobY * distToBlobY);

    // A "push" effect away from the mouse, stronger closer to mouse
    const maxPush = 15; // Max pixels to push
    const influenceRadius = 100; // Radius of influence for distortion

    let pushX = 0;
    let pushY = 0;

    if (dist < influenceRadius && dist !== 0) { // Avoid division by zero
      const strength = (1 - dist / influenceRadius); // Stronger closer to mouse
      pushX = (distToBlobX / dist) * maxPush * strength;
      pushY = (distToBlobY / dist) * maxPush * strength;
    }

    return `translate(${pushX}px, ${pushY}px)`;
  }, [isHovered, mousePos]);


  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden
        w-[200px] h-[60px] rounded-full
        flex items-center justify-center
        text-white [will-change:transform,filter]
        transition-[transform,filter] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900
        bg-gradient-to-br from-purple-600 to-pink-500
        shadow-lg hover:shadow-2xl shadow-purple-500/50 hover:shadow-purple-400/70
        group
        ${isClicked ? 'pointer-events-none' : ''}
      `}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* SVG for liquid morpher effect */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100" // Use a viewBox for scalable SVG
        preserveAspectRatio="none"
        style={{
          filter: `url(#liquid-filter)`,
          transform: isClicked ? 'translateY(100%)' : 'translateY(0%)',
          transition: 'transform 0.7s ease-[cubic-bezier(0.6,0.01,-0.05,0.9)]'
        }}
      >
        <defs>
          <filter id="liquid-filter">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={blurDeviation} // Dynamically adjust blur
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" // Metaball effect
              result="metaballs"
            />
            <feComposite in="SourceGraphic" in2="metaballs" operator="atop" />
          </filter>
        </defs>

        <g className="blobs-container">
          {blobPositions.map((blob) => (
            <circle
              key={blob.id}
              cx={blob.cx}
              cy={blob.cy}
              r={blob.r}
              fill="currentColor" // Using current color from parent button for blobs
              className="[will-change:transform,r,cx,cy,opacity] transition-[transform,r,cx,cy,opacity] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                transform: getBlobTransform(blob.cx, blob.cy),
                opacity: blobsVisible ? 1 : 0, // Fade in/out blobs
              }}
            />
          ))}
        </g>
      </svg>

      {/* Text content */}
      <span
        className="relative z-10 text-lg font-bold
                   [will-change:transform,opacity]
                   transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          opacity: textOpacity,
          transform: `scale(${textScale}) translateY(${textTranslateY}px)`,
          // Ensure text doesn't interfere with SVG click events when melting
          pointerEvents: isClicked ? 'none' : 'auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundImage: 'linear-gradient(to right, #ffffff, #e0e0e0)', // Gradient text
        }}
      >
        {buttonText}
      </span>
    </button>
  );
};

export default GeneratedComponent;