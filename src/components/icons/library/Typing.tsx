import React from 'react';
import { Gradient } from '../Gradient';

const Typing = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="23" height="17" viewBox="0 0 23 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M14.8387 5.03629H3.30645C2.03263 5.03629 1 6.06893 1 7.34275V9.6492C1 10.923 2.03263 11.9557 3.30645 11.9557H14.8387M14.8387 5.03629H19.4516C20.7254 5.03629 21.7581 6.06893 21.7581 7.34275V9.6492C21.7581 10.923 20.7254 11.9557 19.4516 11.9557H14.8387M14.8387 5.03629V8.49597M14.8387 5.03629V1M14.8387 11.9557V8.49597M14.8387 11.9557V15.9919M5.03629 8.49597H14.8387M14.8387 1H17.7218M14.8387 1H11.9557M14.8387 15.9919H17.7218M14.8387 15.9919H11.9557" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'}
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Typing;