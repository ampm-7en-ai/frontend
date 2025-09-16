import React from 'react';
import { Gradient } from '../Gradient';

const Layer = ({ type, className = '', color = '#737373' }) => {
  return (
   

<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13M13 7C9.68629 7 7 9.68629 7 13M13 7C16.3137 7 19 9.68629 19 13C19 16.3137 16.3137 19 13 19C9.68629 19 7 16.3137 7 13" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'}
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Layer;