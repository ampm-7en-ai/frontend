import React from 'react';
import { Gradient } from '../Gradient';

const WebPage = ({ type, className = '', color = '#737373' }) => {
  return (
  <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
  <path d="M8.99757 16.3699C13.3703 16.3699 16.9151 12.8251 16.9151 8.4524C16.9151 4.07969 13.3703 0.534912 8.99757 0.534912M8.99757 16.3699C4.62486 16.3699 1.08008 12.8251 1.08008 8.4524C1.08008 4.07969 4.62486 0.534912 8.99757 0.534912M8.99757 16.3699C10.8387 16.3699 12.3312 12.8251 12.3312 8.4524C12.3312 4.07969 10.8387 0.534912 8.99757 0.534912M8.99757 16.3699C7.15643 16.3699 5.66389 12.8251 5.66389 8.4524C5.66389 4.07969 7.15643 0.534912 8.99757 0.534912M1.49679 5.95214H16.4983M1.49679 10.9527H16.4983"
  stroke={type === 'plain' ? color : 'url(#globalGradient)'}
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round"/>
        <Gradient className={className} />
  </svg>
  );
};

export default WebPage;