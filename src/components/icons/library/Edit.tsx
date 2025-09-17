import React from 'react';
import { Gradient } from '../Gradient';

const Edit = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M1.30977 15.9261H15.0609M14.0084 1.68645L14.716 2.39401C15.3669 3.04496 15.3669 4.10034 14.716 4.75128L5.35182 14.1154C5.16884 14.2984 4.94577 14.4363 4.70028 14.5181L1.26698 15.6625C0.941212 15.7711 0.631289 15.4612 0.739878 15.1354L1.88431 11.7021C1.96614 11.4566 2.10401 11.2336 2.28698 11.0506L11.6512 1.68645C12.3021 1.03551 13.3575 1.03551 14.0084 1.68645Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Edit;