import { lazy, Suspense } from 'react';
import { BrandedLayout } from '@/store-inventory/pages/auth/branded';
import SignInPage from '@/store-inventory/pages/auth/page';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PrivateRoute } from '@/components/PrivateRoute';
import { ScreenLoader } from '@/components/screen-loader';


const LazyCrmModule = lazy(() => import('@/crm'));
const LazyStoreInventoryModule = lazy(() => import('@/store-inventory'));

export function ModulesProvider() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <Routes>
      
      {/* 🔐 Login público dentro de store-inventory */}
      <Route path="/store-inventory/auth" element={<BrandedLayout />}>
        <Route path="/store-inventory/auth" element={<SignInPage />} />
      </Route>

      {/* Redirección desde la raíz */}
      <Route
        path="/"
        element={<Navigate to="/store-inventory/dashboard" replace />}
      />

      {/* Módulo Store Inventory */}
      <Route
        path="/store-inventory/*"
        element={
          <Suspense fallback={<ScreenLoader />}>
            <LazyStoreInventoryModule />
          </Suspense>
        }
      />
    </Routes>
  );
}