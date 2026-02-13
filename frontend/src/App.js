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
import CheckOut from './pages/Checkout/CheckOut';
import Register from './pages/Register/Register';
import Orders from './pages/Order/Orders';
import AdminDashboard from './pages/admin/Dashboard/Dashboard';
import AdminOrders from './pages/admin/Orders/Orders';
import AdminProducts from './pages/admin/Products/Products.jsx' ;
import AdminUsers from './pages/admin/Users/Profile.jsx';
import UserProfile from './pages/User/Profile.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';


function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/order" element={<Orders />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/profile" element={<UserProfile />} />
         <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;