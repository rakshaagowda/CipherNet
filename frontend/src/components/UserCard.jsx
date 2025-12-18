import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const UserCard = ({ user, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(user)}
      className="relative group cursor-pointer"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-red to-brand-dark rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative bg-surface p-6 rounded-2xl border border-white/5 h-full flex flex-col items-center justify-center gap-4 hover:border-brand-red/30 transition-colors">

        <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center border-2 border-brand-red/20 group-hover:border-brand-red group-hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] transition-all duration-500">
          <User className="w-8 h-8 text-gray-400 group-hover:text-brand-red transition-colors" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-brand-red transition-colors">
            {user.username}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${user.status === 'Online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-600'}`}></span>
            {user.status || 'Offline'}
          </p>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-brand-red/0 group-hover:border-brand-red/50 transition-all duration-500"></div>
        <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-brand-red/0 group-hover:border-brand-red/50 transition-all duration-500"></div>
      </div>
    </motion.div>
  );
};

export default UserCard;
