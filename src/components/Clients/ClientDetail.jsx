import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Descriptions, Statistic, 
  Table, Tag, Row, Col, Button, Space, Spin, message, Avatar
} from 'antd';
import { 
  UserOutlined, PhoneOutlined, MailOutlined, 
  EditOutlined, ArrowLeftOutlined,
  DollarOutlined, FileTextOutlined,
  ClockCircleOutlined, HomeOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinessProfile } from '../../contexts/BusinessContext';

const { Title, Text } = Typography;

function ClientDetail() {
  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { businessProfile } = useBusinessProfile();

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      // Fetch client details
      const clientDoc = await getDoc(doc(db, 'clients', id));
      if (!clientDoc.exists()) {
        message.error('Client not found');
        navigate('/clients');
        return;
      }
      setClient(clientDoc.data());

      // Fetch client's invoices
      const q = query(
        collection(db, 'invoices'),
        where('userId', '==', currentUser.uid),
        where('clientId', '==', id)
      );
      const invoiceSnapshot = await getDocs(q);
      const invoiceList = invoiceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvoices(invoiceList);
    } catch (error) {
      console.error('Error fetching client data:', error);
      message.error('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (value) => {
    const currency = businessProfile?.defaultCurrency || 'INR';
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency
    });
    return formatter.format(value);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const paidAmount = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  const recentInvoices = invoices
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 24 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/clients')}
          >
            Back to Clients
          </Button>
        </Space>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: 24 
        }}>
          <Avatar
            size={64}
            style={{
              backgroundColor: 'var(--primary)',
              marginRight: 16,
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getInitials(client?.clientName)}
          </Avatar>
          <div>
            <Title level={2} style={{ margin: 0 }}>{client?.clientName}</Title>
            <Text type="secondary">Client since {new Date(client?.createdAt).toLocaleDateString()}</Text>
          </div>
        </div>

        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>
            {client?.clientEmail || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
            {client?.clientPhone || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label={<><HomeOutlined /> Address</>}>
            {client?.clientAddress || 'N/A'}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16 }}>
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => navigate(`/clients/edit/${id}`)}
            >
              Edit Client
            </Button>
            <Button
              onClick={() => navigate('/invoices/create', { 
                state: { clientId: id } 
              })}
            >
              Create Invoice
            </Button>
          </Space>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalAmount}
              prefix={<DollarOutlined />}
              precision={2}
              formatter={value => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Amount Paid"
              value={paidAmount}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              formatter={value => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Amount Pending"
              value={pendingAmount}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: pendingAmount > 0 ? '#cf1322' : '#3f8600' }}
              formatter={value => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Invoices */}
      <Card title="Recent Invoices">
        <Table
          dataSource={recentInvoices}
          columns={[
            {
              title: 'Invoice #',
              dataIndex: 'id',
              key: 'id',
              render: id => id.slice(0, 8).toUpperCase(),
            },
            {
              title: 'Date',
              dataIndex: 'createdAt',
              key: 'date',
              render: date => new Date(date).toLocaleDateString(),
            },
            {
              title: 'Amount',
              dataIndex: 'total',
              key: 'amount',
              render: amount => `$${amount.toFixed(2)}`,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: status => (
                <Tag color={
                  status === 'paid' ? 'success' :
                  status === 'pending' ? 'warning' : 'error'
                }>
                  {status.toUpperCase()}
                </Tag>
              ),
            },
          ]}
          pagination={false}
          rowKey="id"
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button 
            type="primary"
            onClick={() => navigate('/invoices/create', { 
              state: { clientId: id } 
            })}
          >
            Create New Invoice
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default ClientDetail; 