import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, Card, Button, Tag, Space, 
  Typography, Input, Dropdown, message,
  Popconfirm, Menu, Modal 
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, 
  FilterOutlined, EyeOutlined,
  DeleteOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CloseCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import SignatureCanvas from 'react-signature-canvas';
import { DigitalSignature } from '../../utils/digitalSignature';

const { Title } = Typography;

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const signaturePadRef = useRef(null);
  const [keyPair, setKeyPair] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [currentUser]);

  const fetchInvoices = async () => {
    try {
      const q = query(
        collection(db, 'invoices'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const invoiceList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setInvoices(invoiceList);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      message.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'invoices', id));
      message.success('Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      message.error('Failed to delete invoice');
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      await updateDoc(invoiceRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setInvoices(invoices.map(inv => 
        inv.id === invoiceId ? { ...inv, status: newStatus } : inv
      ));
      
      message.success(`Invoice status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      message.error('Failed to update invoice status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'overdue':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const getStatusMenu = (record) => (
    <Menu
      onClick={({ key }) => handleStatusChange(record.id, key)}
      items={[
        {
          key: 'paid',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          label: 'Paid',
          disabled: record.status === 'paid'
        },
        {
          key: 'pending',
          icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
          label: 'Pending',
          disabled: record.status === 'pending'
        },
        {
          key: 'overdue',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          label: 'Overdue',
          disabled: record.status === 'overdue'
        }
      ]}
    />
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSignature = async () => {
    if (signaturePadRef.current.isEmpty()) {
      message.error('Please provide a signature');
      return;
    }

    try {
      setLoading(true);
      
      // Generate key pair for signing
      const { keyPair, publicKeyBase64 } = await DigitalSignature.generateKeyPair();
      
      // Get the signature image as base64
      const signatureImage = signaturePadRef.current.toDataURL();
      
      // Create the data to be signed
      const signatureData = {
        invoiceId: selectedInvoiceId,
        signedAt: new Date().toISOString(),
        userId: currentUser.uid,
        signatureImage // Include the image in the signed data
      };

      // Create signature bundle
      const signatureBundle = await DigitalSignature.createSignatureBundle(signatureData, keyPair.privateKey);

      // Save to Firebase with all necessary data
      const invoiceRef = doc(db, 'invoices', selectedInvoiceId);
      await updateDoc(invoiceRef, {
        signature: signatureImage,
        signedAt: signatureBundle.timestamp,
        digitalSignature: {
          signature: signatureBundle.signature,
          publicKey: publicKeyBase64,
          data: signatureBundle.data,
          hash: signatureBundle.hash,
          signedData: signatureData,
          timestamp: signatureBundle.timestamp
        },
        status: 'signed'
      });

      message.success('Document signed successfully');
      setIsSignatureModalVisible(false);
      fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error signing document:', error);
      message.error('Failed to sign document');
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => {
    signaturePadRef.current.clear();
  };

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'id',
      key: 'id',
      render: id => id.slice(0, 8).toUpperCase()
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName'
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: date => formatDateTime(date)
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      key: 'amount',
      align: 'right',
      render: amount => formatCurrency(amount)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Dropdown 
          overlay={getStatusMenu(record)} 
          trigger={['click']}
        >
          <Tag
            color={
              status === 'paid' ? 'success' :
              status === 'pending' ? 'warning' : 'error'
            }
            style={{ cursor: 'pointer' }}
            icon={getStatusIcon(status)}
          >
            {status.toUpperCase()}
          </Tag>
        </Dropdown>
      ),
      filters: [
        { text: 'Paid', value: 'paid' },
        { text: 'Pending', value: 'pending' },
        { text: 'Overdue', value: 'overdue' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => navigate(`/invoices/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedInvoiceId(record.id);
              setIsSignatureModalVisible(true);
            }}
          >
            Sign
          </Button>
          <Popconfirm
            title="Delete Invoice"
            description="Are you sure you want to delete this invoice?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
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
          <Title level={2}>Invoices</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/invoices/create')}
          >
            Create Invoice
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="Search invoices"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Dropdown menu={{
              items: [
                { key: 'all', label: 'All' },
                { key: 'paid', label: 'Paid' },
                { key: 'pending', label: 'Pending' },
                { key: 'overdue', label: 'Overdue' },
              ]
            }}>
              <Button icon={<FilterOutlined />}>
                Filter
              </Button>
            </Dropdown>
          </Space>
        </div>

        <Table 
          columns={columns} 
          dataSource={invoices}
          loading={loading}
          rowKey="id"
          onChange={(pagination, filters, sorter) => {
            // Handle table changes if needed
          }}
        />
      </Card>
      
      <Modal
        title="Add Digital Signature"
        open={isSignatureModalVisible}
        onOk={handleSignature}
        onCancel={() => setIsSignatureModalVisible(false)}
        width={600}
        footer={[
          <Button key="clear" onClick={clearSignature}>
            Clear
          </Button>,
          <Button key="cancel" onClick={() => setIsSignatureModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSignature}>
            Save Signature
          </Button>,
        ]}
      >
        <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, marginBottom: 16 }}>
          <SignatureCanvas
            ref={signaturePadRef}
            canvasProps={{
              width: 550,
              height: 200,
              className: 'signature-canvas',
              style: { 
                width: '100%', 
                height: '200px',
                backgroundColor: '#f0f2f5'
              }
            }}
          />
        </div>
        <p style={{ color: '#666' }}>
          Use your mouse or touch screen to sign above
        </p>
      </Modal>
    </motion.div>
  );
}

export default InvoiceList; 