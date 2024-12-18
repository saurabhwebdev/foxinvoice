import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

function EmailVerification() {
  const { currentUser, resendVerificationEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is verified and redirect to dashboard
  useEffect(() => {
    if (currentUser?.emailVerified) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // If no user, redirect to login
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      await resendVerificationEmail();
      message.success('Verification email sent!');
    } catch (error) {
      message.error(error.message);
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
      <div style={{ 
        maxWidth: 400, 
        margin: '40px auto', 
        padding: '32px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(2, 47, 64, 0.08)'
      }}>
        <MailOutlined style={{ 
          fontSize: 48, 
          color: '#0090C1', 
          display: 'block', 
          textAlign: 'center' 
        }} />
        <Title level={3} style={{ 
          textAlign: 'center', 
          marginTop: 24,
          color: '#022F40'
        }}>
          Verify your email
        </Title>
        <Text style={{ 
          display: 'block', 
          textAlign: 'center', 
          marginBottom: 24,
          color: '#595959'
        }}>
          We've sent a verification email to:
          <br />
          <strong>{currentUser.email}</strong>
        </Text>
        <Button
          type="primary"
          block
          onClick={handleResendEmail}
          loading={loading}
          style={{ 
            marginBottom: 16,
            height: '45px',
            borderRadius: '8px',
            fontWeight: 500,
            fontSize: '16px'
          }}
        >
          Resend Verification Email
        </Button>
        <Button 
          type="link" 
          block 
          onClick={() => navigate('/login')}
          style={{ 
            color: '#0090C1'
          }}
        >
          Back to Login
        </Button>
      </div>
    </motion.div>
  );
}

export default EmailVerification; 