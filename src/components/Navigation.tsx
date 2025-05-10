import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Drawer, Button } from "antd";
import {
  DashboardOutlined,
  LoginOutlined,
  LogoutOutlined,
  LockOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/locker",
      icon: <LockOutlined />,
      label: "Locker",
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-white font-bold text-xl">
              Cred
              <span className="align-super text-xs text-black">
                by Pizeonfly
              </span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium ${
                  location.pathname === item.key
                    ? "text-white border-b-2 border-white"
                    : "text-blue-100 hover:text-white hover:border-b-2 hover:border-blue-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <button
              onClick={handleLogout}
              className="flex bg-red-600 px-3 py-2 rounded-lg drop-shadow-sm hover:bg-red-500 transition-all items-center space-x-2 text-white hover:text-white"
            >
              <LogoutOutlined />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              type="text"
              icon={<MenuOutlined className="text-white text-xl" />}
              onClick={() => setMobileMenuOpen(true)}
              className="hover:bg-blue-700"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <span className="text-lg font-bold">
            Cred <span className="text-xs align-super">by Pizeonfly</span>
          </span>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="md:hidden"
      >
        <div className="flex flex-col space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                navigate(item.key);
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogoutOutlined className="text-xl" />
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <LoginOutlined className="text-xl" />
              <span className="font-medium">Login</span>
            </button>
          )}
        </div>
      </Drawer>
    </nav>
  );
};

export default Navigation;
