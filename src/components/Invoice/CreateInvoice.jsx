import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, Typography, DatePicker, 
  Space, InputNumber, Select, Table, message, Divider 
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, 
  SaveOutlined, PrinterOutlined,
  UserAddOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection, query, where, getDocs, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinessProfile } from '../../contexts/BusinessContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const taxFields = [
  { name: 'gstin', label: 'GSTIN', required: true },
  { name: 'cgst', label: 'CGST %', type: 'number' },
  { name: 'sgst', label: 'SGST %', type: 'number' },
  { name: 'igst', label: 'IGST %', type: 'number' },
];

function CreateInvoice() {
  const [form] = Form.useForm();
  const { currentUser } = useAuth();
  const { businessProfile } = useBusinessProfile();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [existingClients, setExistingClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [gstType, setGstType] = useState('regular');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Add this useEffect to fetch existing clients
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
      
      setExistingClients(clientList);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Add this handler for client selection
  const handleClientSelect = (clientId) => {
    const client = existingClients.find(c => c.id === clientId);
    if (client) {
      form.setFieldsValue({
        clientName: client.clientName,
        clientEmail: client.clientEmail,
        clientPhone: client.clientPhone,
        clientAddress: client.clientAddress
      });
      setSelectedClient(client);
    }
  };

  // Set business details when profile is loaded
  useEffect(() => {
    if (businessProfile) {
      form.setFieldsValue({
        businessName: businessProfile.businessName,
        businessAddress: businessProfile.businessAddress,
        businessPhone: businessProfile.businessPhone,
        businessEmail: businessProfile.businessEmail,
        currency: businessProfile.defaultCurrency || 'INR',
        gstin: businessProfile.taxNumber,
      });
    }
  }, [businessProfile, form]);

  // Add this useEffect to calculate taxes
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    setTaxableAmount(subtotal);

    const formValues = form.getFieldsValue();
    const discountType = formValues.discountType;
    const discountValue = formValues.discountValue || 0;

    // Calculate discount
    let calculatedDiscount = 0;
    if (discountType === 'percentage') {
      calculatedDiscount = subtotal * (discountValue / 100);
    } else {
      calculatedDiscount = discountValue;
    }
    setDiscountAmount(calculatedDiscount);

    // Calculate tax after discount
    const afterDiscount = subtotal - calculatedDiscount;
    let calculatedTax = 0;

    if (gstType === 'regular') {
      const cgst = (formValues.cgst || 0) / 100;
      const sgst = (formValues.sgst || 0) / 100;
      calculatedTax = afterDiscount * (cgst + sgst);
    } else {
      const igst = (formValues.igst || 0) / 100;
      calculatedTax = afterDiscount * igst;
    }

    setTotalTax(calculatedTax);
  }, [items, gstType, form]);

  // Add this function to handle item changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
          placeholder="Item description"
        />
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (text, record, index) => (
        <InputNumber
          min={1}
          value={text}
          onChange={(value) => handleItemChange(index, 'quantity', value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 150,
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handleItemChange(index, 'rate', value)}
          formatter={value => `${form.getFieldValue('currency')} ${value}`}
          parser={value => value.replace(`${form.getFieldValue('currency')} `, '')}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (_, record) => (
        <Text>
          {form.getFieldValue('currency')} {(record.quantity * record.rate || 0).toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
          }}
        />
      )
    }
  ];

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        rate: 0,
      }
    ]);
  };

  // Add this to handle tax regime change
  const handleTaxRegimeChange = (value) => {
    setGstType(value);
    // Reset tax values when regime changes
    form.setFieldsValue({
      cgst: value === 'regular' ? 9 : 0,
      sgst: value === 'regular' ? 9 : 0,
      igst: value === 'regular' ? 0 : 18,
    });
  };

  const handleSubmit = async (values) => {
    try {
      // Check credits
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const credits = userDoc.data().credits || 0;
      
      if (credits < 1) {
        message.error("Insufficient credits. Please purchase more credits to create invoices.");
        return;
      }

      // Deduct credit
      await updateDoc(doc(db, "users", currentUser.uid), {
        credits: increment(-1)
      });

      // Clean and validate the data before submission
      const cleanedItems = items.map(item => ({
        description: item.description || '',
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
        amount: (Number(item.quantity) || 0) * (Number(item.rate) || 0)
      }));

      // Prepare invoice data with default values for optional fields
      const invoiceData = {
        // Required fields
        userId: currentUser.uid,
        clientName: values.clientName,
        invoiceDate: values.invoiceDate?.toDate().toISOString(),
        dueDate: values.dueDate?.toDate().toISOString(),
        currency: values.currency || 'INR',
        items: cleanedItems,
        status: 'pending',
        createdAt: new Date().toISOString(),
        
        // Optional fields with default values
        clientEmail: values.clientEmail || '',
        clientPhone: values.clientPhone || '',
        clientAddress: values.clientAddress || '',
        notes: values.notes || '',
        taxRegime: values.taxRegime || 'regular',
        
        // Tax and discount fields
        subtotal: taxableAmount || 0,
        discountType: values.discountType || 'fixed',
        discountValue: Number(values.discountValue) || 0,
        discountAmount: discountAmount || 0,
        
        // Tax amounts
        cgst: Number(values.cgst) || 0,
        sgst: Number(values.sgst) || 0,
        igst: Number(values.igst) || 0,
        cgstAmount: gstType === 'regular' ? ((taxableAmount - discountAmount) * (Number(values.cgst) || 0) / 100) : 0,
        sgstAmount: gstType === 'regular' ? ((taxableAmount - discountAmount) * (Number(values.sgst) || 0) / 100) : 0,
        igstAmount: gstType !== 'regular' ? ((taxableAmount - discountAmount) * (Number(values.igst) || 0) / 100) : 0,
        
        // Final amounts
        netAmount: (taxableAmount - discountAmount) || 0,
        totalTax: totalTax || 0,
        total: (taxableAmount - discountAmount + totalTax) || 0,
        
        // Business details
        gstin: businessProfile?.gstin || ''
      };

      // Remove any undefined values
      Object.keys(invoiceData).forEach(key => {
        if (invoiceData[key] === undefined) {
          delete invoiceData[key];
        }
      });

      const newInvoiceRef = doc(collection(db, 'invoices'));
      await setDoc(newInvoiceRef, invoiceData);
      
      message.success('Invoice created successfully');
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      message.error('Failed to create invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClient = async () => {
    try {
      const clientData = form.getFieldsValue([
        'clientName',
        'clientEmail',
        'clientPhone',
        'clientAddress'
      ]);

      if (!clientData.clientName) {
        message.error('Client name is required');
        return;
      }

      const clientRef = doc(collection(db, 'clients'));
      await setDoc(clientRef, {
        ...clientData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      });

      message.success('Client saved successfully');
    } catch (error) {
      console.error('Error saving client:', error);
      message.error('Failed to save client');
    }
  };

  const initialValues = {
    items: [{ description: '', quantity: 1, rate: 0 }],
    currency: 'INR',
    taxRegime: 'regular',
    discountValue: 0
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <Title level={2}>Create New Invoice</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialValues}
        >
          {/* Client Information */}
          <Card title="Client Information" style={{ marginBottom: 24 }}>
            <Form.Item
              name="existingClient"
              label="Select Existing Client"
            >
              <Select
                allowClear
                showSearch
                placeholder="Select an existing client"
                onChange={handleClientSelect}
                optionFilterProp="children"
                style={{ marginBottom: 16 }}
              >
                {existingClients.map(client => (
                  <Select.Option key={client.id} value={client.id}>
                    {client.clientName} {client.clientEmail && `(${client.clientEmail})`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Divider>Or Enter New Client Details</Divider>

            {/* Existing client form fields */}
            <Form.Item
              name="clientName"
              label="Client Name"
              rules={[{ required: true, message: 'Please enter client name' }]}
            >
              <Input placeholder="Enter client name" />
            </Form.Item>
            
            <Form.Item
              name="clientAddress"
              label="Client Address"
              rules={[{ required: true, message: 'Please enter client address' }]}
            >
              <TextArea rows={3} placeholder="Enter client address" />
            </Form.Item>

            <Space style={{ width: '100%' }} direction="horizontal">
              <Form.Item
                name="clientEmail"
                label="Client Email"
                rules={[
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter client email" />
              </Form.Item>

              <Form.Item
                name="clientPhone"
                label="Client Phone"
              >
                <Input placeholder="Enter client phone" />
              </Form.Item>
            </Space>

            <Button 
              type="dashed"
              icon={<UserAddOutlined />}
              onClick={handleSaveClient}
            >
              Save as Client
            </Button>
          </Card>

          {/* Invoice Details */}
          <Card title="Invoice Details" style={{ marginBottom: 24 }}>
            <Space style={{ width: '100%' }} direction="vertical">
              <Space style={{ width: '100%' }} direction="horizontal">
                <Form.Item
                  name="invoiceDate"
                  label="Invoice Date"
                  rules={[{ required: true, message: 'Please select invoice date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="dueDate"
                  label="Due Date"
                  rules={[{ required: true, message: 'Please select due date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="currency"
                  label="Currency"
                  rules={[{ required: true, message: 'Please select currency' }]}
                >
                  <Select style={{ width: 120 }}>
                    <Select.Option value="INR">₹ INR</Select.Option>
                    <Select.Option value="USD">$ USD</Select.Option>
                    <Select.Option value="EUR">€ EUR</Select.Option>
                  </Select>
                </Form.Item>
              </Space>

              {/* Tax Fields */}
              <Card title="Tax Details" style={{ marginBottom: 24 }}>
                <Space style={{ width: '100%' }} direction="vertical">
                  <Form.Item
                    name="gstin"
                    label="GSTIN"
                    initialValue={businessProfile?.gstin}
                  >
                    <Input 
                      disabled 
                      placeholder={businessProfile?.gstin || 'Set GSTIN in Profile'} 
                    />
                  </Form.Item>

                  <Form.Item
                    name="taxRegime"
                    label="Tax Regime"
                    initialValue="regular"
                    rules={[{ required: true, message: 'Please select tax regime' }]}
                  >
                    <Select onChange={handleTaxRegimeChange}>
                      <Select.Option value="regular">Regular (CGST + SGST)</Select.Option>
                      <Select.Option value="igst">IGST</Select.Option>
                    </Select>
                  </Form.Item>

                  {form.getFieldValue('taxRegime') === 'regular' ? (
                    <>
                      <Form.Item
                        name="cgst"
                        label="CGST %"
                        initialValue={9}
                        rules={[{ required: true, message: 'Please enter CGST rate' }]}
                      >
                        <InputNumber min={0} max={100} />
                      </Form.Item>
                      <Form.Item
                        name="sgst"
                        label="SGST %"
                        initialValue={9}
                        rules={[{ required: true, message: 'Please enter SGST rate' }]}
                      >
                        <InputNumber min={0} max={100} />
                      </Form.Item>
                    </>
                  ) : (
                    <Form.Item
                      name="igst"
                      label="IGST %"
                      initialValue={18}
                      rules={[{ required: true, message: 'Please enter IGST rate' }]}
                    >
                      <InputNumber min={0} max={100} />
                    </Form.Item>
                  )}
                </Space>
              </Card>

              {/* Discount Details */}
              <Card title="Discount" style={{ marginBottom: 24 }}>
                <Space direction="horizontal" style={{ width: '100%' }}>
                  <Form.Item
                    name="discountType"
                    label="Discount Type"
                  >
                    <Select style={{ width: 200 }}>
                      <Select.Option value="percentage">Percentage (%)</Select.Option>
                      <Select.Option value="fixed">Fixed Amount</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="discountValue"
                    label="Discount Value"
                  >
                    <InputNumber
                      min={0}
                      max={form.getFieldValue('discountType') === 'percentage' ? 100 : undefined}
                      formatter={value => form.getFieldValue('discountType') === 'percentage' ? `${value}%` : value}
                      parser={value => value.replace('%', '')}
                      style={{ width: 200 }}
                    />
                  </Form.Item>
                </Space>
              </Card>

              {/* Invoice Items */}
              <Card 
                title="Invoice Items" 
                style={{ marginBottom: 24 }}
                extra={
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddItem}
                  >
                    Add Item
                  </Button>
                }
              >
                <Table 
                  columns={columns} 
                  dataSource={items}
                  pagination={false}
                />
                
                <div style={{ 
                  marginTop: 16, 
                  textAlign: 'right',
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: 16
                }}>
                  <Space direction="vertical" align="end">
                    <Text>Subtotal: {form.getFieldValue('currency')} {taxableAmount.toFixed(2)}</Text>
                    <Text>
                      Discount ({form.getFieldValue('discountType') === 'percentage' ? 
                        `${form.getFieldValue('discountValue') || 0}%` : 
                        'Fixed'}): {form.getFieldValue('currency')} {discountAmount.toFixed(2)}
                    </Text>
                    <Text>Net Amount: {form.getFieldValue('currency')} {(taxableAmount - discountAmount).toFixed(2)}</Text>
                    {gstType === 'regular' ? (
                      <>
                        <Text>CGST: {form.getFieldValue('currency')} {((taxableAmount - discountAmount) * (form.getFieldValue('cgst') || 0) / 100).toFixed(2)}</Text>
                        <Text>SGST: {form.getFieldValue('currency')} {((taxableAmount - discountAmount) * (form.getFieldValue('sgst') || 0) / 100).toFixed(2)}</Text>
                      </>
                    ) : (
                      <Text>IGST: {form.getFieldValue('currency')} {((taxableAmount - discountAmount) * (form.getFieldValue('igst') || 0) / 100).toFixed(2)}</Text>
                    )}
                    <Text strong>
                      Total: {form.getFieldValue('currency')} {(taxableAmount - discountAmount + totalTax).toFixed(2)}
                    </Text>
                  </Space>
                </div>
              </Card>

              {/* Notes */}
              <Card title="Additional Notes" style={{ marginBottom: 24 }}>
                <Form.Item name="notes">
                  <TextArea 
                    rows={4} 
                    placeholder="Enter any additional notes or terms of service"
                  />
                </Form.Item>
              </Card>

              {/* Submit Buttons */}
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Save Invoice
                </Button>
                <Button 
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                >
                  Print Preview
                </Button>
              </Space>
            </Space>
          </Card>
        </Form>
      </Card>
    </motion.div>
  );
}

export default CreateInvoice; 