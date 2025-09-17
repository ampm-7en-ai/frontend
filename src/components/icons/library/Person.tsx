import React from 'react';
import { Gradient } from '../Gradient';

const Person = ({ type, className = '', color = '#737373' }) => {
  return (
   
    <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M0.671875 15.775C0.671875 12.3229 3.47039 9.52438 6.92252 9.52438C10.3747 9.52438 13.1732 12.3229 13.1732 15.775M9.83949 4.10715C9.83949 5.71815 8.53352 7.02412 6.92252 7.02412C5.31153 7.02412 4.00555 5.71815 4.00555 4.10715C4.00555 2.49616 5.31153 1.19019 6.92252 1.19019C8.53352 1.19019 9.83949 2.49616 9.83949 4.10715Z" 
      stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
        <Gradient className={className}/>
    </svg>

  );
};

export default Person;