import React from 'react';
import { Gradient } from '../Gradient';

const Folder = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M1.33252 2.31564C1.33252 1.39507 2.07879 0.648804 2.99936 0.648804H5.93506C6.60853 0.648804 7.21582 1.05407 7.47427 1.67597L7.573 1.91354C7.83145 2.53544 8.43875 2.94071 9.11221 2.94071H13.0004C13.921 2.94071 14.6672 3.68698 14.6672 4.60755V10.6498C14.6672 11.5704 13.921 12.3167 13.0004 12.3167H2.99936C2.07879 12.3167 1.33252 11.5704 1.33252 10.6498V2.31564Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'}
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
      <Gradient className={className} />
</svg>


  );
};

export default Folder;