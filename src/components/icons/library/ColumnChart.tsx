import React from 'react';
import { Gradient } from '../Gradient';

const ColumnChart = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M13 4.5V17M13 4.5V2C13 1.44772 12.5523 1 12 1H8C7.44772 1 7 1.44772 7 2V7.5M13 4.5H18C18.5523 4.5 19 4.94772 19 5.5V16C19 16.5523 18.5523 17 18 17H13M13 17H7M7 7.5V17M7 7.5H1.99967C1.44738 7.5 1 7.94772 1 8.5V16C1 16.5523 1.44772 17 2 17H7" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'}
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default ColumnChart;