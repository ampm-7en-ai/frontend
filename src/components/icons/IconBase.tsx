import React from 'react';
import Person from './library/Person';
import Chat from './library/Chat';
import Home from './library/Home';
import Book from './library/Book';
import Earth from './library/Earth';
import Discover from './library/Discover';
import Help from './library/Help';

const IconBase = ({ type, className = '', iconType }) => {

  const renderIcon = () => {
    const baseClass = `${className}`;
    switch (iconType) {
      case 'Person':
        return <Person type={type} className={baseClass} />;
      case 'Chat':
        return <Chat type={type} className={baseClass} />;
      case 'Home':
        return <Home type={type} className={baseClass} />;
      case 'Book':
        return <Book type={type} className={baseClass} />;
      case 'Earth':
        return <Earth type={type} className={baseClass} />;
      case 'Discover':
        return <Discover type={type} className={baseClass} />;
      case 'Help':
        return <Help type={type} className={baseClass} />;
      default:
        return null;
    }
  };

  return renderIcon();
};

export default IconBase;