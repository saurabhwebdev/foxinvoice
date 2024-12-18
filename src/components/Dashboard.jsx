import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Statistic, Row, Col, 
  Button, List, Tag, Space, Spin 
} from 'antd';
import { 
  DollarOutlined, FileTextOutlined, 
  TeamOutlined, ArrowUpOutlined, 
  ArrowDownOutlined, PlusOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessProfile } from '../contexts/BusinessContext';

const { Title, Text } = Typography;

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    activeClients: 0,
    recentInvoices: [],
    monthlyChange: 0,
    pendingAmount: 0
  });
  
  const { currentUser } = useAuth();
  const { businessProfile } = useBusinessProfile();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

      // Fetch invoices
      const invoicesQuery = query(
        collection(db, 'invoices'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const invoicesSnapshot = await getDocs(invoicesQuery);
      const invoices = invoicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate statistics
      const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      const pendingAmount = invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      // Calculate monthly change
      const thisMonthRevenue = invoices
        .filter(inv => new Date(inv.createdAt) >= firstDayOfMonth && new Date(inv.createdAt) <= lastDayOfMonth)
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      const lastMonthRevenue = invoices
        .filter(inv => new Date(inv.createdAt) >= firstDayOfLastMonth && new Date(inv.createdAt) < firstDayOfMonth)
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      const monthlyChange = lastMonthRevenue ? 
        ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      // Fetch active clients
      const clientsQuery = query(
        collection(db, 'clients'),
        where('userId', '==', currentUser.uid)
      );
      const clientsSnapshot = await getDocs(clientsQuery);

      setStats({
        totalRevenue,
        totalInvoices: invoices.length,
        activeClients: clientsSnapshot.docs.length,
        recentInvoices: invoices.slice(0, 5),
        monthlyChange,
        pendingAmount
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: businessProfile?.currency || 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <Title level={2} style={{ marginBottom: 24 }}>Dashboard</Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                precision={2}
                formatter={(value) => formatCurrency(value)}
                prefix={<DollarOutlined />}
              />
              <Text type={stats.monthlyChange >= 0 ? "success" : "danger"}>
                {stats.monthlyChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(stats.monthlyChange).toFixed(1)}% from last month
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Total Invoices"
                value={stats.totalInvoices}
                prefix={<FileTextOutlined />}
              />
              <Text type="warning">
                {formatCurrency(stats.pendingAmount)} pending
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Active Clients"
                value={stats.activeClients}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24}>
            <Card
              title="Recent Invoices"
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/invoices/create')}
                >
                  New Invoice
                </Button>
              }
            >
              <List
                dataSource={stats.recentInvoices}
                renderItem={invoice => (
                  <List.Item
                    key={invoice.id}
                    actions={[
                      <Tag color={
                        invoice.status === 'paid' ? 'success' :
                        invoice.status === 'pending' ? 'warning' : 'error'
                      }>
                        {invoice.status?.toUpperCase()}
                      </Tag>
                    ]}
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <List.Item.Meta
                      title={invoice.clientName}
                      description={`Invoice #${invoice.id.slice(0, 8).toUpperCase()}`}
                    />
                    <div>{formatCurrency(invoice.total)}</div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
}

export default Dashboard; 