import React from 'react'
/**
 * This is the wave SVG used in the background of the home page
 *
 * Only hear for abstraction and keeping source code clean
*/
export const WaveSVG = () => {
  return (
    <svg
      width="2100"
      height="500"
      viewBox="0 0 1920 469"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_f_121_1243)">
        <path
          d="M2013.5 332C2111.46 270.26 2016.01 190.29 1995.67 132.889C1820.67 236.889 1325.67 357.997 1190.67 195.388C1099.08 84.8018 1019.56 1.80374 795.823 2.00035C613.087 6.73091 468.168 24.3884 235.168 134.388C235.168 134.388 46.0801 221.279 -17.3313 248.499C-28.4192 255.491 -91.0588 343.5 -54.8574 343.5C-28.8574 343.5 -84.5282 360.043 -17.3313 326.388C115.669 259.778 838.646 178.5 925.5 344.5C1010 506 1999.5 512.5 2013.5 332Z"
          fill="url(#paint0_linear_121_1243)"
          fillOpacity="0.9"
        />
        <path
          d="M2013.5 332C2111.46 270.26 2016.01 190.29 1995.67 132.889C1820.67 236.889 1325.67 357.997 1190.67 195.388C1099.08 84.8018 1019.56 1.80374 795.823 2.00035C613.087 6.73091 468.168 24.3884 235.168 134.388C235.168 134.388 46.0801 221.279 -17.3313 248.499C-28.4192 255.491 -91.0588 343.5 -54.8574 343.5C-28.8574 343.5 -84.5282 360.043 -17.3313 326.388C115.669 259.778 838.646 178.5 925.5 344.5C1010 506 1999.5 512.5 2013.5 332Z"
          fill="#BEBCBC"
          fillOpacity="0.25"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_121_1243"
          x="-68"
          y="0"
          width="2126.94"
          height="468.51"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1"
            result="effect1_foregroundBlur_121_1243"
          />
        </filter>
        <linearGradient
          id="paint0_linear_121_1243"
          x1="1015.12"
          y1="2"
          x2="1015.12"
          y2="472.746"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.119792" stopColor="#BB6BD9" />
          <stop offset="1" stopColor="#4659A7" />
        </linearGradient>
      </defs>
    </svg>
  );
};
