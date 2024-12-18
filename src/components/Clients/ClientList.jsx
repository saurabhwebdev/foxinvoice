import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Space, 
  Typography, Input, Popconfirm, message, Avatar
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, 
  EditOutlined, DeleteOutlined,
  UserAddOutlined, EyeOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, [currentUser]);

  const fetchClients = async () => {
    try {
      const q = query(
        collection(db, 'clients'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const clientList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setClients(clientList);
    } catch (error) {
      console.error('Error fetching clients:', error);
      message.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
      message.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      message.error('Failed to delete client');
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

  const columns = [
    {
      title: 'Name',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (name, record) => (
        <Space>
          <Avatar
            style={{
              backgroundColor: 'var(--primary)',
              verticalAlign: 'middle',
            }}
            size="large"
          >
            {getInitials(name)}
          </Avatar>
          <span>{name}</span>
        </Space>
      ),
      sorter: (a, b) => a.clientName.localeCompare(b.clientName),
    },
    {
      title: 'Email',
      dataIndex: 'clientEmail',
      key: 'clientEmail',
    },
    {
      title: 'Phone',
      dataIndex: 'clientPhone',
      key: 'clientPhone',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/clients/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/clients/edit/${record.id}`);
            }}
          />
          <Popconfirm
            title="Delete client?"
            description="Are you sure you want to delete this client?"
            onConfirm={(e) => {
              e.stopPropagation();
              handleDelete(record.id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={e => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24
        }}>
          <Title level={2}>Clients</Title>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            onClick={() => navigate('/clients/create')}
          >
            Add Client
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search clients"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={clients.filter(client => 
            client.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
            client.clientEmail?.toLowerCase().includes(searchText.toLowerCase()) ||
            client.clientPhone?.includes(searchText)
          )}
          loading={loading}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => navigate(`/clients/${record.id}`)
          })}
          className="clickable-rows"
        />
      </Card>
    </motion.div>
  );
}

export default ClientList; 