import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './routes/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportIssue from './pages/ReportIssue';
import MyIssues from './pages/MyIssues';
import Marketplace from './pages/Marketplace';
import BusinessDetail from './pages/BusinessDetail';
import ServiceDetail from './pages/ServiceDetail';
import MyInquiries from './pages/MyInquiries';
import EntrepreneurDashboard from './pages/EntrepreneurDashboard';
import AuthorityIssues from './pages/AuthorityIssues';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfiles from './pages/AdminProfiles';
import AdminContent from './pages/AdminContent';
import AdminUsers from './pages/AdminUsers';
import Guidance from './pages/Guidance';
import NotFound from './pages/NotFound';

const App = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/businesses/:id" element={<BusinessDetail />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/guidance" element={<Guidance />} />

        <Route
          path="/report"
          element={
            <ProtectedRoute roles={['citizen', 'admin']}>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-issues"
          element={
            <ProtectedRoute roles={['citizen', 'admin']}>
              <MyIssues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-inquiries"
          element={
            <ProtectedRoute>
              <MyInquiries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entrepreneur"
          element={
            <ProtectedRoute roles={['entrepreneur', 'admin']}>
              <EntrepreneurDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/authority/issues"
          element={
            <ProtectedRoute roles={['authority', 'admin']}>
              <AuthorityIssues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profiles"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminProfiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/content"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
