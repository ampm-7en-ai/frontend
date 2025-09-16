import React from 'react';
import { Gradient } from '../Gradient';

const Transaction = ({ type, className = '', color = '#737373' }) => {
  return (
   
<svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M1 5.5L19 5.5M19 5.5L14.5 1M19 5.5L14.5 10M19 17.5H1M1 17.5L5.5 13M1 17.5L5.5 22" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'}
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Transaction;