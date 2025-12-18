import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed left-0 top-0 h-full w-24 bg-surface border-r border-white/5 flex flex-col items-center py-8 z-50">
      <div className="mb-12">
        <Shield className="w-8 h-8 text-brand-red animate-pulse-slow" />
      </div>

      <div className="flex-1 flex flex-col gap-8 w-full">
        <NavLink to="/" icon={<Users />} active={isActive('/')} label="Users" />
        <NavLink to="/chat" icon={<MessageSquare />} active={isActive('/chat')} label="Chat" />
      </div>

      {/* Vertical Username */}
      <div className="mb-32 flex flex-col items-center gap-2">
        <div className="whitespace-nowrap text-xs font-mono font-bold text-brand-red tracking-widest uppercase -rotate-90 select-none">
          {user?.username}
        </div>
      </div>

      <button
        onClick={logout}
        className="mb-8 p-3 rounded-xl text-gray-400 hover:text-brand-red hover:bg-white/5 transition-all duration-300"
        title="Logout"
      >
        <LogOut className="w-6 h-6" />
      </button>
    </nav>
  );
};

const NavLink = ({ to, icon, active, label }) => (
  <Link
    to={to}
    className={`relative p-3 mx-auto rounded-xl transition-all duration-300 group
      ${active ? 'text-brand-red bg-brand-red/10 shadow-[0_0_15px_rgba(255,0,51,0.3)]' : 'text-gray-400 hover:text-brand-red hover:bg-white/5'}`}
  >
    <div className="w-6 h-6">{icon}</div>
    {/* Tooltip */}
    <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-surface border border-white/10 px-2 py-1 rounded text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {label}
    </span>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-red rounded-r-full" />}
  </Link>
);

export default NavBar;
