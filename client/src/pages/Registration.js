import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import CheckAuth from '../functions/checkAuthLogged';

export default function Registration() {
  const navigate = useNavigate();

  useEffect(() => {
    CheckAuth(navigate);
  });
  

  const [values, setValues] = useState({
    jmeno: '',
    prijmeni: '',
    email: '',
    celyTelefon: '',
    telefon: '',
    predvolba: '+420',
    heslo: '',
    hesloZnovu: '',
    kraj: '',
    mesto: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const hesloRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/;
    const jmenoRegex = /^[a-zA-ZÀ-ž]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const predvolbaBezMezer = values.predvolba.replace(/\s+/g, '');
    const telefonBezMezer = values.telefon.replace(/\s+/g, '');
    values.celyTelefon = `${predvolbaBezMezer}${telefonBezMezer}`;

    if (!values.jmeno || !jmenoRegex.test(values.jmeno)) {
      toast.error('Jméno musí být vyplněné a obsahovat pouze písmena bez mezer.');
    } else if (!values.prijmeni || !jmenoRegex.test(values.prijmeni)) {
      toast.error('Příjmení musí být vyplněné a obsahovat pouze písmena bez mezer.');
    } else if (!hesloRegex.test(values.heslo)) {
      toast.error('Heslo nesmí obsahovat mezery, musí mít alespoň 8 znaků, obsahovat malé a velké písmeno, číslici a speciální znak (@, #, &).');
    } else if (values.heslo !== values.hesloZnovu) {
      toast.error('Hesla se neshodují.');
    } else if (!/^\d{9,15}$/.test(telefonBezMezer)) {
      toast.error('Telefonní číslo musí být mezi 9 a 15 číslicemi.');
    } else if (!values.email) {
      toast.error('Prosím vyplňtě email.');
    } else if (!emailRegex.test(values.email)) {
      toast.error('Zadejte prosím email ve správném formátu. (example@gmail.com)')
    } else if (!values.kraj) {
      toast.error('Prosím, vyberte kraj.')
    } else if (!values.mesto) {
      toast.error('Prosím, vypište město.')
    } else {

      axios.post("http://localhost:3001/registrace", values)
        .then(res => {
          if (res.data.Status === "Success") {
            toast.success("Úspěšná registrace, nyní se můžete přihlásit.");
            navigate('/Login');
          } else {
            toast.error(res.data.Error);
          }
        })
        .catch(error => console.log("Chyba při odesílání formuláře:", error));

      console.log("Formulář odeslán:", values);
      console.log('Uložené číslo: ', values.celyTelefon);
    }
  };
  return (
    <>
      <div className='container'>
        <div className='row justify-content-center text-center'>
          <div className='col col-lg-4 col-md-6'>
            <h4 className="fw-bold" style={{ marginBottom: '30px' }}>Registrace</h4>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16" style={{ marginBottom: '30px' }}>
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
            </svg>
            <hr style={{ marginBottom: '30px' }}></hr>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='row justify-content-center'>
            <div className='col col-lg-4 col-md-6'>
              <div className='row'>
                <div className='col-xl-6 col-md-12 form-group' style={{ marginBottom: '30px' }}>
                  <label htmlFor='jmeno' className='form-label'>Jméno</label>
                  <input id='jmeno' type='text' className='form-control' placeholder='Jan'
                    onChange={e => setValues({ ...values, jmeno: e.target.value })}></input>
                </div>
                <div className='col-xl-6 col-md-12 form-group' style={{ marginBottom: '30px' }}>
                  <label htmlFor='prijmeni' className='form-label'>Příjmení</label>
                  <input id='prijmeni' type='text' className='form-control' placeholder='Novák'
                    onChange={e => setValues({ ...values, prijmeni: e.target.value })}></input>
                </div>
              </div>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col col-lg-4 col-md-6 form-group'>
              <label htmlFor='password' className='form-label'>Heslo</label>
              <input id="password" type='password' className='form-control' placeholder='Zadejte Heslo'
                onChange={e => setValues({ ...values, heslo: e.target.value })}></input>
            </div>
          </div>
          <div className='row justify-content-center' style={{ marginBottom: '30px' }}>
            <div className="col col-lg-4 col-md-6 form-text">Heslo nesmí obsahovat mezery, musí mít alespoň 8 znaků, obsahovat malé a velké písmeno, číslici a speciální znak (@, #, &).</div>
          </div>
          <div className='row justify-content-center'>
            <div className='col col-lg-4 col-md-6 form-group' style={{ marginBottom: '30px' }}>
              <label htmlFor='passwordAgain' className='form-label'>Heslo Znovu</label>
              <input id="passwordAgain" type='password' className='form-control' placeholder='Zadejte Heslo Znovu'
                onChange={e => setValues({ ...values, hesloZnovu: e.target.value })}></input>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col col-lg-4 col-md-6'>
              <div className='row' style={{ marginBottom: '30px' }}>
                <div className='col-3 col-xxl-3 col-xl-3 col-md-4 col-sm-3 form-group'>
                  <label htmlFor='predvolba' className='form-label'>Předvolba</label>
                  <input id='predvolba' type='text' className='form-control' placeholder='+420' value={'+420'}
                    onChange={e => setValues({ ...values, predvolba: e.target.value })}></input>
                </div>
                <div className='col-9 col-xxl-9 col-md-8 form-group'>
                  <label htmlFor='telefon' className='form-label'>Telefon</label>
                  <input id='telefon' type='tel' className='form-control' placeholder='776 322 046'
                    onChange={e => setValues({ ...values, telefon: e.target.value })}></input>
                </div>
              </div>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col col-lg-4 col-md-6 form-group' style={{ marginBottom: '30px' }}>
              <label htmlFor='email' className='form-label'>Email</label>
              <input id="email" type='text' className='form-control' placeholder='example@gmail.com'
                onChange={e => setValues({ ...values, email: e.target.value })}></input>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col col-lg-4 col-md-6 form-group' style={{ marginBottom: '30px' }}>
              <label htmlFor='kraj' className='form-label'>Kraj</label>
              <select id='kraj' type='text' className='form-select' defaultValue={''}
                onChange={e => setValues({ ...values, kraj: e.target.value })}>
                <option value='' disabled>Vyberte kraj</option>
                <option value="Praha">Hlavní město Praha</option>
                <option value="Jihočeský">Jihočeský kraj</option>
                <option value="Jihomoravský">Jihomoravský kraj</option>
                <option value="Karlovarský">Karlovarský kraj</option>
                <option value="Královéhradecký">Královéhradecký kraj</option>
                <option value="Liberecký">Liberecký kraj</option>
                <option value="Moravskoslezský">Moravskoslezský kraj</option>
                <option value="Olomoucký">Olomoucký kraj</option>
                <option value="Pardubický">Pardubický kraj</option>
                <option value="Plzeňský">Plzeňský kraj</option>
                <option value="Středočeský">Středočeský kraj</option>
                <option value="Ústecký">Ústecký kraj</option>
                <option value="Vysočina">Kraj Vysočina</option>
                <option value="Zlínský">Zlínský kraj</option>
              </select>
            </div>
            <div className='row justify-content-center' style={{ marginBottom: '30px' }}>
              <div className='col col-lg-4 col-md-6 form-group'>
                <label htmlFor='mesto' className='form-label'>Město</label>
                <input id='mesto' type='text' className='form-control' placeholder='Ústí nad Labem'
                  onChange={e => setValues({ ...values, mesto: e.target.value })}></input>
              </div>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='mb-3 col col-lg-4 col-md-6 form-group'>
              <button type='submit' className='btn-border-radius-lg form-control btn btn-outline-secondary'>
                Registrovat
              </button>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='mb-3 col form-group text-center'>
              Máte již u nás účet?
              <Link to='/login' className='text-decoration-none'> Přihlašte se</Link>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
