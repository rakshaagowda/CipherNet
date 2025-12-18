import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserCard from '../components/UserCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:3000/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleUserClick = (selectedUser) => {
    navigate(`/chat/${selectedUser.username}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Network Status</h1>
        <p className="text-gray-500">Select an active node to establish secure encrypted link.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {users.map((u) => (
            <UserCard key={u.id} user={u} onClick={handleUserClick} />
          ))}
          {users.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-20 flex flex-col items-center">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📡</span>
              </div>
              <p>No other active nodes detected.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
