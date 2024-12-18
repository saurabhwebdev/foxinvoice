import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Form, Input, Button, 
  message, Divider, Space, Row, Col, Avatar 
} from 'antd';
import { 
  UserOutlined, 
  BankOutlined, 
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  NumberOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinessProfile } from '../../contexts/BusinessContext';
import Credits from './Credits';
import DashboardLayout from '../layouts/DashboardLayout';

const { Title } = Typography;

function Profile() {
  const [form] = Form.useForm();
  const { currentUser } = useAuth();
  const { businessProfile, updateBusinessProfile } = useBusinessProfile();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      form.setFieldsValue(businessProfile);
    }
  }, [businessProfile, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await updateBusinessProfile(values);
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Credits />
          </Col>

          <Col xs={24}>
            <Card title={<Title level={4}>Business Profile</Title>}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={businessProfile}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="businessName"
                      label="Business Name"
                      rules={[{ required: true, message: 'Please enter business name' }]}
                    >
                      <Input prefix={<HomeOutlined />} placeholder="Enter business name" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="gstin"
                      label="GSTIN"
                      rules={[{ required: true, message: 'Please enter GSTIN' }]}
                    >
                      <Input placeholder="Enter GSTIN" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="businessEmail"
                      label="Business Email"
                      rules={[
                        { required: true, message: 'Please enter business email' },
                        { type: 'email', message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Enter business email" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="businessPhone"
                      label="Business Phone"
                      rules={[{ required: true, message: 'Please enter business phone' }]}
                    >
                      <Input placeholder="Enter business phone" />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      name="businessAddress"
                      label="Business Address"
                      rules={[{ required: true, message: 'Please enter business address' }]}
                    >
                      <Input.TextArea rows={4} placeholder="Enter business address" />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Divider>Bank Details</Divider>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="bankName"
                      label="Bank Name"
                      rules={[{ required: true, message: 'Please enter bank name' }]}
                    >
                      <Input prefix={<BankOutlined />} placeholder="Enter bank name" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="accountNumber"
                      label="Account Number"
                      rules={[{ required: true, message: 'Please enter account number' }]}
                    >
                      <Input placeholder="Enter account number" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="ifscCode"
                      label="IFSC Code"
                      rules={[{ required: true, message: 'Please enter IFSC code' }]}
                    >
                      <Input placeholder="Enter IFSC code" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </DashboardLayout>
  );
}

export default Profile; 