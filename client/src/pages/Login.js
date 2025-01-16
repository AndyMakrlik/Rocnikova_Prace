import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import CheckAuth from '../functions/checkAuthLogged';

export default function Login() {

  
  const navigate = useNavigate();
  useEffect(() => {
    CheckAuth(navigate);
  });

  const [values, setValues] = useState({
    email: '',
    heslo: ''
  });

  axios.defaults.withCredentials = true;


  const handleSubmit = (e) => {
    e.preventDefault();
    const hesloRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!values.email) {
      toast.error('Prosím vyplňtě email.');
    } else if (!emailRegex.test(values.email)) {
      toast.error('Zadejte prosím email ve správném formátu. (example@gmail.com)')
    } else if (!hesloRegex.test(values.heslo)) {
      toast.error('Heslo nesmí obsahovat mezery, musí mít alespoň 8 znaků, obsahovat malé a velké písmeno, číslici a speciální znak (@, #, &).');
    } else {

      axios.post("http://localhost:3001/prihlaseni", values)
        .then(res => {
          if (res.data.Status === "Success") {
            toast.success("Úspěšně jste se přihlásil.")
            localStorage.setItem('isLoggedIn', 'true');
            navigate('/');
          } else {
            toast.error(res.data.Error);
          }
        })
        .catch(err => console.log(err));
    }
  };
  return (
    <>
      <div className='container'>
        <div className='row justify-content-center text-center'>
          <div className='col col-lg-4 col-md-6'>
            <h4 className="fw-bold" style={{ marginBottom: '30px' }}>Přihlášení</h4>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16" style={{ marginBottom: '30px' }}>
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
            </svg>
            <hr style={{ marginBottom: '30px' }}></hr>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='row justify-content-center'>
            <div className='col col-lg-4 col-md-6 form-group' style={{ marginBottom: '30px' }}>
              <label htmlFor='email' className='form-label'>Email</label>
              <input id='email' type='text' className='form-control' placeholder='example@gmail.com'
                onChange={e => setValues({ ...values, email: e.target.value })}></input>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='mb-3 col col-lg-4 col-md-6 form-group'>
              <label htmlFor='password' className='form-label'>Heslo</label>
              <input id="password" type='password' className='form-control' placeholder='Zadejte Heslo'
                onChange={e => setValues({ ...values, heslo: e.target.value })}></input>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='mb-3 col col-lg-4 col-md-6 form-group' style={{ marginBottom: '30px' }}>
              <Link to='/resetpassword' className='text-decoration-none'>Zapomněl jste heslo?</Link>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='mb-3 col col-lg-4 col-md-6 form-group'>
              <button type='submit' className='btn-border-radius-lg form-control btn btn-outline-secondary'>
                Přihlásit
              </button>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='mb-3 col form-group text-center'>
              Nemáte ještě u nás účet?
              <Link to='/registration' className='text-decoration-none'> Vytvořte si účet</Link>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}