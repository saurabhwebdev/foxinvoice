import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Statistic, 
  DatePicker, Table, Space, Select,
  Progress, Empty, Tag, Divider
} from 'antd';
import {
  DollarOutlined, RiseOutlined,
  FileTextOutlined, UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Line } from '@ant-design/charts';
import { useBusinessProfile } from '../../contexts/BusinessContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function Reports() {
  const { currentUser } = useAuth();
  const { businessProfile } = useBusinessProfile();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [reportType, setReportType] = useState('monthly');
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    averageInvoiceValue: 0
  });
  const [selectedCurrency, setSelectedCurrency] = useState('INR');

  const fetchInvoices = async () => {
    try {
      let q = query(
        collection(db, 'invoices'),
        where('userId', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const invoiceList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(invoice => {
        if (!dateRange) return true;
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= dateRange[0].toDate() && 
               invoiceDate <= dateRange[1].toDate();
      });

      setInvoices(invoiceList);
      calculateSummaryStats(invoiceList);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentUser, dateRange]);

  const calculateSummaryStats = (invoiceList) => {
    const stats = {
      totalRevenue: 0,
      paidAmount: 0,
      pendingAmount: 0,
      totalInvoices: invoiceList.length,
      paidInvoices: 0,
      pendingInvoices: 0,
      averageInvoiceValue: 0
    };

    invoiceList.forEach(invoice => {
      stats.totalRevenue += invoice.total || 0;
      if (invoice.status === 'paid') {
        stats.paidAmount += invoice.total || 0;
        stats.paidInvoices++;
      } else {
        stats.pendingAmount += invoice.total || 0;
        stats.pendingInvoices++;
      }
    });

    stats.averageInvoiceValue = stats.totalInvoices > 0 ? 
      stats.totalRevenue / stats.totalInvoices : 0;

    setSummaryStats(stats);
  };

  const getRevenueData = () => {
    const groupedData = {};
    
    invoices.forEach(invoice => {
      const date = new Date(invoice.createdAt);
      const key = reportType === 'monthly' 
        ? `${date.getFullYear()}-${date.getMonth() + 1}`
        : date.toISOString().split('T')[0];
      
      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key] += invoice.total || 0;
    });

    return Object.entries(groupedData)
      .map(([date, revenue]) => ({
        date,
        revenue
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const formatCurrency = (value) => {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: selectedCurrency
    });
    return formatter.format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 24 
          }}>
            <Title level={2}>Financial Reports</Title>
            <Space>
              <Select
                value={selectedCurrency}
                onChange={setSelectedCurrency}
                style={{ width: 120 }}
              >
                <Select.Option value="INR">₹ INR</Select.Option>
                <Select.Option value="USD">$ USD</Select.Option>
                <Select.Option value="EUR">€ EUR</Select.Option>
                <Select.Option value="GBP">£ GBP</Select.Option>
                <Select.Option value="AUD">A$ AUD</Select.Option>
                <Select.Option value="CAD">C$ CAD</Select.Option>
              </Select>
              <Select
                value={reportType}
                onChange={setReportType}
                style={{ width: 120 }}
              >
                <Select.Option value="daily">Daily</Select.Option>
                <Select.Option value="monthly">Monthly</Select.Option>
              </Select>
              <RangePicker 
                onChange={setDateRange}
                style={{ width: 280 }}
              />
            </Space>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={summaryStats.totalRevenue}
                  precision={2}
                  prefix={<DollarOutlined />}
                  formatter={value => formatCurrency(value)}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Paid Amount"
                  value={summaryStats.paidAmount}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                  formatter={value => formatCurrency(value)}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Pending Amount"
                  value={summaryStats.pendingAmount}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                  formatter={value => formatCurrency(value)}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Average Invoice"
                  value={summaryStats.averageInvoiceValue}
                  precision={2}
                  prefix={<DollarOutlined />}
                  formatter={value => formatCurrency(value)}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Revenue Trend" style={{ marginTop: 24 }}>
            {invoices.length > 0 ? (
              <Line
                data={getRevenueData()}
                xField="date"
                yField="revenue"
                point={{ size: 5, shape: 'diamond' }}
                label={{ 
                  style: { fill: '#aaa' },
                  formatter: (v) => formatCurrency(v.revenue)
                }}
                tooltip={{
                  formatter: (datum) => ({
                    name: 'Revenue',
                    value: formatCurrency(datum.revenue)
                  })
                }}
              />
            ) : (
              <Empty description="No data available" />
            )}
          </Card>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <Card title="Invoice Status">
                <Statistic
                  title="Total Invoices"
                  value={summaryStats.totalInvoices}
                  prefix={<FileTextOutlined />}
                />
                <Divider />
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>Paid Invoices: {summaryStats.paidInvoices}</Text>
                  <Progress 
                    percent={summaryStats.totalInvoices ? 
                      (summaryStats.paidInvoices / summaryStats.totalInvoices) * 100 : 0}
                    status="success"
                  />
                  <Text>Pending Invoices: {summaryStats.pendingInvoices}</Text>
                  <Progress 
                    percent={summaryStats.totalInvoices ? 
                      (summaryStats.pendingInvoices / summaryStats.totalInvoices) * 100 : 0}
                    status="exception"
                  />
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Recent Activity">
                <Table
                  dataSource={invoices.slice(0, 5)}
                  columns={[
                    {
                      title: 'Date',
                      dataIndex: 'createdAt',
                      key: 'date',
                      render: date => new Date(date).toLocaleDateString()
                    },
                    {
                      title: 'Amount',
                      dataIndex: 'total',
                      key: 'amount',
                      render: amount => formatCurrency(amount || 0)
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
                          {status?.toUpperCase()}
                        </Tag>
                      )
                    }
                  ]}
                  pagination={false}
                  rowKey="id"
                />
              </Card>
            </Col>
          </Row>
        </Space>
      </Card>
    </motion.div>
  );
}

export default Reports; 