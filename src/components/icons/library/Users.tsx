import React from 'react';
import { Gradient } from '../Gradient';

const Users = ({ type, className = '', color = '#737373' }) => {
  return (

<svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M13.9236 13.5H17.3567C18.4402 13.5 19.3663 12.5512 18.8557 11.577C18.0161 9.97525 16.1236 9 13.9236 9C12.847 9 11.8471 9.22252 11.0085 9.63643M1.14432 14.077C1.98395 12.4753 3.8764 11.5 6.07642 11.5C8.27645 11.5 10.1689 12.4753 11.0085 14.077C11.5192 15.0512 10.593 16 9.50955 16H2.64329C1.55983 16 0.633655 15.0512 1.14432 14.077ZM8.52866 6C8.52866 7.38071 7.43076 8.5 6.07642 8.5C4.72209 8.5 3.62419 7.38071 3.62419 6C3.62419 4.61929 4.72209 3.5 6.07642 3.5C7.43076 3.5 8.52866 4.61929 8.52866 6ZM16.3758 3.5C16.3758 4.88071 15.2779 6 13.9236 6C12.5692 6 11.4713 4.88071 11.4713 3.5C11.4713 2.11929 12.5692 1 13.9236 1C15.2779 1 16.3758 2.11929 16.3758 3.5Z" 
stroke={type === 'plain' ? color : 'url(#globalGradient)'}
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
      <Gradient className={className} />
</svg>

  );
};

export default Users;