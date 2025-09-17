import React from 'react';
import { Gradient } from '../Gradient';

const Home = ({ type, className = '', color = '#737373' }) => {
  return (
    
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12.835 13.0016V6.19124C12.835 5.74917 12.6511 5.33536 12.3091 5.0552C11.4105 4.31899 9.58195 2.85573 8.12692 1.55512C7.47755 0.974661 6.49041 0.937995 5.82911 1.50482L1.74919 5.00189C1.37974 5.31856 1.16711 5.78086 1.16711 6.26745V13.0016C1.16711 13.9222 1.91338 14.6684 2.83395 14.6684H3.25066C4.17123 14.6684 4.9175 13.9222 4.9175 13.0016V11.3348C4.9175 10.4142 5.66377 9.66792 6.58434 9.66792H7.41776C8.33833 9.66792 9.0846 10.4142 9.0846 11.3348V13.0016C9.0846 13.9222 9.83087 14.6684 10.7514 14.6684H11.1682C12.0887 14.6684 12.835 13.9222 12.835 13.0016Z" 
      stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
    </svg>

  );
};

export default Home;