import React from 'react';
import { Gradient } from '../Gradient';

const Scatter = ({ type, className = '', color = '#737373' }) => {
  return (

    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15.1681 2.25013C15.1681 2.94056 14.6084 3.50026 13.918 3.50026C13.2276 3.50026 12.6679 2.94056 12.6679 2.25013C12.6679 1.5597 13.2276 1 13.918 1C14.6084 1 15.1681 1.5597 15.1681 2.25013Z" 
        stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
        strokeWidth="1" 
        strokeLinecap="round"/>
    <path d="M12.6679 12.2512C12.6679 12.9416 12.1082 13.5013 11.4177 13.5013C10.7273 13.5013 10.1676 12.9416 10.1676 12.2512C10.1676 11.5607 10.7273 11.001 11.4177 11.001C12.1082 11.001 12.6679 11.5607 12.6679 12.2512Z" 
        stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
        strokeWidth="1" 
        strokeLinecap="round"/>
    <path d="M9.3342 7.66736C9.3342 8.58793 8.58793 9.3342 7.66736 9.3342C6.74679 9.3342 6.00052 8.58793 6.00052 7.66736C6.00052 6.74679 6.74679 6.00052 7.66736 6.00052C8.58793 6.00052 9.3342 6.74679 9.3342 7.66736Z" 
        stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
        strokeWidth="1" 
        strokeLinecap="round"/>
    <path d="M8.50078 1.83342C8.50078 2.2937 8.12764 2.66684 7.66736 2.66684C7.20707 2.66684 6.83394 2.2937 6.83394 1.83342C6.83394 1.37313 7.20707 1 7.66736 1C8.12764 1 8.50078 1.37313 8.50078 1.83342Z" 
        stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
        strokeWidth="1" 
        strokeLinecap="round"/>
    <path d="M2.66684 9.3342C2.66684 9.79448 2.2937 10.1676 1.83342 10.1676C1.37313 10.1676 1 9.79448 1 9.3342C1 8.87391 1.37313 8.50078 1.83342 8.50078C2.2937 8.50078 2.66684 8.87391 2.66684 9.3342Z" 
        stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
        strokeWidth="1" 
        strokeLinecap="round"/>
    <path d="M2.66684 3.08355C2.66684 3.31369 2.48027 3.50026 2.25013 3.50026C2.01999 3.50026 1.83342 3.31369 1.83342 3.08355C1.83342 2.85341 2.01999 2.66684 2.25013 2.66684C2.48027 2.66684 2.66684 2.85341 2.66684 3.08355Z" 
        stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
        strokeWidth="1" 
        strokeLinecap="round"/>
    <path d="M14.3347 8.08407C14.3347 8.31421 14.1481 8.50078 13.918 8.50078C13.6879 8.50078 13.5013 8.31421 13.5013 8.08407C13.5013 7.85393 13.6879 7.66736 13.918 7.66736C14.1481 7.66736 14.3347 7.85393 14.3347 8.08407Z" 
        stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
        strokeWidth="1" 
        strokeLinecap="round"/>
    <path d="M6.00052 13.918C6.00052 14.1481 5.81395 14.3347 5.58381 14.3347C5.35367 14.3347 5.1671 14.1481 5.1671 13.918C5.1671 13.6879 5.35367 13.5013 5.58381 13.5013C5.81395 13.5013 6.00052 13.6879 6.00052 13.918Z" 
        stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
       <Gradient className={className} />
</svg>

  );
};

export default Scatter;