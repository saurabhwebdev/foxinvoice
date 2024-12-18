import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';
import { ConfigProvider } from 'antd';
import { theme } from './theme/theme';
import Login from './components/Login';
import Signup from './components/Signup';
import EmailVerification from './components/EmailVerification';
import ForgotPassword from './components/ForgotPassword';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Profile from './components/Profile/Profile';
import CreateInvoice from './components/Invoice/CreateInvoice';
import InvoiceList from './components/Invoice/InvoiceList';
import ClientList from './components/Clients/ClientList';
import ClientDetail from './components/Clients/ClientDetail';
import Reports from './components/Reports/Reports';
import InvoiceDetail from './components/Invoice/InvoiceDetail';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function App() {
  return (
    <PayPalScriptProvider options={{ 
      "client-id": "AStgVrAtLFSZ7RG6tjVUaYGOcaBYAKBlakz0c-CNZzmPx8iDB1mXRL_xf5LWVbLy6HqOGtub21IDguv5",
      currency: "USD"
    }}>
      <ConfigProvider theme={theme}>
        <Router>
          <AuthProvider>
            <BusinessProvider>
              <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/" element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </PrivateRoute>
                } />
                <Route path="/profile" element={<Profile />} />
                <Route path="/invoices" element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <InvoiceList />
                    </DashboardLayout>
                  </PrivateRoute>
                } />
                <Route path="/invoices/create" element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <CreateInvoice />
                    </DashboardLayout>
                  </PrivateRoute>
                } />
                <Route path="/clients" element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <ClientList />
                    </DashboardLayout>
                  </PrivateRoute>
                } />
                <Route path="/clients/:id" element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <ClientDetail />
                    </DashboardLayout>
                  </PrivateRoute>
                } />
                <Route path="/reports" element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Reports />
                    </DashboardLayout>
                  </PrivateRoute>
                } />
                <Route path="/invoices/:id" element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <InvoiceDetail />
                    </DashboardLayout>
                  </PrivateRoute>
                } />
              </Routes>
            </BusinessProvider>
          </AuthProvider>
        </Router>
      </ConfigProvider>
    </PayPalScriptProvider>
  );
}

export default App;
