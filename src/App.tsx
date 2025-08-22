import React from 'react';
// import { useEffect } from 'react'; // Temporairement désactivé
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { Navigate } from 'react-router-dom'; // Temporairement désactivé
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
// import { useAuthStore } from './store/auth'; // Temporairement désactivé
import { useRealtimeNotifications } from './hooks/useRealtimeNotifications';

// Layout
import Layout from './components/layout/Layout';

// Pages
// import Login from './pages/Login'; // Temporairement désactivé
import Dashboard from './pages/Dashboard';
import BookingsV2 from './pages/BookingsV2';
import BookingDetail from './pages/BookingDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Commissions from './pages/Commissions';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Payments from './pages/Payments';
import Settings from './pages/Settings';


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // const { user, isLoading, checkAuth } = useAuthStore(); // Temporairement désactivé
  useRealtimeNotifications(); // Activer les notifications temps réel

  /* Authentification temporairement désactivée
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  */

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <Routes>
          {/* Login route désactivée temporairement */}
          {/* <Route path="/login" element={<Login />} /> */}

          {/* Routes (sans protection temporairement) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<BookingsV2 />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:email" element={<CustomerDetail />} />
            <Route path="commissions" element={<Commissions />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;