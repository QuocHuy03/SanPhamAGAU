import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage'; // FIXED
import Cart from './pages/Cart/Cart';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import CheckOut from './pages/Checkout/CheckOut';
import Orders from './pages/Order/Orders';
import AdminDashboard from './pages/admin/Dashboard/Dashboard';
import AdminOrders from './pages/admin/Orders/Orders';
import AdminProducts from './pages/admin/Products/Products.jsx';
import AdminProductEdit from './pages/admin/Products/ProductEdit.jsx';
import AdminUsers from './pages/admin/Users/Users.jsx';
import AdminCategories from './pages/admin/Categories/Categories.jsx';
import AdminSettings from './pages/admin/Settings/Settings.jsx';
import UserProfile from './pages/User/Profile.jsx';
import Contact from './pages/Contact/Contact.jsx';
import About from './pages/About/About.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx';


// Redundant inline MainLayout removed, now using src/layouts/MainLayout.jsx

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Shop Routes with Header/Footer */}
        <Route path="/" element={
          <MainLayout>
            <Home />
          </MainLayout>
        } />
        <Route path="/shop" element={
          <MainLayout>
            <Shop />
          </MainLayout>
        } />
        <Route path="/product/:id" element={
          <MainLayout>
            <ProductDetailPage />
          </MainLayout>
        } />
        <Route path="/cart" element={
          <MainLayout>
            <Cart />
          </MainLayout>
        } />
        <Route path="/login" element={
          <MainLayout>
            <Login />
          </MainLayout>
        } />
        <Route path="/register" element={
          <MainLayout>
            <Register />
          </MainLayout>
        } />
        <Route path="/forgot-password" element={
          <MainLayout>
            <ForgotPassword />
          </MainLayout>
        } />
        <Route path="/reset-password" element={
          <MainLayout>
            <ResetPassword />
          </MainLayout>
        } />
        <Route path="/checkout" element={
          <MainLayout>
            <CheckOut />
          </MainLayout>
        } />
        <Route path="/order" element={
          <MainLayout>
            <Orders />
          </MainLayout>
        } />
        <Route path="/profile" element={
          <MainLayout>
            <UserProfile />
          </MainLayout>
        } />
        <Route path="/contact" element={
          <MainLayout>
            <Contact />
          </MainLayout>
        } />
        <Route path="/about" element={
          <MainLayout>
            <About />
          </MainLayout>
        } />

        {/* Admin Routes - No Header/Footer */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AdminProductEdit />} />
          <Route path="products/edit/:id" element={<AdminProductEdit />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;