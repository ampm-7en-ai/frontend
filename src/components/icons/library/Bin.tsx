import React from 'react';
import { Gradient } from '../Gradient';

const Bin = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M13.0179 3.42482H15.5182M13.0179 3.42482V14.2593C13.0179 15.1798 12.2716 15.9261 11.3511 15.9261H4.6837C3.76313 15.9261 3.01686 15.1798 3.01686 14.2593V3.42482M13.0179 3.42482H3.01686M0.516602 3.42482H3.01686M6.35054 6.34179V13.0091M9.68422 6.34179V13.0091M5.10041 0.924561H10.9343" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Bin;