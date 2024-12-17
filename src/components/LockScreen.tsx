import React, { useState, useEffect } from 'react';
import { Modal, Input, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ isLocked, onUnlock }) => {
  const [pin, setPin] = useState('');
  const { user } = useAuth();
  const [storedPin, setStoredPin] = useState('0000'); // Default PIN

  useEffect(() => {
    fetchPin();
  }, [user]);

  const fetchPin = async () => {
    if (!user) return;

    try {
      const pinDoc = await getDoc(doc(db, 'users', user.uid, 'settings', 'pin'));
      if (pinDoc.exists()) {
        setStoredPin(pinDoc.data().pin);
      }
    } catch (error) {
      console.error('Error fetching PIN:', error);
    }
  };

  const handleUnlock = () => {
    if (pin === storedPin) {
      setPin('');
      onUnlock();
    } else {
      message.error('Incorrect PIN');
      setPin('');
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <LockOutlined className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold">Screen Locked</h2>
          <p className="text-gray-500 mt-2">Enter your PIN to unlock</p>
        </div>

        <Input.Password
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onPressEnter={handleUnlock}
          maxLength={4}
          className="mb-4"
          autoFocus
        />

        <button
          onClick={handleUnlock}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Unlock
        </button>
      </div>
    </div>
  );
};

export default LockScreen;
