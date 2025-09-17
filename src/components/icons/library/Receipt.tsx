import React from 'react';
import { Gradient } from '../Gradient';

const Receipt = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M3.19195 11.6021H6.52563M3.19195 13.2689H9.02589M2.35853 16.1859H11.1094C11.7999 16.1859 12.3596 15.6262 12.3596 14.9358V2.43446C12.3596 1.74403 11.7999 1.18433 11.1094 1.18433H2.35853C1.6681 1.18433 1.1084 1.74403 1.1084 2.43446V14.9358C1.1084 15.6262 1.6681 16.1859 2.35853 16.1859ZM3.19195 1.18433H6.94234V6.80991C6.94234 7.01014 6.68744 7.09511 6.5673 6.93492L6.06725 6.26819C5.56719 5.60145 4.56709 5.60145 4.06704 6.26819L3.56699 6.93492C3.44685 7.09511 3.19195 7.01014 3.19195 6.80991V1.18433Z" 
 stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="q" 
      strokeLinecap="round"/>
        <Gradient className={className}/>
</svg>
  );
};

export default Receipt;