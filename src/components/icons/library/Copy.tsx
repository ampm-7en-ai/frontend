import React from 'react';
import { Gradient } from '../Gradient';

const Copy = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M11.4175 3.42492V2.5914C11.4175 1.67083 10.6713 0.924561 9.7507 0.924561H3.08334C2.16277 0.924561 1.4165 1.67083 1.4165 2.5914V9.25883C1.4165 10.1794 2.16273 10.9256 3.08328 10.9257L3.91676 10.9257M11.4175 10.9257V8.84215M11.4175 10.9257V13.0092M11.4175 10.9257H9.33399M11.4175 10.9257H13.5011M8.08386 15.9262H14.7512C15.6718 15.9262 16.4181 15.1799 16.4181 14.2594V7.59202C16.4181 6.67145 15.6718 5.92518 14.7512 5.92518H8.08386C7.16329 5.92518 6.41702 6.67145 6.41702 7.59202V14.2594C6.41702 15.1799 7.16329 15.9262 8.08386 15.9262Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Copy;