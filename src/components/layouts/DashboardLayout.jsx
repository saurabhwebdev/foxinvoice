import React from 'react';
import { Layout, Menu, Button, Drawer, theme, Dropdown, Avatar, Space } from 'antd';
import { motion } from 'framer-motion';
import { 
  DashboardOutlined, 
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  MenuOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinessProfile } from '../../contexts/BusinessContext';

const { Header, Content } = Layout;

function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const { businessProfile } = useBusinessProfile();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/invoices',
      icon: <FileTextOutlined />,
      label: 'Invoices',
    },
    {
      key: '/clients',
      icon: <TeamOutlined />,
      label: 'Clients',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
  ];

  const profileMenu = {
    items: [
      {
        key: 'email',
        label: currentUser?.email,
        disabled: true,
        style: { 
          color: '#666',
          padding: '8px 16px',
          fontSize: '13px'
        }
      },
      { type: 'divider' },
      {
        key: 'profile',
        label: 'Profile Settings',
        icon: <SettingOutlined />,
        onClick: () => navigate('/profile'),
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
    <Layout style={{ minHeight: '100vh', background: colorBgContainer }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
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
          <div className="logo" style={{ 
            fontSize: '24px', 
            fontWeight: 600,
            color: '#022F40'
          }}>
            FoxInvoice
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Desktop Menu */}
            <div className="desktop-menu">
              <Menu
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
                style={{ border: 'none', background: 'transparent' }}
              />
            </div>

            {/* Profile Dropdown */}
            <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
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
                  >
                    {businessProfile?.initials || <UserOutlined />}
                  </Avatar>
                </Space>
              </motion.div>
            </Dropdown>

            {/* Mobile Menu Button */}
            <Button
              className="mobile-menu-button"
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              style={{
                fontSize: '20px',
              }}
            />
          </div>
        </Header>
      </motion.div>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={250}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={[
            ...menuItems,
            { type: 'divider' },
            {
              key: 'profile',
              label: 'Profile Settings',
              icon: <SettingOutlined />,
              onClick: () => {
                navigate('/profile');
                setMobileMenuOpen(false);
              },
            },
            {
              key: 'logout',
              label: 'Logout',
              icon: <LogoutOutlined />,
              onClick: handleLogout,
            },
          ]}
          onClick={({ key }) => {
            if (menuItems.find(item => item.key === key)) {
              navigate(key);
              setMobileMenuOpen(false);
            }
          }}
        />
      </Drawer>

      <Layout style={{ padding: '24px', background: colorBgContainer }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Content
            style={{
              padding: 24,
              margin: '0 auto',
              maxWidth: 1200,
              minHeight: 280,
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(2, 47, 64, 0.08)',
            }}
          >
            {children}
          </Content>
        </motion.div>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout; 