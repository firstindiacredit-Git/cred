import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiServer, FiRefreshCw } from 'react-icons/fi';
import ServerStatusBadge from '../components/ServerStatusBadge';
import ServerMetrics from '../components/ServerMetrics';
import { message } from 'antd';

interface Server {
  _id: string;
  title: string;
  url: string;
  endpoint: string;
  status: 'online' | 'offline' | 'error';
  responseTime: number;
  lastChecked: string;
  error?: string;
}

const Dashboard: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [refreshingServers, setRefreshingServers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      setError(null);
      const response = await axios.get('http://localhost:5000/api/servers');
      setServers(response.data);
    } catch (error) {
      setError('Failed to fetch servers');
      message.error('Failed to fetch servers');
    } finally {
      setLoading(false);
      setRefreshingAll(false);
    }
  };

  const checkServer = async (id: string) => {
    try {
      setRefreshingServers(prev => new Set(prev).add(id));
      await axios.post(`http://localhost:5000/api/servers/${id}/check`);
      await fetchServers();
      message.success('Server health check completed');
    } catch (error) {
      message.error('Failed to check server health');
    } finally {
      setRefreshingServers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleRefreshAll = async () => {
    try {
      setRefreshingAll(true);
      await axios.post('http://localhost:5000/api/servers/check-all');
      await fetchServers();
      message.success('All servers health check completed');
    } catch (error) {
      message.error('Failed to check servers health');
      setRefreshingAll(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 dashboard-title">Server Health Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Monitoring {servers.length} servers</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefreshAll}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors refresh-button"
          disabled={refreshingAll}
        >
          <FiRefreshCw className={`w-4 h-4 mr-2 ${refreshingAll ? 'animate-spin' : ''}`} />
          Check All
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 server-grid">
        <AnimatePresence>
          {servers.map((server) => (
            <motion.div
              key={server._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 server-card"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <FiServer className="w-5 h-5 sm:w-4 sm:h-4 text-gray-500 mr-2" />
                    <h2 className="text-lg sm:text-lg font-semibold text-gray-900 truncate">{server.title}</h2>
                  </div>
                  <div className="status-badge">
                    <ServerStatusBadge status={server.status} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center text-gray-600">
                    <span className="text-sm font-medium mb-1 sm:mb-0">URL:</span>
                    <a
                      href={server.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm truncate break-all sm:ml-2"
                    >
                      {server.url}
                    </a>
                  </div>

                  <div className="server-metrics">
                    <ServerMetrics
                      responseTime={server.responseTime}
                      lastChecked={server.lastChecked}
                    />
                  </div>

                  {server.error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600 bg-red-50 p-3 rounded-lg break-words"
                    >
                      <strong>Error:</strong> {server.error}
                    </motion.div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => checkServer(server._id)}
                  className="w-full mt-4 sm:mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center check-button disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={refreshingAll || refreshingServers.has(server._id)}
                >
                  <FiRefreshCw className={`w-4 h-4 mr-2 ${refreshingAll || refreshingServers.has(server._id) ? 'animate-spin' : ''}`} />
                  Check Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
