import React from 'react';
import IconBase from './IconBase';

const Icon = ({ name, type = 'gradient', className = '' }) => {
  const IconComponent = ({ type, className }) => <IconBase type={type} className={className} iconType={name} />;
  if (!['Person', 'Chat', 'Home', 'Book', 'Earth', 'Discover', 'Help', 'Team'].includes(name)) return null;
  return (
  <>
  <IconComponent type={type} className={className} />
  </>);
};

export { Icon };