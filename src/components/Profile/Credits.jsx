import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, message, Statistic, Space, Modal, Spin } from 'antd';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { CreditCardOutlined, DollarOutlined } from '@ant-design/icons';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const CREDITS_PER_PURCHASE = 100;
const COST_PER_PURCHASE = 3; // in USD

function Credits() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchCredits();
  }, [currentUser, navigate]);

  const fetchCredits = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setCredits(userDoc.data().credits || 0);
      } else {
        // Initialize user document if it doesn't exist
        await updateDoc(doc(db, "users", currentUser.uid), {
          credits: 5, // Initial free credits
          totalPurchasedCredits: 0,
          createdAt: new Date().toISOString()
        });
        setCredits(5);
      }
    } catch (error) {
      message.error("Failed to fetch credits");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = async (details) => {
    if (!currentUser) {
      message.error("Please login to purchase credits");
      return;
    }

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        credits: increment(CREDITS_PER_PURCHASE),
        totalPurchasedCredits: increment(CREDITS_PER_PURCHASE),
        lastPurchaseDate: new Date().toISOString(),
        payments: increment(1),
        lastPaymentId: details.id,
        lastPaymentAmount: details.purchase_units[0].amount.value
      });
      
      message.success(`Successfully purchased ${CREDITS_PER_PURCHASE} credits!`);
      fetchCredits();
      setShowPayment(false);
    } catch (error) {
      message.error("Failed to update credits");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text>Please login to manage credits</Text>
          <Button 
            type="primary" 
            onClick={() => navigate('/login')} 
            style={{ marginTop: '10px' }}
          >
            Login
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title={<Title level={4}>Credits Management</Title>}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Statistic
          title="Available Credits"
          value={credits}
          prefix={<CreditCardOutlined />}
          loading={loading}
        />

        <div style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: '16px', marginBottom: '16px', display: 'block' }}>
            Purchase {CREDITS_PER_PURCHASE} credits for ${COST_PER_PURCHASE}
          </Text>
          <Button 
            type="primary" 
            icon={<DollarOutlined />}
            onClick={() => setShowPayment(true)}
            disabled={loading}
            size="large"
          >
            Buy Credits
          </Button>
        </div>

        <Modal
          title="Purchase Credits"
          open={showPayment}
          onCancel={() => setShowPayment(false)}
          footer={null}
          width={400}
        >
          <div style={{ padding: '20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Title level={5}>Purchase Details</Title>
              <Text>
                {CREDITS_PER_PURCHASE} Credits for ${COST_PER_PURCHASE}
              </Text>
            </div>

            <PayPalButtons
              style={{
                layout: "vertical",
                shape: "rect",
                label: "pay"
              }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      description: `${CREDITS_PER_PURCHASE} Invoice Credits`,
                      amount: {
                        currency_code: "USD",
                        value: COST_PER_PURCHASE.toString(),
                        breakdown: {
                          item_total: {
                            currency_code: "USD",
                            value: COST_PER_PURCHASE.toString()
                          }
                        }
                      },
                      items: [
                        {
                          name: "Invoice Credits",
                          description: `${CREDITS_PER_PURCHASE} credits for invoice generation`,
                          unit_amount: {
                            currency_code: "USD",
                            value: COST_PER_PURCHASE.toString()
                          },
                          quantity: "1"
                        }
                      ]
                    }
                  ]
                });
              }}
              onApprove={async (data, actions) => {
                const details = await actions.order.capture();
                handlePurchaseSuccess(details);
              }}
              onError={(err) => {
                message.error("Payment failed. Please try again.");
                console.error(err);
              }}
            />
          </div>
        </Modal>
      </Space>
    </Card>
  );
}

export default Credits; 