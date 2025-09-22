import React from 'react';
import { Gradient } from '../Gradient';

const Playground = ({ type, className = '', color = '#737373' }) => {
  return (


<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M7.9327 5.54135L14.1833 3.4578M7.9327 5.54135L1.68205 3.4578M7.9327 5.54135V14.2923M8.48746 0.736628L13.9047 2.64859C14.5711 2.8838 15.0168 3.51369 15.0168 4.2204V10.7342C15.0168 11.3799 14.6439 11.9675 14.0597 12.2424L8.64244 14.7917C8.19292 15.0032 7.67248 15.0032 7.22297 14.7917L1.80574 12.2424C1.22152 11.9675 0.848633 11.3799 0.848633 10.7342V4.2204C0.848633 3.51369 1.29429 2.8838 1.96071 2.64859L7.37794 0.736627C7.73693 0.609926 8.12847 0.609926 8.48746 0.736628Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>


  );
};

export default Playground;