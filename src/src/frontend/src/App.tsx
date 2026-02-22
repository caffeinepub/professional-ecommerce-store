import React from 'react';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SuccessPage } from './pages/SuccessPage';
import { CancelPage } from './pages/CancelPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
});

// Route definitions
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$id',
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/success',
  component: SuccessPage,
});

const cancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cancel',
  component: CancelPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  productDetailRoute,
  cartRoute,
  checkoutRoute,
  successRoute,
  cancelRoute,
  adminRoute,
  profileRoute,
]);

// Create router
const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster />
      </CartProvider>
    </ThemeProvider>
  );
}
