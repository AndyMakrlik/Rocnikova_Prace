import React from 'react'
import { useEffect } from 'react';
import CheckAuth from '../functions/checkAuthUnLogged';
import { useNavigate } from 'react-router-dom';

export default function Add() {
  const navigate = useNavigate();

  useEffect(() => {
    CheckAuth(navigate);
  });

  return (
    <>
      <div className='container text-center'>
        <h2>Vložení Inzerátu</h2>
        <div className='row'>

        </div>
      </div>
    </>
  )
}
