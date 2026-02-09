const FranceMap = () => (
  <div className="aspect-[4/3] rounded-2xl bg-card border border-border overflow-hidden relative">
    <svg
      viewBox="0 0 600 600"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="600" height="600" fill="hsl(220, 18%, 12%)" />

      {/* Grid pattern */}
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path
            d="M 30 0 L 0 0 0 30"
            fill="none"
            stroke="hsl(220, 15%, 18%)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="600" height="600" fill="url(#grid)" />

      {/* France simplified shape */}
      <path
        d="M 280 80 L 320 75 L 370 90 L 400 85 L 430 100 L 450 130 L 460 160 L 470 180 L 480 200 L 490 230 L 500 260 L 490 290 L 470 310 L 450 340 L 430 370 L 410 400 L 390 420 L 370 440 L 340 460 L 310 470 L 280 480 L 250 470 L 230 450 L 200 430 L 180 400 L 160 370 L 150 340 L 140 310 L 130 280 L 140 250 L 150 220 L 160 200 L 170 180 L 190 150 L 210 120 L 230 100 L 260 85 Z"
        fill="hsl(0, 85%, 50%)"
        fillOpacity="0.15"
        stroke="hsl(0, 85%, 50%)"
        strokeWidth="2"
        strokeOpacity="0.6"
      />

      {/* Corsica */}
      <path
        d="M 480 400 L 490 395 L 495 410 L 500 430 L 495 450 L 485 455 L 480 440 L 475 420 Z"
        fill="hsl(0, 85%, 50%)"
        fillOpacity="0.15"
        stroke="hsl(0, 85%, 50%)"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />

      {/* Pulse dot — center of France */}
      <circle cx="310" cy="280" r="8" fill="hsl(0, 85%, 50%)" fillOpacity="0.3">
        <animate
          attributeName="r"
          from="8"
          to="24"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          from="0.4"
          to="0"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="310" cy="280" r="5" fill="hsl(0, 85%, 50%)" />

      {/* Label */}
      <text
        x="310"
        y="530"
        textAnchor="middle"
        fill="hsl(220, 10%, 55%)"
        fontSize="14"
        fontFamily="'Space Grotesk', sans-serif"
      >
        Intervention sur toute la France
      </text>
    </svg>
  </div>
);

export default FranceMap;
