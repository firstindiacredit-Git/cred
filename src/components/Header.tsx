import React, { useState, useEffect } from 'react';
import { Avatar, Button, Dropdown, Modal, Input, message } from 'antd';
import { UserOutlined, LogoutOutlined, LockOutlined, UnlockOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface HeaderProps {
  onLockScreen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLockScreen }) => {
  const { user, logout } = useAuth();
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPin, setCurrentPin] = useState<string | null>(null);

  useEffect(() => {
    

    fetchPin();
  }, [user]);
  const fetchPin = async () => {
    if (!user) return;
    try {
      const pinDocRef = doc(db, 'users', user.uid, 'settings', 'pin');
      const pinDoc = await getDoc(pinDocRef);
      if (pinDoc.exists()) {
        setCurrentPin(pinDoc.data().pin);
      }
    } catch (error) {
      console.error('Error fetching PIN:', error);
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      message.error('Failed to logout');
    }
  };

  const handleSetPin = async () => {
    if (!user) {
      message.error('You must be logged in to set a PIN');
      return;
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      message.error('PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      message.error('PINs do not match');
      return;
    }

    try {
      setLoading(true);
      const userSettingsRef = doc(db, 'users', user.uid, 'settings', 'pin');
      await setDoc(userSettingsRef, {
        pin: newPin,
        updatedAt: Timestamp.fromDate(new Date())
      });
      setCurrentPin(newPin);
      message.success('PIN updated successfully');
      setIsPinModalVisible(false);
      setNewPin('');
      setConfirmPin('');
      window.location.reload();
    } catch (error) {
      console.error('Error updating PIN:', error);
      message.error('Failed to update PIN');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'profile',
      label: (
        <div className="px-4 py-2">
          <div className="font-medium">{user?.email}</div>
          <div className="text-sm text-gray-500">Logged in</div>
        </div>
      ),
    },
    {
      key: 'setpin',
      label: (
        <Button
          type="text"
          icon={<SettingOutlined />}
          className="w-full text-left"
          onClick={() => setIsPinModalVisible(true)}
        >
          {currentPin ? 'Change PIN' : 'Set PIN'}
        </Button>
      ),
    },
    {
      key: 'lock',
      label: (
        <Button
          type="text"
          icon={<LockOutlined />}
          className="w-full text-left"
          onClick={onLockScreen}
          disabled={!currentPin}
        >
          Lock Screen
        </Button>
      ),
    },
    {
      key: 'logout',
      label: (
        <Button
          type="text"
          icon={<LogoutOutlined />}
          className="w-full text-left"
          onClick={handleLogout}
          danger
        >
          Logout
        </Button>
      ),
    },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <img src="CRED LOGO.png" className='h-6' alt="Cred logo" />
        <div className="flex items-center space-x-4">
          <Button
            type="text"
            icon={<LockOutlined />}
            onClick={onLockScreen}
            className="flex items-center"
            disabled={!currentPin}
          >
            Lock
          </Button>
          <Dropdown menu={{ items }} placement="top" trigger={['click']}>
            <Avatar
              icon={<UserOutlined />}
              className="cursor-pointer bg-blue-500"
            />
          </Dropdown>
        </div>
      </div>

      <Modal
        title={currentPin ? "Change Screen Lock PIN" : "Set Screen Lock PIN"}
        open={isPinModalVisible}
        onOk={handleSetPin}
        onCancel={() => {
          setIsPinModalVisible(false);
          setNewPin('');
          setConfirmPin('');
        }}
        confirmLoading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New PIN</label>
            <Input.Password
              placeholder="Enter 4-digit PIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              maxLength={4}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm PIN</label>
            <Input.Password
              placeholder="Confirm 4-digit PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              maxLength={4}
              className="mt-1"
            />
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
