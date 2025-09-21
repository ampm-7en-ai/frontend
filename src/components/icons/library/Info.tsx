import React from 'react';
import { Gradient } from '../Gradient';

const Info = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M16.0016 8.50078C16.0016 12.6433 12.6433 16.0016 8.50078 16.0016C4.35821 16.0016 1 12.6433 1 8.50078C1 4.35821 4.35821 1 8.50078 1C12.6433 1 16.0016 4.35821 16.0016 8.50078Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
<path d="M7.66736 8.50079V11.8345C7.66736 12.2948 8.04049 12.6679 8.50078 12.6679C8.96106 12.6679 9.3342 12.2948 9.3342 11.8345V8.50079C9.3342 8.0405 8.96106 7.66737 8.50078 7.66737C8.04049 7.66737 7.66736 8.0405 7.66736 8.50079Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
<path d="M9.3342 5.16711C9.3342 4.70682 8.96106 4.33369 8.50078 4.33369C8.04049 4.33369 7.66736 4.70682 7.66736 5.16711C7.66736 5.62739 8.04049 6.00053 8.50078 6.00053C8.96106 6.00053 9.3342 5.62739 9.3342 5.16711Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>


  );
};

export default Info;