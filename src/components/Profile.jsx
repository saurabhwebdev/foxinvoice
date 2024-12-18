import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  message, 
  Card, 
  Typography,
  Divider,
  Avatar
} from 'antd';
import { 
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  HomeOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const { Title, Text } = Typography;
const { Option } = Select;

// Currency options
const currencies = [
  { value: 'INR', label: '₹ INR - Indian Rupee' },
  { value: 'USD', label: '$ USD - US Dollar' },
  { value: 'EUR', label: '€ EUR - Euro' },
  { value: 'GBP', label: '£ GBP - British Pound' },
  { value: 'AUD', label: 'A$ AUD - Australian Dollar' },
  { value: 'CAD', label: 'C$ CAD - Canadian Dollar' },
];

// Country codes for phone
const countryCodes = [
  { value: '+91', label: '🇮🇳 +91 (India)' },
  { value: '+1', label: '🇺🇸 +1 (USA/Canada)' },
  { value: '+44', label: '🇬🇧 +44 (UK)' },
  { value: '+61', label: '����🇺 +61 (Australia)' },
  // Add more as needed
];

function Profile() {
  const [form] = Form.useForm();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [businessInitials, setBusinessInitials] = useState('');

  // Get initials from business name
  const getInitials = (businessName) => {
    if (!businessName) return '';
    return businessName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'businessProfiles', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          form.setFieldsValue({
            businessName: data.businessName,
            businessAddress: data.businessAddress,
            phoneCountryCode: data.phoneCountryCode,
            businessPhone: data.businessPhone,
            businessEmail: data.businessEmail || currentUser.email,
            businessWebsite: data.businessWebsite,
            taxNumber: data.taxNumber,
            defaultCurrency: data.defaultCurrency || 'INR'
          });
          setBusinessInitials(getInitials(data.businessName));
        } else {
          form.setFieldValue('businessEmail', currentUser.email);
          form.setFieldValue('defaultCurrency', 'INR');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        message.error('Failed to load profile');
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const businessData = {
        businessName: values.businessName,
        businessAddress: values.businessAddress,
        phoneCountryCode: values.phoneCountryCode,
        businessPhone: values.businessPhone,
        businessEmail: values.businessEmail,
        businessWebsite: values.businessWebsite,
        taxNumber: values.taxNumber,
        defaultCurrency: values.defaultCurrency,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'businessProfiles', currentUser.uid), businessData);
      setBusinessInitials(getInitials(values.businessName));
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <Title level={2}>Business Profile Settings</Title>
        <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
          Manage your business information and preferences
        </Text>
        
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Avatar 
            size={100} 
            style={{ 
              backgroundColor: '#0090C1',
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}
          >
            {businessInitials || '?'}
          </Avatar>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            defaultCurrency: 'INR',
            phoneCountryCode: '+91'
          }}
        >
          <Form.Item
            name="businessName"
            label="Business Name"
            rules={[{ required: true, message: 'Please enter your business name' }]}
          >
            <Input 
              prefix={<BankOutlined />} 
              placeholder="Enter your business name"
            />
          </Form.Item>

          <Form.Item
            name="businessAddress"
            label="Business Address"
            rules={[{ required: true, message: 'Please enter your business address' }]}
          >
            <Input.TextArea 
              prefix={<HomeOutlined />}
              placeholder="Enter your complete business address"
              rows={3}
            />
          </Form.Item>

          <Form.Item label="Business Phone">
            <Input.Group compact>
              <Form.Item
                name="phoneCountryCode"
                noStyle
              >
                <Select style={{ width: '30%' }}>
                  {countryCodes.map(code => (
                    <Option key={code.value} value={code.value}>{code.label}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="businessPhone"
                noStyle
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input 
                  style={{ width: '70%' }}
                  prefix={<PhoneOutlined />}
                  placeholder="Phone number"
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="businessEmail"
            label="Business Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />}
              placeholder="Enter your business email"
            />
          </Form.Item>

          <Form.Item
            name="businessWebsite"
            label="Business Website"
            rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
          >
            <Input 
              prefix={<GlobalOutlined />}
              placeholder="https://www.example.com"
            />
          </Form.Item>

          <Form.Item
            name="taxNumber"
            label="Tax/GST Number"
          >
            <Input 
              placeholder="Enter your tax/GST number"
            />
          </Form.Item>

          <Form.Item
            name="defaultCurrency"
            label="Default Currency"
            rules={[{ required: true, message: 'Please select your default currency' }]}
          >
            <Select>
              {currencies.map(currency => (
                <Option key={currency.value} value={currency.value}>
                  {currency.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </motion.div>
  );
}

export default Profile; 