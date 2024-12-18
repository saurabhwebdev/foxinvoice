import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Descriptions, Tag, 
  Button, Space, Spin, message, Row, Col, Divider, Table
} from 'antd';
import { 
  ArrowLeftOutlined, PrinterOutlined,
  EditOutlined, DeleteOutlined,
  UserOutlined, CalendarOutlined,
  NumberOutlined, BankOutlined,
  HomeOutlined, PhoneOutlined,
  MailOutlined, CheckCircleFilled, WarningFilled
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinessProfile } from '../../contexts/BusinessContext';
import { DigitalSignature } from '../../utils/digitalSignature';
import './InvoiceDetail.css';

const { Title, Text } = Typography;

function InvoiceDetail() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signatureValid, setSignatureValid] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { businessProfile } = useBusinessProfile();

  useEffect(() => {
    fetchInvoiceData();
  }, [id]);

  useEffect(() => {
    if (invoice?.digitalSignature) {
      verifySignature();
    }
  }, [invoice]);

  const fetchInvoiceData = async () => {
    try {
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        message.error('Invoice not found');
        navigate('/invoices');
        return;
      }

      setInvoice(docSnap.data());
    } catch (error) {
      console.error('Error fetching invoice:', error);
      message.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const verifySignature = async () => {
    try {
      if (!invoice?.digitalSignature) {
        setSignatureValid(false);
        return;
      }

      const { signature, publicKey, data, hash } = invoice.digitalSignature;
      
      // Use the same normalization method as in signing
      const dataString = DigitalSignature.normalizeDataString(data);
      const computedHash = await DigitalSignature.hashData(dataString);
      
      if (computedHash !== hash) {
        console.error('Hash verification failed', {
          computedHash,
          storedHash: hash,
          normalizedData: dataString
        });
        setSignatureValid(false);
        return;
      }
      
      // Verify the cryptographic signature
      const isValid = await DigitalSignature.verifySignature(
        dataString,
        signature,
        publicKey
      );

      console.log('Signature verification result:', {
        hashMatch: computedHash === hash,
        signatureValid: isValid,
        normalizedData: dataString
      });

      setSignatureValid(isValid);
    } catch (error) {
      console.error('Error verifying signature:', error);
      setSignatureValid(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: invoice?.currency || 'INR'
    }).format(amount);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content').innerHTML;
    const originalContent = document.body.innerHTML;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${id.slice(0, 8).toUpperCase()}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd/dist/antd.min.css">
          <style>
            /* Copy all styles to ensure exact matching */
            .invoice-detail-card {
              max-width: 1000px;
              margin: 24px auto;
              padding: 0;
              background: white;
              box-shadow: none;
            }

            .invoice-container {
              padding: 40px;
            }

            /* Header Styles */
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 48px;
            }

            .brand-section {
              max-width: 300px;
            }

            .business-logo {
              max-height: 80px;
              object-fit: contain;
            }

            .document-title {
              text-align: right;
            }

            .document-title h1 {
              color: #1890ff;
              margin: 0;
              font-size: 40px;
            }

            .invoice-number {
              font-size: 16px;
              color: #666;
            }

            /* Info Section Styles */
            .info-section {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 24px;
              margin-bottom: 48px;
            }

            .business-details,
            .client-details,
            .invoice-summary {
              padding: 20px;
              background: #fafafa;
              border-radius: 8px;
              border: 1px solid #f0f0f0;
            }

            .info-content {
              display: flex;
              flex-direction: column;
              gap: 4px;
              margin-top: 12px;
            }

            /* Table Styles */
            .invoice-items-table {
              margin-bottom: 48px;
            }

            .ant-table-thead > tr > th {
              background: #f8f9fa !important;
              font-weight: 600;
            }

            .ant-table-tbody > tr > td {
              padding: 16px;
            }

            .total-row {
              background: #f8f9fa;
              font-size: 16px;
            }

            .total-row td {
              padding: 16px !important;
              font-weight: 600;
            }

            /* Footer Sections */
            .invoice-footer-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
              margin-bottom: 48px;
            }

            .notes-section,
            .payment-details {
              padding: 20px;
              background: #fafafa;
              border-radius: 8px;
              border: 1px solid #f0f0f0;
            }

            .payment-details {
              background: #f0f5ff;
              border: 1px dashed #1890ff;
            }

            .invoice-footer {
              text-align: center;
              padding: 24px;
              background: #fafafa;
              border-radius: 8px;
              border: 1px solid #f0f0f0;
            }

            /* Print specific styles */
            @media print {
              body { 
                padding: 0;
                margin: 0;
              }
              
              @page {
                size: A4;
                margin: 1cm;
              }

              .invoice-detail-card {
                margin: 0;
                padding: 0;
              }

              .no-print {
                display: none !important;
              }
            }

            /* Additional Ant Design styles */
            .ant-typography {
              color: rgba(0, 0, 0, 0.85);
            }

            .ant-tag {
              padding: 4px 8px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-detail-card">
            ${printContent}
          </div>
          <script>
            window.onload = function() { 
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return <Spin size="large" />;

  return (
    <motion.div>
      <Card className="invoice-detail-card">
        <div className="no-print action-buttons">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')}>Back</Button>
            <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>Print</Button>
          </Space>
        </div>

        <div id="invoice-content" className="invoice-container">
          <div className="invoice-header">
            <div className="brand-section">
              {businessProfile?.logo ? (
                <img src={businessProfile.logo} alt="Business Logo" className="business-logo" />
              ) : (
                <Title level={1}>{businessProfile?.businessName}</Title>
              )}
            </div>
            <div className="document-title">
              <Title>INVOICE</Title>
              <Text className="invoice-number">#{id.slice(0, 8).toUpperCase()}</Text>
            </div>
          </div>

          <div className="info-section">
            <div className="business-details">
              <Title level={5}>From</Title>
              <div className="info-content">
                <Text strong>{businessProfile?.businessName}</Text>
                <Text>{businessProfile?.businessAddress}</Text>
                <Text>Phone: {businessProfile?.businessPhone}</Text>
                <Text>Email: {businessProfile?.businessEmail}</Text>
                {businessProfile?.gstin && <Text>GSTIN: {businessProfile.gstin}</Text>}
              </div>
            </div>

            <div className="client-details">
              <Title level={5}>Bill To</Title>
              <div className="info-content">
                <Text strong>{invoice?.clientName}</Text>
                <Text>{invoice?.clientAddress}</Text>
                <Text>Phone: {invoice?.clientPhone}</Text>
                <Text>Email: {invoice?.clientEmail}</Text>
                {invoice?.gstin && <Text>GSTIN: {invoice?.gstin}</Text>}
              </div>
            </div>

            <div className="invoice-summary">
              <div className="summary-item">
                <Text type="secondary">Invoice Date</Text>
                <Text strong>{new Date(invoice?.invoiceDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}</Text>
              </div>
              <div className="summary-item">
                <Text type="secondary">Due Date</Text>
                <Text strong>{new Date(invoice?.dueDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}</Text>
              </div>
              <div className="summary-item">
                <Text type="secondary">Status</Text>
                <Tag color={
                  invoice?.status === 'paid' ? 'success' :
                  invoice?.status === 'pending' ? 'warning' : 'error'
                } className="status-tag">
                  {invoice?.status?.toUpperCase()}
                </Tag>
              </div>
            </div>
          </div>

          <Table
            className="invoice-items-table"
            dataSource={invoice?.items}
            pagination={false}
            columns={[
              {
                title: 'Item Description',
                dataIndex: 'description',
                key: 'description',
              },
              {
                title: 'Qty',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'right',
                width: 100,
              },
              {
                title: 'Rate',
                dataIndex: 'rate',
                key: 'rate',
                align: 'right',
                width: 150,
                render: rate => formatCurrency(rate),
              },
              {
                title: 'Amount',
                key: 'amount',
                align: 'right',
                width: 150,
                render: (_, record) => formatCurrency(record.quantity * record.rate),
              },
            ]}
            summary={() => <InvoiceSummary invoice={invoice} formatCurrency={formatCurrency} />}
          />

          {(invoice?.notes || businessProfile?.bankDetails) && (
            <div className="invoice-footer-section">
              {invoice?.notes && (
                <div className="notes-section">
                  <Title level={5}>Notes</Title>
                  <Text>{invoice.notes}</Text>
                </div>
              )}
              
              {businessProfile?.bankDetails && (
                <div className="payment-details">
                  <Title level={5}>Payment Details</Title>
                  <Text>{businessProfile.bankDetails}</Text>
                </div>
              )}
            </div>
          )}

          {invoice?.signature && (
            <div className="signature-section">
              <Title level={5}>Digital Signature</Title>
              <div className="signature-display">
                <img 
                  src={invoice.signature} 
                  alt="Digital Signature" 
                  style={{ 
                    maxWidth: '300px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    padding: '8px'
                  }} 
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ display: 'block' }}>
                    Signed on: {new Date(invoice.signedAt).toLocaleString()}
                  </Text>
                  {signatureValid !== null && (
                    <Tag 
                      icon={signatureValid ? 
                        <CheckCircleFilled /> : 
                        <WarningFilled />
                      }
                      color={signatureValid ? 'success' : 'error'}
                    >
                      Signature {signatureValid ? 'Valid' : 'Invalid'}
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="invoice-footer">
            <Text type="secondary">Thank you for your business!</Text>
          </div>
        </div>
      </Card>

      <style id="invoice-styles" type="text/css">
        {`
          .invoice-detail-card {
            max-width: 1000px;
            margin: 24px auto;
            background: white;
          }
          .invoice-container { padding: 40px; }
          /* ... copy other relevant styles from your CSS ... */
        `}
      </style>
    </motion.div>
  );
}

function InvoiceSummary({ invoice, formatCurrency }) {
  return (
    <Table.Summary>
      <Table.Summary.Row>
        <Table.Summary.Cell colSpan={3} align="right">Subtotal:</Table.Summary.Cell>
        <Table.Summary.Cell align="right">{formatCurrency(invoice?.subtotal || 0)}</Table.Summary.Cell>
      </Table.Summary.Row>

      {invoice?.discountAmount > 0 && (
        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={3} align="right">Discount:</Table.Summary.Cell>
          <Table.Summary.Cell align="right">-{formatCurrency(invoice?.discountAmount || 0)}</Table.Summary.Cell>
        </Table.Summary.Row>
      )}

      {invoice?.taxRegime === 'regular' ? (
        <>
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={3} align="right">CGST ({invoice?.cgst}%):</Table.Summary.Cell>
            <Table.Summary.Cell align="right">{formatCurrency(invoice?.cgstAmount || 0)}</Table.Summary.Cell>
          </Table.Summary.Row>
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={3} align="right">SGST ({invoice?.sgst}%):</Table.Summary.Cell>
            <Table.Summary.Cell align="right">{formatCurrency(invoice?.sgstAmount || 0)}</Table.Summary.Cell>
          </Table.Summary.Row>
        </>
      ) : (
        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={3} align="right">IGST ({invoice?.igst}%):</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{formatCurrency(invoice?.igstAmount || 0)}</Table.Summary.Cell>
        </Table.Summary.Row>
      )}

      <Table.Summary.Row className="total-row">
        <Table.Summary.Cell colSpan={3} align="right"><Text strong>Total:</Text></Table.Summary.Cell>
        <Table.Summary.Cell align="right">
          <Text strong>{formatCurrency(invoice?.total || 0)}</Text>
        </Table.Summary.Cell>
      </Table.Summary.Row>
    </Table.Summary>
  );
}

export default InvoiceDetail; 