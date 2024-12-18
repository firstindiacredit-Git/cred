import React, { useState, useMemo } from 'react';
import { Card, Input, Button, Slider, Switch, Typography, message } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);

  const charset = useMemo(() => {
    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    return charset;
  }, [includeLowercase, includeUppercase, includeNumbers, includeSymbols]);

  const generatePassword = () => {
    if (!charset) {
      message.error('Please select at least one character type');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }

    // Only update password if it has changed to avoid unnecessary re-renders
    if (newPassword !== password) {
      setPassword(newPassword);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      message.success('Password copied to clipboard');
    } catch (error) {
      message.error('Failed to copy password');
    }
  };

  return (
    <Card
      title="Password Generator"
      className="sticky top-4 shadow-lg"
      extra={
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={generatePassword}
        />
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input.Password
            value={password}
            readOnly
            className="flex-grow"
          />
          <Button
            icon={<CopyOutlined />}
            onClick={copyToClipboard}
            disabled={!password}
          />
        </div>

        <div>
          <Text>Length: {length}</Text>
          <Slider
            min={8}
            max={32}
            value={length}
            onChange={setLength}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Text>Lowercase (a-z)</Text>
            <Switch checked={includeLowercase} onChange={setIncludeLowercase} />
          </div>
          <div className="flex justify-between">
            <Text>Uppercase (A-Z)</Text>
            <Switch checked={includeUppercase} onChange={setIncludeUppercase} />
          </div>
          <div className="flex justify-between">
            <Text>Numbers (0-9)</Text>
            <Switch checked={includeNumbers} onChange={setIncludeNumbers} />
          </div>
          <div className="flex justify-between">
            <Text>Symbols (!@#$)</Text>
            <Switch checked={includeSymbols} onChange={setIncludeSymbols} />
          </div>
        </div>

        <Button
          type="primary"
          block
          onClick={generatePassword}
        >
          Generate Password
        </Button>
      </div>
    </Card>
  );
};

export default PasswordGenerator;
