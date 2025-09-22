import React from 'react';
import { Gradient } from '../Gradient';

const Key = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="21" height="13" viewBox="0 0 21 13" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M10.4034 6.44525C10.4141 3.89205 8.353 1.81363 5.7998 1.80295C3.2466 1.79226 1.16819 3.85335 1.15751 6.40655C1.14682 8.95974 3.20791 11.0382 5.76111 11.0488C8.31431 11.0595 10.3927 8.99845 10.4034 6.44525ZM10.4034 6.44525L19.6494 6.48389M18.1501 6.47776L18.1345 10.2027M15.1515 6.46506L15.1423 8.69063" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1.25" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Key;