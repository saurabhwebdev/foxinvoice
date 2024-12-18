import { Layout, Button, Typography, Space, Card, Row, Col, Input } from 'antd';
import { 
  FileTextOutlined, 
  DollarOutlined, 
  CloudServerOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  SecurityScanOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  MailOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { useState, useEffect } from 'react';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const menuItems = (
    <>
      <Button type="text" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
        Features
      </Button>
      <Button type="text" onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>
        Pricing
      </Button>
      <Button type="text" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
        Contact
      </Button>
      <Button 
        type="primary" 
        shape="round" 
        size="large" 
        className="nav-cta-button"
      >
        Get Started <ArrowRightOutlined />
      </Button>
    </>
  );

  return (
    <Layout className="layout">
      <Header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <motion.div
          className="logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FileTextOutlined /> Paytrail
        </motion.div>
        
        <motion.div
          className="nav-links"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {menuItems}
        </motion.div>

        <Button 
          className="mobile-menu-button"
          icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              {menuItems}
            </motion.div>
          )}
        </AnimatePresence>
      </Header>

      <Content role="main">
        <section 
          className="hero-section"
          aria-label="Hero section"
        >
          <div className="hero-background">
            <div className="gradient-sphere gradient-sphere-1"></div>
            <div className="gradient-sphere gradient-sphere-2"></div>
          </div>
          <motion.div
            className="hero-content"
            {...fadeInUp}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="hero-badge"
            >
              <RocketOutlined /> Smart Invoice Management
            </motion.div>
            <Title className="hero-title">
              Professional Invoicing
              <br />
              Made <span className="gradient-text">Simple</span>
            </Title>
            <Paragraph className="hero-subtitle">
              Create, manage, and track invoices effortlessly. Perfect for freelancers 
              and small business owners worldwide. Get paid faster with our powerful platform.
            </Paragraph>
            <Space size="large" className="hero-buttons">
              <Button 
                type="primary" 
                size="large" 
                icon={<RocketOutlined />}
                shape="round"
                className="primary-button"
              >
                Start Free Trial
              </Button>
              <Button 
                size="large"
                shape="round"
                className="secondary-button"
                icon={<PlayCircleOutlined />}
              >
                Watch Demo
              </Button>
            </Space>
            <motion.div 
              className="hero-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="stat-item">
                <h3>1000+</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <h3>50K+</h3>
                <p>Invoices Generated</p>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <h3>₹10Cr+</h3>
                <p>Revenue Processed</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section 
          id="features" 
          className="features-section"
          aria-label="Features section"
        >
          <Row justify="center">
            <Col xs={24} md={18}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="features-header"
              >
                <Title level={2} className="section-title">
                  Everything you need to <span className="gradient-text">grow your business</span>
                </Title>
                <Paragraph className="section-subtitle">
                  Powerful features designed to help freelancers and small businesses thrive
                </Paragraph>
              </motion.div>
            </Col>
          </Row>
          <Row gutter={[40, 40]} className="features-grid">
            {[
              {
                icon: <FileTextOutlined />,
                title: "Professional Templates",
                description: "Create beautiful, customizable invoices that reflect your brand identity and professionalism"
              },
              {
                icon: <SecurityScanOutlined />,
                title: "Secure Platform",
                description: "Enterprise-grade security with encrypted data storage and secure payment processing"
              },
              {
                icon: <ThunderboltOutlined />,
                title: "Fast Processing",
                description: "Generate and send invoices in seconds, with automated reminders to get paid faster"
              },
              {
                icon: <GlobalOutlined />,
                title: "Work Globally",
                description: "Multi-currency support and international payment options for worldwide business"
              }
            ].map((feature, index) => (
              <Col xs={24} sm={12} key={index}>
                <motion.div
                  whileHover={{ y: -8 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="feature-card-wrapper"
                >
                  <div className="feature-card">
                    <div className="feature-content">
                      <div className="feature-icon-wrapper">
                        {feature.icon}
                      </div>
                      <div className="feature-text">
                        <Title level={4}>{feature.title}</Title>
                        <Text>{feature.description}</Text>
                      </div>
                    </div>
                    <div className="feature-arrow">
                      <ArrowRightOutlined />
                    </div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </section>

        <section 
          id="pricing" 
          className="pricing-section"
          aria-label="Pricing section"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <Title level={2} className="section-title">
              Simple & Transparent <span className="gradient-text">Pricing</span>
            </Title>
            <Paragraph className="section-subtitle">
              Start with our pay-as-you-go plan designed for growing businesses
            </Paragraph>
          </motion.div>

          <Row justify="center" gutter={[32, 32]}>
            <Col xs={24} md={12} lg={8}>
              <motion.div
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pricing-card-wrapper"
              >
                <div className="pricing-card">
                  <div className="pricing-header">
                    <CreditCardOutlined className="pricing-icon" />
                    <Title level={3}>Pay As You Go</Title>
                  </div>
                  <div className="pricing-amount">
                    <span className="currency">$</span>
                    <span className="amount">3</span>
                    <span className="period">/100 credits</span>
                  </div>
                  <ul className="pricing-features">
                    <li><CheckCircleOutlined /> 1 credit per invoice</li>
                    <li><CheckCircleOutlined /> Professional templates</li>
                    <li><CheckCircleOutlined /> Secure cloud storage</li>
                    <li><CheckCircleOutlined /> Email support</li>
                  </ul>
                  <Button type="primary" size="large" className="pricing-cta">
                    Get Started <ArrowRightOutlined />
                  </Button>
                </div>
              </motion.div>
            </Col>
          </Row>
        </section>

        <section 
          id="contact" 
          className="contact-section"
          aria-label="Contact section"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <Title level={2} className="section-title">
              Ready to <span className="gradient-text">Get Started?</span>
            </Title>
            <Paragraph className="section-subtitle">
              Connect with our team to learn how InvoiceHub can help your business grow
            </Paragraph>
          </motion.div>

          <Row justify="center">
            <Col xs={24} md={16} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="contact-form-wrapper"
              >
                <form 
                  className="contact-form"
                  aria-label="Contact form"
                  role="form"
                >
                  <Input 
                    size="large" 
                    placeholder="Your Name" 
                    prefix={<UserOutlined />}
                    aria-label="Your name"
                    required
                  />
                  <Input 
                    size="large" 
                    placeholder="Your Email" 
                    prefix={<MailOutlined />}
                    type="email"
                    aria-label="Your email"
                    required
                  />
                  <Input.TextArea 
                    size="large" 
                    placeholder="Your Message"
                    rows={4}
                    aria-label="Your message"
                    required
                  />
                  <Button 
                    type="primary" 
                    size="large" 
                    className="contact-submit"
                    aria-label="Send message"
                  >
                    Send Message <ArrowRightOutlined />
                  </Button>
                </form>
              </motion.div>
            </Col>
          </Row>
        </section>
      </Content>

      <Footer className="footer">
        <div className="footer-wrapper">
          <div className="footer-content">
            <div className="footer-brand">
              <FileTextOutlined className="footer-logo" />
              <span className="brand-name">Paytrail</span>
            </div>
            
            <div className="footer-links">
              <Button type="link" href="/privacy">Privacy</Button>
              <span className="footer-dot">•</span>
              <Button type="link" href="/terms">Terms</Button>
              <span className="footer-dot">•</span>
              <Button type="link" href="/contact">Contact</Button>
            </div>

            <Text className="copyright">
              © {new Date().getFullYear()} Paytrail
            </Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}

export default App;
