import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header/Header';
import Navbar from '../components/common/Navbar/Navbar';
import Footer from '../components/common/Footer/Footer';
// import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      <Navbar />
      <main className="flex-1 w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;