import React from 'react';
import { Gradient } from '../Gradient';

const Cart = ({ type, className = '', color = '#737373' }) => {
  return (
    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M1 1L3.18715 1.76955C4.03381 2.06745 4.6 2.86523 4.6 3.76031V8.38889C4.6 11.3037 6.97026 13.6667 9.89412 13.6667H13.8118C16.6772 13.6667 19 11.351 19 8.49444C19 5.63791 16.6772 3.32222 13.8118 3.32222H8.2M8.41177 17.8889C8.41177 19.0548 7.46366 20 6.29412 20C5.12457 20 4.17647 19.0548 4.17647 17.8889C4.17647 16.723 5.12457 15.7778 6.29412 15.7778C7.46366 15.7778 8.41177 16.723 8.41177 17.8889ZM19 17.8889C19 19.0548 18.0519 20 16.8824 20C15.7128 20 14.7647 19.0548 14.7647 17.8889C14.7647 16.723 15.7128 15.7778 16.8824 15.7778C18.0519 15.7778 19 16.723 19 17.8889Z" 
      stroke={type === 'plain' ? color : 'url(#globalGradient)'}
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
      <Gradient className={className} />
    </svg>

  );
};

export default Cart;