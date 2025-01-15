import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

function ResetPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      toast.error('Prosím vyplňtě email.');
    } else if (!emailRegex.test(email)) {
      toast.error('Zadejte prosím email ve správném formátu. (example@gmail.com)')
    } else {
      axios.post('http://localhost:3001/resetPassword', {email})
      .then(res => {
        if (res.data.Status === 'Success'){
          toast.success("Email byl úspěšně odeslán.")
          navigate('/login');
        } else {
          toast.error(res.data.Error)
        }
      })
    }



  }

  const Zpet = (e) => {
    e.preventDefault();
      navigate('/login');
  }

  return (
    <>
      <div className='container'>
        <div className='row justify-content-center text-center'>
          <div className='col-4 col-xxl-4 col-xl-4 col-lg-4 col-md-4' style={{marginBottom: 50}}>
              <h4 style={{marginBottom: 20}}>Zapomenuté Heslo</h4>
              <h6>Zadejte váš email pro zaslání odkazu na obnovení hesla</h6>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
        <div className='row justify-content-center' style={{marginBottom: 50}}>
          <div className='col-4 col-xxl-4 col-xl-4 col-lg-4 col-md-4'>
            <label htmlFor='email' className='form-label'>Email</label>
            <input id='email' type='text' className='form-control' placeholder='example@gmail.com'
              onChange={e => setEmail(e.target.value)}></input>
          </div>
        </div>
        <div className='row justify-content-center'>
          <div className='col-4 col-xxl-4 col-xl-4 col-lg-4 col-md-4'>
            <div className='row'>
            <div className='col-6'>
              <button onClick={Zpet} className='btn-border-radius-lg form-control btn btn-outline-secondary'>Zpět</button>
              </div>
            <div className='col-6'>
              <button type='submit' className='btn-border-radius-lg form-control btn btn-outline-secondary'>Poslat</button>
              </div>
            </div>
          </div>
        </div>
        </form>
      </div>
    </>
  )
}

export default ResetPassword