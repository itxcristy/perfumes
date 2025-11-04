import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

interface LogoProps {
  siteName?: string;
  logoUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({ siteName = 'Aligarh Attar House', logoUrl = logo }) => {
  return (
    <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
      <img
        src={logoUrl}
        alt="Logo"
        className="w-10 h-10 object-contain"
      />
      <span className="font-bold text-gray-900 text-xl tracking-tight">{siteName}</span>
    </Link>
  );
};
