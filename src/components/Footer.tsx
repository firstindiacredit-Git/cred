import React from 'react';
import { GithubOutlined, HeartFilled } from '@ant-design/icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-sm mt-auto py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Cred by</span>
            <a 
              href="https://pizeonfly.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
            >
              Pizeonfly
            </a>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Cred. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
