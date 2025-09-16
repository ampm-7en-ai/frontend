import React from 'react';
import { Gradient } from '../Gradient';

const AreaChart = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M1 16L19 1M19 1L13.5147 1M19 1L19 6.48528M19 11.5V25M13 14.5V25M7 19V25M1 23.5V25" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'}
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default AreaChart;