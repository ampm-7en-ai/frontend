import React from 'react';
import { Gradient } from '../Gradient';

const Like = ({ type, className = '', color = '#737373' }) => {
  return (
   
<svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M14.0943 1C12.2422 1 11.1327 1.96238 10.5451 2.72298C10.3135 3.02282 9.68665 3.02277 9.45502 2.72291C8.8675 1.96232 7.75813 1 5.90572 1C2.84428 1 1 3.82462 1 6.15242C1 9.289 6.81792 13.7477 9.0984 15.3749C9.64201 15.7628 10.358 15.7629 10.9017 15.3751C13.1822 13.7482 19 9.29064 19 6.15312C19 3.82462 17.1572 1 14.0943 1Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'}
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Like;