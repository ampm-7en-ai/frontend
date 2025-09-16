import React from 'react';
import Person from './library/Person';
import Chat from './library/Chat';
import Home from './library/Home';
import Book from './library/Book';
import Earth from './library/Earth';
import Discover from './library/Discover';
import Help from './library/Help';
import Team from './library/Team';
import Love from './library/Love';
import Chart from './library/Chart';
import Cart from './library/Cart';
import Transaction from './library/Transaction';
import Like from './library/Like';
import AreaChart from './library/AreaChart';
import Layer from './library/Layer';
import Bubbles from './library/Bubbles';
import Folder from './library/Folder';
import Magic from './library/Magic';
import Users from './library/Users';
import Typing from './library/Typing';
import SheetFile from './library/SheetFile';
import WebPage from './library/WebPage';
import TextFile from './library/TextFile';

const IconBase = ({ type, className = '', iconType, color }) => {

  const renderIcon = () => {
    const baseClass = `${className}`;
    switch (iconType) {
      case 'Person':
        return <Person type={type} className={baseClass} color={color} />;
      case 'Chat':
        return <Chat type={type} className={baseClass} color={color} />;
      case 'Home':
        return <Home type={type} className={baseClass} color={color} />;
      case 'Book':
        return <Book type={type} className={baseClass} color={color} />;
      case 'Earth':
        return <Earth type={type} className={baseClass} color={color} />;
      case 'Discover':
        return <Discover type={type} className={baseClass} color={color} />;
      case 'Help':
        return <Help type={type} className={baseClass} color={color} />;
      case 'Team':
        return <Team type={type} className={baseClass} color={color} />;
      case 'Love':
        return <Love type={type} className={baseClass} color={color} />;
      case 'Chart':
        return <Chart type={type} className={baseClass} color={color} />;
      case 'Cart':
        return <Cart type={type} className={baseClass} color={color} />;
      case 'Transaction':
        return <Transaction type={type} className={baseClass} color={color} />;
      case 'Like':
        return <Like type={type} className={baseClass} color={color} />;
      case 'AreaChart':
        return <AreaChart type={type} className={baseClass} color={color} />;
      case 'Layer':
        return <Layer type={type} className={baseClass} color={color} />;
      case 'Users':
        return <Users type={type} className={baseClass} color={color} />;
      case 'Magic':
        return <Magic type={type} className={baseClass} color={color} />;
      case 'Folder':
        return <Folder type={type} className={baseClass} color={color} />;
      case 'Bubbles':
        return <Bubbles type={type} className={baseClass} color={color} />;
      case 'TextFile':
        return <TextFile type={type} className={baseClass} color={color} />;
      case 'Webpage':
        return <WebPage type={type} className={baseClass} color={color} />;
      case 'SheetFile':
        return <SheetFile type={type} className={baseClass} color={color} />;
      case 'Typing':
        return <Typing type={type} className={baseClass} color={color} />;
      default:
        return null;
    }
  };

  return renderIcon();
};

export default IconBase;