import React from 'react';
import { Gradient } from '../Gradient';

const Play = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M12.3935 7.55405C12.909 7.88143 12.909 8.63373 12.3935 8.96111L2.28022 15.3839C1.72536 15.7363 1 15.3377 1 14.6804L1 1.83477C1 1.17747 1.72536 0.778854 2.28022 1.13124L12.3935 7.55405Z"
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Play;