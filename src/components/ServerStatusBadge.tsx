import React from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface ServerStatusBadgeProps {
  status: 'online' | 'offline' | 'error';
}

const ServerStatusBadge: React.FC<ServerStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
        return {
          icon: <FiCheckCircle className="w-3 h-3" />,
          color: 'bg-green-100 text-green-800',
          // animation: {
          //   scale: [1, 1.1, 1],
          //   transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
          // }
        };
      case 'offline':
        return {
          icon: <FiXCircle className="w-3 h-3" />,
          color: 'bg-red-100 text-red-800',
          // animation: {}
        };
      case 'error':
        return {
          icon: <FiAlertCircle className="w-3 h-3" />,
          color: 'bg-yellow-100 text-yellow-800',
          // animation: {
          //   rotate: [0, 10, -10, 0],
          //   transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
          // }
        };
      default:
        return {
          icon: null,
          color: 'bg-gray-100 text-gray-800',
          // animation: {}
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <motion.div
      // animate={config.animation}
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}
    >
      <span className="mr-1">{config.icon}</span>
      <span className="capitalize">{status}</span>
    </motion.div>
  );
};

export default ServerStatusBadge;
