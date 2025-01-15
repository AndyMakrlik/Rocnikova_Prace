import React from 'react'
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useEffect } from 'react';
import CheckAuth from '../functions/checkAuthUnLogged';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const navigate = useNavigate();

  useEffect(() => {
    CheckAuth(navigate);
  });
  return (
    <>
        <Navbar />
        <Footer />
    </>
  )
}
