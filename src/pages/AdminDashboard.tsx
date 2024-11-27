import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Space, 
  Card, 
  Grid 
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  InfoCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { useBreakpoint } = Grid;

interface Server {
  _id: string;
  title: string;
  url: string;
  endpoint: string;
  status: string;
  lastCheck: string;
}

const AdminDashboard: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/servers');
      setServers(response.data);
    } catch (error) {
      message.error('Failed to fetch servers');
    }
  };

  const checkAllServers = async () => {
    setIsChecking(true);
    try {
      await axios.post('http://localhost:5000/api/servers/check-all');
      message.success('Health check completed for all servers');
      fetchServers(); // Refresh the server list to show updated statuses
    } catch (error) {
      message.error('Failed to check servers');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingServer) {
        await axios.put(`http://localhost:5000/api/servers/${editingServer._id}`, values);
        message.success('Server updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/servers', values);
        message.success('Server added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchServers();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/servers/${id}`);
      message.success('Server deleted successfully');
      fetchServers();
    } catch (error) {
      message.error('Failed to delete server');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (text: string) => (
        <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>
      ),
    },
    {
      title: 'Health Check Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Last Check',
      dataIndex: 'lastCheck',
      key: 'lastCheck',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Server) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingServer(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const ServerCard: React.FC<{ server: Server }> = ({ server }) => (
    <Card
      className="mb-4 shadow-sm hover:shadow-md transition-shadow"
      actions={[
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            setEditingServer(server);
            form.setFieldsValue(server);
            setIsModalVisible(true);
          }}
        >
          Edit
        </Button>,
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(server._id)}
        >
          Delete
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <InfoCircleOutlined className="text-xl text-blue-500" />
          <div>
            <div className="font-medium">{server.title}</div>
            <div className="text-sm text-gray-500">Server Title</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <InfoCircleOutlined className="text-xl text-blue-500" />
          <div>
            <div className="font-medium break-all">
              <a href={server.url} target="_blank" rel="noopener noreferrer">{server.url}</a>
            </div>
            <div className="text-sm text-gray-500">Server URL</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <InfoCircleOutlined className="text-xl text-blue-500" />
          <div>
            <div className="font-medium capitalize">{server.endpoint}</div>
            <div className="text-sm text-gray-500">Health Check Endpoint</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <InfoCircleOutlined className="text-xl text-blue-500" />
          <div>
            <div className="font-medium capitalize">{server.status}</div>
            <div className="text-sm text-gray-500">Status</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <InfoCircleOutlined className="text-xl text-blue-500" />
          <div>
            <div className="font-medium capitalize">{server.lastCheck}</div>
            <div className="text-sm text-gray-500">Last Check</div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Server Management</h1>
        <Space>
          <Button
            onClick={checkAllServers}
            loading={isChecking}
            icon={<SyncOutlined />}
            className="w-full sm:w-auto"
          >
            Check Now
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setEditingServer(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            className="w-full sm:w-auto"
          >
            Add New Server
          </Button>
        </Space>
      </div>

      {screens.md ? (
        <Table columns={columns} dataSource={servers} rowKey="_id" />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {servers.map(server => (
            <ServerCard key={server._id} server={server} />
          ))}
        </div>
      )}

      <Modal
        title={editingServer ? 'Edit Server' : 'Add New Server'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Server Title"
            tooltip={{
              title: 'A descriptive name for your server',
              icon: <InfoCircleOutlined />
            }}
            rules={[{ required: true, message: 'Please input the server title!' }]}
          >
            <Input prefix={<InfoCircleOutlined />} placeholder="e.g., Production API Server" />
          </Form.Item>

          <Form.Item
            name="url"
            label="Server URL"
            tooltip={{
              title: 'The base URL of your server without the endpoint',
              icon: <InfoCircleOutlined />
            }}
            rules={[
              { required: true, message: 'Please input the server URL!' },
              { type: 'url', message: 'Please enter a valid URL!' }
            ]}
          >
            <Input prefix={<InfoCircleOutlined />} placeholder="e.g., https://api.example.com" />
          </Form.Item>

          <Form.Item
            name="endpoint"
            label="Health Check Endpoint"
            tooltip={{
              title: 'The specific endpoint used for health checks',
              icon: <InfoCircleOutlined />
            }}
            rules={[{ required: true, message: 'Please input the health check endpoint!' }]}
          >
            <Input prefix={<InfoCircleOutlined />} placeholder="e.g., /health or /status" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingServer ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
