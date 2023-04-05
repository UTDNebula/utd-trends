import React from 'react';
/**
 * This is the custom Search Icon SVG
 *
 * This component simply returns the source of the svg so that it can be manipulated directly in
 * the DOM rather than using an IMG tag. Change color of the svg by changing the text color of the
 * surrounding div.
 */
export function SearchIcon() {
  return (
    <>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 41 45"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.5573 37.9206C21.4171 37.9197 25.1658 36.5308 28.2063 33.975L37.7659 44.2503L40.8408 40.9452L31.2812 30.6699C33.6602 27.4014 34.9532 23.3711 34.9541 19.2212C34.9541 8.91076 27.1494 0.521729 17.5573 0.521729C7.96507 0.521729 0.1604 8.91076 0.1604 19.2212C0.1604 29.5315 7.96507 37.9206 17.5573 37.9206ZM17.5573 5.19658C24.753 5.19658 30.6049 11.4866 30.6049 19.2212C30.6049 26.9557 24.753 33.2457 17.5573 33.2457C10.3615 33.2457 4.50961 26.9557 4.50961 19.2212C4.50961 11.4866 10.3615 5.19658 17.5573 5.19658Z"
          fill="currentColor"
          stroke="currentColor"
        />
        <path
          d="M20.6278 15.9161C21.452 16.8043 21.9065 17.9777 21.9065 19.2212H26.2557C26.2577 17.9927 26.033 16.776 25.5948 15.6414C25.1566 14.5068 24.5135 13.4768 23.7027 12.611C20.4104 9.07678 14.702 9.07678 11.4119 12.611L14.4824 15.9208C16.1351 14.149 18.9838 14.1537 20.6278 15.9161Z"
          fill="currentColor"
          stroke="currentColor"
        />
      </svg>
    </>
  );
}
