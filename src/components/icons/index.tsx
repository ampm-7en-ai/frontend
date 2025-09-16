import React from 'react';
import IconBase from './IconBase';

const Icon = ({ name, type = 'gradient', className = '', color = '#737373' }) => {
  const IconComponent = ({ type, className }) => <IconBase type={type} className={className} iconType={name} color={color} />;
  if (![
    'Person',
     'Chat', 
     'Home', 
     'Book', 
     'Earth', 
     'Discover', 
     'Help', 
     'Team', 
     'Love', 
     'Chart', 
     'Transaction',
     'Like',
     'AreaChart',
     'Layer',
     'Users',
     'Magic',
     'Bubbles',
     'Folder',
     'Typing',
     'SheetFile',
     'WebPage',
     'TextFile',
     'Cart'].includes(name)) return null;
  return (
  <>
  <IconComponent type={type} className={className} />
  </>);
};

export { Icon };