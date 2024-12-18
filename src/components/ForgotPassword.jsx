import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await resetPassword(values.email);
      message.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      message.error('Failed to send reset email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '40px auto', 
      padding: '32px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(2, 47, 64, 0.08)'
    }}>
      <Title level={2} style={{ 
        marginBottom: 16,
        fontWeight: 600,
        color: '#022F40'
      }}>
        Reset Password
      </Title>
      <Text style={{ 
        display: 'block', 
        marginBottom: 32,
        color: '#595959'
      }}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>

      <Form
        name="forgot-password"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input 
            prefix={<MailOutlined />}
            placeholder="Email"
            size="large"
            style={{ 
              borderRadius: '8px',
              height: '45px'
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block
            loading={loading}
            style={{ 
              height: '45px', 
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '16px',
              marginBottom: '16px'
            }}
          >
            Send Reset Link
          </Button>
          <Link to="/login">
            <Button 
              type="link" 
              block
              style={{ 
                color: '#0090C1'
              }}
            >
              Back to Login
            </Button>
          </Link>
        </Form.Item>
      </Form>
    </div>
  );
}

export default ForgotPassword; 