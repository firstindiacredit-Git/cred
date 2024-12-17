import React from 'react';

interface ServerMetricsProps {
  responseTime: number | null;
  lastChecked: string;
}

const ServerMetrics: React.FC<ServerMetricsProps> = ({ responseTime, lastChecked }) => {
  const getResponseTimeColor = (time: number) => {
    if (time < 200) return 'text-green-500';
    if (time < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-3 bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-gray-600">
          <span className="text-sm">Last Check</span>
        </div>
        <span className="text-sm font-medium">
          {new Date(lastChecked).toLocaleString()}
        </span>
      </div>

      {responseTime !== null && (
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <span className="text-sm">Response Time</span>
          </div>
          <span className={`text-sm font-medium ${getResponseTimeColor(responseTime)}`}>
            {responseTime}ms
          </span>
        </div>
      )}
    </div>
  );
};

export default ServerMetrics;
