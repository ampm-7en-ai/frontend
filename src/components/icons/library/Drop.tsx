import React from 'react';
import { Gradient } from '../Gradient';

const Drop = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M10.1676 10.1756C10.1676 12.0168 8.67508 13.5093 6.83394 13.5093M12.6679 9.95504C12.6679 7.58296 9.73207 3.65453 8.0257 1.57155C7.40141 0.809483 6.26647 0.809483 5.64218 1.57155C3.93581 3.65453 1 7.58296 1 9.95504C1 13.2989 3.61194 16.0096 6.83394 16.0096C10.0559 16.0096 12.6679 13.2989 12.6679 9.95504Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>


  );
};

export default Drop;