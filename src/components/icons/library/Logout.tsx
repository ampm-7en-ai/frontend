import React from 'react';
import { Gradient } from '../Gradient';

const Logout = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
  <g transform="rotate(90 6 6)">
    <path d="M4.65887 6.47952H2.99203C2.07146 6.47952 1.3252 7.22579 1.3252 8.14636V9.8132C1.3252 10.7338 2.07146 11.48 2.99203 11.48H12.9931C13.9136 11.48 14.6599 10.7338 14.6599 9.8132V8.14636C14.6599 7.22579 13.9136 6.47952 12.9931 6.47952H11.3262M7.99252 8.97978L7.99265 1.479M7.99265 1.479L5.49229 3.86562M7.99265 1.479L10.4928 3.86555M12.9931 8.97978C12.9931 9.20992 12.8065 9.39649 12.5764 9.39649C12.3462 9.39649 12.1597 9.20992 12.1597 8.97978C12.1597 8.74964 12.3462 8.56307 12.5764 8.56307C12.8065 8.56307 12.9931 8.74964 12.9931 8.97978Z" 
    stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
    strokeWidth="1" 
    strokeLinecap="round"/>
    <Gradient className={className} />
  </g>
</svg>

  );
};

export default Logout;