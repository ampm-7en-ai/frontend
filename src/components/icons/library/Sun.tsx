import React from 'react';
import { Gradient } from '../Gradient';

const Sun = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M8.93214 2.22885V0.562012M15.1828 8.4795H16.8496M13.352 12.8994L14.5306 14.078M8.93214 16.397V14.7301M1.01465 8.4795H2.68149M3.33363 2.88099L4.51226 4.05962M4.51225 12.8992L3.33361 14.0778M14.5307 2.88106L13.352 4.05969M12.2658 8.4795C12.2658 10.3206 10.7733 11.8132 8.93214 11.8132C7.091 11.8132 5.59846 10.3206 5.59846 8.4795C5.59846 6.63836 7.091 5.14582 8.93214 5.14582C10.7733 5.14582 12.2658 6.63836 12.2658 8.4795Z" 
    stroke={type === 'plain' ? color : 'url(#globalGradient)'} 
      strokeWidth="1" 
      strokeLinecap="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Sun;