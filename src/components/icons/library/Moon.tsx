import React from 'react';
import { Gradient } from '../Gradient';

const Moon = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M5.39778 0.812256C2.7768 1.78344 1.27051 4.30841 1.27051 7.26714C1.27051 11.0668 4.35065 14.147 8.15034 14.147C11.1091 14.147 13.6341 12.6405 14.6052 10.0197C13.8218 10.335 12.9665 10.496 12.07 10.496C8.31492 10.496 4.92159 7.1027 4.92159 3.34757C4.92159 2.45109 5.08251 1.59628 5.39778 0.812256Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Moon;