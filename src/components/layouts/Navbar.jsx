import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Button } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  BellOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Header } = Layout;

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const profileMenu = {
    items: [
      {
        key: 'profile',
        label: 'Profile Settings',
        icon: <SettingOutlined />,
        onClick: () => navigate('/profile'),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(2, 47, 64, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo" style={{ 
          fontSize: '24px', 
          fontWeight: 600,
          color: '#022F40'
        }}>
          FoxInvoice
        </div>
      </motion.div>

      <Space size={24}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '20px' }} />}
            style={{ height: '40px', width: '40px' }}
          />
        </motion.div>

        <Dropdown menu={profileMenu} trigger={['click']}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ cursor: 'pointer' }}
          >
            <Space>
              <Avatar
                style={{
                  backgroundColor: '#0090C1',
                  cursor: 'pointer',
                }}
                icon={<UserOutlined />}
              />
            </Space>
          </motion.div>
        </Dropdown>
      </Space>
    </Header>
  );
}

export default Navbar; 