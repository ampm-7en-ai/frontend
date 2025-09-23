import React from 'react';
import { Gradient } from '../Gradient';

const Loading = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M8.08407 1V3.50026M15.1681 8.08407H12.6679M8.08407 12.6679V15.1681M3.50026 8.08407H1M13.0933 13.0933L11.3253 11.3253M4.84283 4.84283L3.07488 3.07487M3.07485 13.0931L4.8428 11.3252M11.3253 4.84276L13.0933 3.07481" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Loading;