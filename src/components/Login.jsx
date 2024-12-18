import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function Login() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      navigate('/');
    } catch (error) {
      console.error(error.message);
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
        marginBottom: 32,
        fontWeight: 600,
        color: '#1a1a1a'
      }}>
        Login
      </Title>
      
      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input 
            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Email"
            style={{ borderRadius: '8px', height: '45px' }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Password"
            style={{ borderRadius: '8px', height: '45px' }}
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
              fontSize: '16px'
            }}
          >
            Login
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          <Link to="/forgot-password">
            <Button 
              type="link" 
              style={{ 
                padding: 0, 
                height: 'auto', 
                color: '#0090C1'
              }}
            >
              Forgot Password?
            </Button>
          </Link>
          <div style={{ marginTop: 16 }}>
            <Text style={{ color: '#595959' }}>
              Don't have an account? <Link to="/signup" style={{ color: '#0090C1' }}>Sign Up</Link>
            </Text>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default Login; 