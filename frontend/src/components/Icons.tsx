export const CuponIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1"
  >
    <path d="M.5 11a1 1 0 0 0 .998 1h11.004a1 1 0 0 0 .998-1V8.966a2.037 2.037 0 0 1 0-3.932V3a1 1 0 0 0-.998-1H1.498A1 1 0 0 0 .5 3v2.03a2.037 2.037 0 0 1 0 3.94zm4.02-1.5l5-5" />
    <path d="M5.02 5.5a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1m4 4a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1" />
  </svg>
);

export const ContactIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <g>
      <path
        strokeDasharray="64"
        strokeDashoffset="64"
        d="M8 3c0.5 0 2.5 4.5 2.5 5c0 1 -1.5 2 -2 3c-0.5 1 0.5 2 1.5 3c0.39 0.39 2 2 3 1.5c1 -0.5 2 -2 3 -2c0.5 0 5 2 5 2.5c0 2 -1.5 3.5 -3 4c-1.5 0.5 -2.5 0.5 -4.5 0c-2 -0.5 -3.5 -1 -6 -3.5c-2.5 -2.5 -3 -4 -3.5 -6c-0.5 -2 -0.5 -3 0 -4.5c0.5 -1.5 2 -3 4 -3Z"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.6s"
          values="64;0"
        />
        <animateTransform
          id="SVG3Jm2WHSS"
          fill="freeze"
          attributeName="transform"
          begin="0.6s;SVG3Jm2WHSS.begin+2.7s"
          dur="0.5s"
          type="rotate"
          values="0 12 12;15 12 12;0 12 12;-12 12 12;0 12 12;12 12 12;0 12 12;-15 12 12;0 12 12"
        />
      </path>
      <path
        strokeDasharray="4"
        strokeDashoffset="4"
        d="M15.76 8.28c-0.5 -0.51 -1.1 -0.93 -1.76 -1.24M15.76 8.28c0.49 0.49 0.9 1.08 1.2 1.72"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="SVG3Jm2WHSS.begin+0s"
          dur="2.7s"
          keyTimes="0;0.111;0.259;0.37;1"
          values="4;0;0;4;4"
        />
      </path>
      <path
        strokeDasharray="6"
        strokeDashoffset="6"
        d="M18.67 5.35c-1 -1 -2.26 -1.73 -3.67 -2.1M18.67 5.35c0.99 1 1.72 2.25 2.08 3.65"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="SVG3Jm2WHSS.begin+0.2s"
          dur="2.7s"
          keyTimes="0;0.074;0.185;0.333;0.444;1"
          values="6;6;0;0;6;6"
        />
      </path>
    </g>
  </svg>
);
