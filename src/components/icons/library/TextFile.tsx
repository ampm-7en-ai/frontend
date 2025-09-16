import React from 'react';
import { Gradient } from '../Gradient';

const TextFile = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="18" height="23" viewBox="0 0 18 23" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M16.75 8.875H11.5C10.0503 8.875 8.875 7.69975 8.875 6.25V1M4.9375 18.0625H12.8125M4.9375 14.125H8.875M16.75 8.64981V19.375C16.75 20.8247 15.5747 22 14.125 22H3.625C2.17525 22 1 20.8247 1 19.375V3.625C1 2.17525 2.17525 1 3.625 1H9.10019C9.79638 1 10.4641 1.27656 10.9563 1.76884L15.9812 6.79366C16.4734 7.28594 16.75 7.95362 16.75 8.64981Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'}
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default TextFile;