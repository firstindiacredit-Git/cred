import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  Input,
  Button,
  Card,
  List,
  message,
  Popconfirm,
  Tooltip,
  Table,
} from "antd";
import {
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LinkOutlined,
  GlobalOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import LockScreen from "../components/LockScreen";
import PasswordGenerator from "../components/PasswordGenerator";
import Footer from "../components/Footer";

interface Credential {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  createdAt: Date;
  userId: string;
  updatedAt?: Date;
}

interface CredentialData {
  title: string;
  username: string;
  password: string;
  url: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt: Timestamp;
}

const Credentials: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(
    null
  );
  const [isGridView, setIsGridView] = useState(window.innerWidth <= 1660);
  const [showListViewOption, setShowListViewOption] = useState(
    window.innerWidth > 1660
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [isPasswordGenVisible, setIsPasswordGenVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 640);
  const { user } = useAuth();

  interface LogoWithFallbackProps {
    url: string;
    title: string;
    index: number;
  }

  const MemoizedLogoWithFallback = React.memo(
    ({ url, title, index }: LogoWithFallbackProps) => {
      const [hasError, setHasError] = useState(false);

      const handleError = useCallback(() => {
        setHasError(true);
      }, []);

      return (
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <span>{index + 1}.</span>
            <a
              href={"https://" + url}
              target="_blank"
              rel="noopener noreferrer"
              className=" mr-2 pr-2 break-words flex w-lg translate-x-2a   truncate "
            >
              <span className="uppercase">{title}</span>
              <LinkOutlined className="scale-75 text-blue-400" />
            </a>
          </div>
          {!hasError ? (
            <img
              src={`https://logo.clearbit.com/${url}`}
              alt={title}
              className="w-6 h-6 rounded-full object-contain"
              onError={handleError}
            />
          ) : (
            <GlobalOutlined className="w-8 h-8" />
          )}
        </div>
      );
    }
  );

  MemoizedLogoWithFallback.displayName = "MemoizedLogoWithFallback";

  useEffect(() => {
    fetchCredentials();
  }, [user]);

  useEffect(() => {
    const newVisiblePasswords: { [key: string]: boolean } = {};
    credentials.forEach((cred) => {
      newVisiblePasswords[cred.id] = showAllPasswords;
    });
    setVisiblePasswords(newVisiblePasswords);
  }, [showAllPasswords, credentials]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 1660) {
        setIsGridView(true);
        setShowListViewOption(false);
      } else {
        setShowListViewOption(true);
      }
      setIsMobileView(width <= 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCredentials = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const credentialsRef = collection(db, "users", user.uid, "credentials");
      const querySnapshot = await getDocs(credentialsRef);
      const fetchedCredentials: Credential[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedCredentials.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        } as Credential);
      });

      setCredentials(
        fetchedCredentials.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching credentials:", error);
      message.error("Failed to fetch credentials: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    setTitle(credential.title);
    setUsername(credential.username);
    setPassword(credential.password);
    setUrl(credential.url || "");
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleDelete = async (credentialId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const credentialRef = doc(
        db,
        "users",
        user.uid,
        "credentials",
        credentialId
      );
      await deleteDoc(credentialRef);
      message.success("Credential deleted successfully");
      fetchCredentials();
    } catch (error) {
      console.error("Error deleting credential:", error);
      message.error("Failed to delete credential");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate form
    if (!title.trim()) {
      message.error("Title is required");
      return;
    }
    if (!username.trim()) {
      message.error("Username is required");
      return;
    }
    if (!password.trim()) {
      message.error("Password is required");
      return;
    }

    try {
      setLoading(true);
      const credentialData: CredentialData = {
        title: title.trim(),
        username: username.trim(),
        password: password.trim(),
        url: url.trim(),
        userId: user.uid,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (isEditMode && editingCredential) {
        // Update existing credential
        const credentialRef = doc(
          db,
          "users",
          user.uid,
          "credentials",
          editingCredential.id
        );
        await updateDoc(credentialRef, {
          ...credentialData,
          updatedAt: Timestamp.fromDate(new Date()),
        });
        message.success("Credential updated successfully");
      } else {
        // Add new credential
        const credentialsRef = collection(db, "users", user.uid, "credentials");
        const newCredentialData = {
          ...credentialData,
          createdAt: Timestamp.fromDate(new Date()),
        };
        await addDoc(credentialsRef, newCredentialData);
        message.success("Credential added successfully");
      }

      setIsModalVisible(false);
      clearForm();
      fetchCredentials();
    } catch (error) {
      console.error("Error saving credential:", error);
      message.error(`Failed to ${isEditMode ? "update" : "add"} credential`);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setTitle("");
    setUsername("");
    setPassword("");
    setUrl("");
    setIsEditMode(false);
    setEditingCredential(null);
  };

  const togglePasswordVisibility = (credentialId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [credentialId]: !prev[credentialId],
    }));
  };

  const copyToClipboard = async (
    text: string,
    type: "username" | "password"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(
        `${type === "username" ? "Username" : "Password"} copied to clipboard`
      );
    } catch (error) {
      message.error("Failed to copy to clipboard");
    }
  };

  const renderCredentialInfo = useCallback(
    (credential: Credential) => (
      <div className="space-y-2">
        <div className="flex gap-2  items-center justify-between">
          <strong className="sm:w-1/3">Username:</strong>
          <div className="flex w-2/3 bg-gray-50 justify-between items-center rounded-md">
            <div className=" max-w-full text-nowrap  overflow-x-hidden px-2">
              {credential.username}
            </div>
            

            <div className="flex ml-1  bg-gray-100 rounded-r-md">
              <Tooltip title="Copy username">
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() =>
                    copyToClipboard(credential.username, "username")
                  }
                />
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center justify-between">
          <strong className="sm:w-1/3">Password:</strong>
            <div className="flex w-2/3 bg-gray-50 justify-between items-center rounded-md">
              <div className=" max-w-full text-nowrap  overflow-x-hidden px-2">
                {visiblePasswords[credential.id]
                  ? credential.password
                  : "••••••••"}
              </div>
              <div className="flex ml-1 bg-gray-100 rounded-r-md">
                <Tooltip title="Toggle visibility">
                  <Button
                    type="text"
                    icon={
                      visiblePasswords[credential.id] ? (
                        <EyeInvisibleOutlined />
                      ) : (
                        <EyeOutlined />
                      )
                    }
                    onClick={() => togglePasswordVisibility(credential.id)}
                  />
                </Tooltip>
                <Tooltip title="Copy password">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() =>
                      copyToClipboard(credential.password, "password")
                    }
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
    ),
    [visiblePasswords, copyToClipboard, togglePasswordVisibility]
  );

  const filteredCredentials = useMemo(() => {
    if (!searchQuery) return credentials;
    return credentials.filter(
      (credential) =>
        credential.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        credential.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (credential.url &&
          credential.url.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [credentials, searchQuery]);

  const renderGridView = useCallback(
    () => (
      <div className={`grid gap-6 ${isMobileView ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredCredentials.map((credential, index) => (
          <Card
            key={credential.id}
            className="hover:shadow-lg transition-shadow"
            title={
              <MemoizedLogoWithFallback
                index={index}
                url={credential.url}
                title={credential.title}
              />
            }
            actions={[
              <Button
                key="edit"
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(credential)}
              >
                Edit
              </Button>,
              <Popconfirm
                key="delete"
                title="Delete Credential"
                description="Are you sure you want to delete this credential?"
                onConfirm={() => handleDelete(credential.id)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" icon={<DeleteOutlined />} danger>
                  Delete
                </Button>
              </Popconfirm>,
            ]}
          >
            {renderCredentialInfo(credential)}
          </Card>
        ))}
      </div>
    ),
    [
      filteredCredentials,
      handleEdit,
      handleDelete,
      renderCredentialInfo,
      MemoizedLogoWithFallback,
    ]
  );

  const renderTableView = useCallback(() => {
    const columns = [
      {
        title: '#',
        key: 'index',
        fixed: 'left' as const,
        width: 60,
        className: 'bg-white',
        render: (_: any, _record: any, index: number) => index + 1,
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: 300,
        ellipsis: true,
        render: (text: string, record: Credential) => (
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2 truncate">
              <span className="uppercase">{text}</span>
              {record.url && (
                <a
                  href={"https://" + record.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-500 flex items-center shrink-0"
                >
                  <LinkOutlined className="scale-75 text-blue-400" />
                </a>
              )}
            </div>
            {record.url && (
              <img
                src={`https://logo.clearbit.com/${record.url}`}
                alt={text}
                className="w-6 h-6 rounded-full object-contain shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
          </div>
        ),
      },
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        width: 250,
        ellipsis: true,
        render: (text: string) => (
          <div className="flex bg-gray-50 justify-between items-center rounded-md">
            <div className="truncate px-2">
              {text}
            </div>
            <div className="flex ml-1 bg-gray-100 rounded-r-md shrink-0">
              <Tooltip title="Copy username">
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(text, 'username');
                  }}
                />
              </Tooltip>
            </div>
          </div>
        ),
      },
      {
        title: 'Password',
        dataIndex: 'password',
        key: 'password',
        width: 250,
        ellipsis: true,
        render: (_: any, record: Credential) => (
          <div className="flex bg-gray-50 justify-between items-center rounded-md">
            <div className="truncate px-2 font-mono">
              {visiblePasswords[record.id] ? record.password : '••••••••'}
            </div>
            <div className="flex ml-1 bg-gray-100 rounded-r-md shrink-0">
              <Tooltip title="Toggle visibility">
                <Button
                  type="text"
                  icon={visiblePasswords[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePasswordVisibility(record.id);
                  }}
                />
              </Tooltip>
              <Tooltip title="Copy password">
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(record.password, 'password');
                  }}
                />
              </Tooltip>
            </div>
          </div>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        fixed: 'right' as const,
        width: 120,
        className: 'bg-white',
        render: (_: any, record: Credential) => (
          <div className="flex gap-2 justify-end">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
            <Popconfirm
              title="Delete Credential"
              description="Are you sure you want to delete this credential?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </div>
        ),
      },
    ];

    return (
      <Table
        dataSource={filteredCredentials}
        columns={columns}
        rowKey="id"
        className="bg-white w-full rounded-lg shadow"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    );
  }, [filteredCredentials, handleEdit, handleDelete, visiblePasswords, copyToClipboard, togglePasswordVisibility]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLockScreen={() => setIsLocked(true)} />
      <LockScreen isLocked={isLocked} onUnlock={() => setIsLocked(false)} />

      <div
        className={`max-w-7xl mx-auto px-4 py-6 flex-1 ${
          isLocked ? "filter blur-lg" : ""
        }`}
      >
        <div className="sm:mb-6 flex justify-between items-center">
          <div className="flex w-full items-center space-x-8">
            <Input.Search
              placeholder="Search credentials..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="hidden  sm:block">
            <Button.Group>
              <Button
                type={isGridView ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                onClick={() => setIsGridView(true)}
              />
              {showListViewOption && (
                <Button
                  type={!isGridView ? "primary" : "default"}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setIsGridView(false)}
                />
              )}
              <Tooltip
                title={
                  showAllPasswords ? "Hide all passwords" : "Show all passwords"
                }
              >
                <Button
                  type={showAllPasswords ? "primary" : "default"}
                  icon={
                    showAllPasswords ? (
                      <EyeInvisibleOutlined />
                    ) : (
                      <EyeOutlined />
                    )
                  }
                  onClick={() => setShowAllPasswords(!showAllPasswords)}
                />
              </Tooltip>
              {isMobileView && (
                <Tooltip title="Password Generator">
                  <Button
                    type={isPasswordGenVisible ? "primary" : "default"}
                    icon={<KeyOutlined />}
                    onClick={() => setIsPasswordGenVisible(true)}
                  />
                </Tooltip>
              )}
            </Button.Group>
            </div>
            <Button
              type="primary"
              className="hidden sm:block"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              {isMobileView ? "Add" : "Add Credential"}
            </Button>
          </div>
          
        </div>
        <div className="my-4 flex justify-between sm:hidden">
          <Button.Group>
              <Button
                type={isGridView ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                onClick={() => setIsGridView(true)}
              />
              {showListViewOption && (
                <Button
                  type={!isGridView ? "primary" : "default"}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setIsGridView(false)}
                />
              )}
              <Tooltip
                title={
                  showAllPasswords ? "Hide all passwords" : "Show all passwords"
                }
              >
                <Button
                  type={showAllPasswords ? "primary" : "default"}
                  icon={
                    showAllPasswords ? (
                      <EyeInvisibleOutlined />
                    ) : (
                      <EyeOutlined />
                    )
                  }
                  onClick={() => setShowAllPasswords(!showAllPasswords)}
                />
              </Tooltip>
              {isMobileView && (
                <Tooltip title="Password Generator">
                  <Button
                    type={isPasswordGenVisible ? "primary" : "default"}
                    icon={<KeyOutlined />}
                    onClick={() => setIsPasswordGenVisible(true)}
                  />
                </Tooltip>
              )}
            </Button.Group>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              {isMobileView ? "Add" : "Add Credential"}
            </Button>
          </div>

        <div className="flex gap-6">
          <div className={`flex-grow ${!isMobileView ? 'flex-1' : 'w-full'}`}>
            {loading ? (
              <div>Loading...</div>
            ) : isGridView ? (
              renderGridView()
            ) : (
              renderTableView()
            )}
          </div>
          {!isMobileView && (
            <div className="w-80">
              <PasswordGenerator />
            </div>
          )}
        </div>

        <Modal
          open={isPasswordGenVisible}
          onCancel={() => setIsPasswordGenVisible(false)}
          footer={null}
          width={400}
        >
          <PasswordGenerator />
        </Modal>

        <Modal
          title={isEditMode ? "Edit Credential" : "Add New Credential"}
          open={isModalVisible}
          onOk={handleSave}
          onCancel={() => {
            setIsModalVisible(false);
            clearForm();
          }}
          confirmLoading={loading}
        >
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input.Password
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex position items-center rounded-xl ">
              <div className=" px-2 absolute z-50 rounded-md rounded-r-none text-[#BFBFBF]  py-1 border border-gray-300 ">
                https://
              </div>
              <Input
                placeholder="URL"
                value={url}
                className="pl-20"
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default Credentials;
