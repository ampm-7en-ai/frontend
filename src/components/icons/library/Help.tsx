import React from 'react';
import { Gradient } from '../Gradient';

const Help = ({ type, className = '', color = '#737373' }) => {
  return (

    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8.91749 12.6679V13.0846M7.25065 7.66736V6.67796C7.25065 5.61339 8.11365 4.75039 9.17821 4.75039C11.0088 4.75039 11.8085 7.06267 10.3691 8.19364L9.75705 8.67454C9.22699 9.09102 8.91749 9.7278 8.91749 10.4019V10.5843M16.835 8.91749C16.835 13.2902 13.2902 16.835 8.91749 16.835C4.54478 16.835 1 13.2902 1 8.91749C1 4.54478 4.54478 1 8.91749 1C13.2902 1 16.835 4.54478 16.835 8.91749Z" 
      stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round" />
      <Gradient className={className} />
    </svg>


  );
};

export default Help;