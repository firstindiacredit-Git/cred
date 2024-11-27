import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Table, Modal, message, Space, Card, Grid } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import api from '../utils/axios';

const { useBreakpoint } = Grid;

interface Credential {
  _id: string;
  websiteName: string;
  url: string;
  username: string;
  password: string;
  notes?: string;
}

const LockerPage: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [form] = Form.useForm();
  const [pinForm] = Form.useForm();
  const screens = useBreakpoint();

  const fetchCredentials = async () => {
    try {
      const response = await api.get('/credentials');
      setCredentials(response.data);
    } catch (error) {
      message.error('Failed to fetch credentials');
    }
  };

  const handleUnlock = async (values: { pin: string }) => {
    try {
      const response = await api.post('/credentials/verify-pin', { pin: values.pin });
      if (response.data.isValid) {
        setIsLocked(false);
        fetchCredentials();
        pinForm.resetFields();
      } else {
        message.error('Invalid PIN');
      }
    } catch (error) {
      message.error('Failed to verify PIN');
    }
  };

  const handleAddEdit = async (values: any) => {
    try {
      if (editingCredential) {
        await api.put(`/credentials/${editingCredential._id}`, values);
        message.success('Credential updated successfully');
      } else {
        await api.post('/credentials', values);
        message.success('Credential added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchCredentials();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/credentials/${id}`);
      message.success('Credential deleted successfully');
      fetchCredentials();
    } catch (error) {
      message.error('Failed to delete credential');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
      .then(() => message.success(`${field} copied to clipboard`))
      .catch(() => message.error('Failed to copy to clipboard'));
  };

  const CredentialCard: React.FC<{ credential: Credential }> = ({ credential }) => (
    <Card
      className="mb-4 shadow-sm hover:shadow-md transition-shadow"
      actions={[
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => {
            setEditingCredential(credential);
            form.setFieldsValue(credential);
            setIsModalVisible(true);
          }}
        />,
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(credential._id)}
        />,
      ]}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{credential.websiteName}</h3>
          <a
            href={credential.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm break-all"
          >
            {credential.url}
          </a>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Username</span>
            <Space>
              <span>{credential.username}</span>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(credential.username, 'Username')}
                size="small"
              />
            </Space>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Password</span>
            <Space>
              <Input.Password
                value={credential.password}
                readOnly
                size="small"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(credential.password, 'Password')}
                size="small"
              />
            </Space>
          </div>
        </div>

        {credential.notes && (
          <div>
            <span className="text-sm font-medium text-gray-500">Notes</span>
            <p className="text-sm mt-1">{credential.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );

  const columns = [
    {
      title: 'Website Name',
      dataIndex: 'websiteName',
      key: 'websiteName',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (text: string) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <span>{text}</span>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(text, 'Username')}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      render: (text: string) => (
        <Space>
          <Input.Password
            value={text}
            readOnly
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(text, 'Password')}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Credential) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setEditingCredential(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (isLocked) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] ">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <div className="text-center mb-8">
            <LockOutlined className="text-4xl text-blue-600" />
            <h2 className="text-2xl font-bold mt-4">Credential Locker</h2>
            <p className="text-gray-600 mt-2">Enter PIN to access credentials</p>
          </div>
          <Form form={pinForm} onFinish={handleUnlock}>
            <Form.Item
              name="pin"
              rules={[{ required: true, message: 'Please enter the PIN' }]}
            >
              <Input.Password
                size="large"
                placeholder="Enter PIN"
                maxLength={4}
                className="text-center"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block>
                Unlock
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Credential Manager</h1>
        <Space direction={screens.sm ? 'horizontal' : 'vertical'} className="w-full sm:w-auto">
          <Button
            type="primary"
            onClick={() => {
              setEditingCredential(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            block={!screens.sm}
          >
            Add New Credential
          </Button>
          <Button danger onClick={() => setIsLocked(true)} block={!screens.sm}>
            Lock
          </Button>
        </Space>
      </div>

      {screens.md ? (
        <Table columns={columns} dataSource={credentials} rowKey="_id" />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {credentials.map(credential => (
            <CredentialCard key={credential._id} credential={credential} />
          ))}
        </div>
      )}

      <Modal
        title={editingCredential ? 'Edit Credential' : 'Add New Credential'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEdit}
        >
          <Form.Item
            name="websiteName"
            label="Website Name"
            rules={[{ required: true, message: 'Please enter website name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: 'Please enter URL' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingCredential ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LockerPage;
