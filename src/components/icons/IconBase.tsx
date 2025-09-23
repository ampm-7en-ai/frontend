import React from 'react';
import Person from './library/Person';
import Chat from './library/Chat';
import Home from './library/Home';
import Book from './library/Book';
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
import Cog from './library/Cog';
import Extension from './library/Extension';
import Receipt from './library/Receipt';
import Moon from './library/Moon';
import Sun from './library/Sun';
import Logout from './library/Logout';
import Adjust from './library/Adjust';
import Drop from './library/Drop';
import Scatter from './library/Scatter';
import Bulb from './library/Bulb';
import Bin from './library/Bin';
import Edit from './library/Edit';
import Copy from './library/Copy';
import CubeNode from './library/CubeNode';
import Info from './library/Info';
import Ratings from './library/Ratings';
import Playground from './library/Playground';
import Ticket from './library/Ticket';
import Star from './library/Star';
import ColumnChart from './library/ColumnChart';
import Key from './library/Key';
import Loading from './library/Loading';
import { Play } from 'lucide-react';
import Rocket from './library/Rocket';

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
      case 'Extension':
        return <Extension type={type} className={baseClass} color={color} />;
      case 'Cog':
        return <Cog type={type} className={baseClass} color={color} />;
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
      case 'WebPage':
        return <WebPage type={type} className={baseClass} color={color} />;
      case 'SheetFile':
        return <SheetFile type={type} className={baseClass} color={color} />;
      case 'Typing':
        return <Typing type={type} className={baseClass} color={color} />;
      case 'Receipt':
        return <Receipt type={type} className={baseClass} color={color} />;
      case 'Sun':
        return <Sun type={type} className={baseClass} color={color} />;
      case 'Moon':
        return <Moon type={type} className={baseClass} color={color} />;
      case 'Logout':
        return <Logout type={type} className={baseClass} color={color} />;
      case 'Adjust':
        return <Adjust type={type} className={baseClass} color={color} />;
      case 'Drop':
        return <Drop type={type} className={baseClass} color={color} />;
      case 'Scatter':
        return <Scatter type={type} className={baseClass} color={color} />;
      case 'Bulb':
        return <Bulb type={type} className={baseClass} color={color} />;
      case 'Bin':
        return <Bin type={type} className={baseClass} color={color} />;
      case 'Copy':
        return <Copy type={type} className={baseClass} color={color} />;
      case 'Edit':
        return <Edit type={type} className={baseClass} color={color} />;
      case 'CubeNode':
        return <CubeNode type={type} className={baseClass} color={color} />;
      case 'Info':
        return <Info type={type} className={baseClass} color={color} />;
      case 'Ratings':
        return <Ratings type={type} className={baseClass} color={color} />;
      case 'Playground':
        return <Playground type={type} className={baseClass} color={color} />;
      case 'Ticket':
        return <Ticket type={type} className={baseClass} color={color} />;
      case 'Star':
        return <Star type={type} className={baseClass} color={color} />;
      case 'ColumnChart':
        return <ColumnChart type={type} className={baseClass} color={color} />;
      case 'Loading':
        return <Loading type={type} className={baseClass} color={color} />;
      case 'Play':
        return <Play type={type} className={baseClass} color={color} />;
      case 'Rocket':
        return <Rocket type={type} className={baseClass} color={color} />;
      default:
        return null;
    }
  };

  return renderIcon();
};

export default IconBase;