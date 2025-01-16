import React from 'react'
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import CheckAuth from '../functions/checkAuthLogged';
import axios from 'axios';

function RestorePassword() {

    const navigate = useNavigate();

    useEffect(() => {
        CheckAuth(navigate);
      });
    

    const [heslo, setPassword] = useState();

    const { token } = useParams();

    const handleSubmit = (e) => {
        e.preventDefault();

        const hesloRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/;

        if (!hesloRegex.test(heslo)) {
            toast.error('Heslo nesmí obsahovat mezery, musí mít alespoň 8 znaků, obsahovat malé a velké písmeno, číslici a speciální znak (@, #, &).');
        } else {
            axios.post(`http://localhost:3001/restorePassword/${token}`, { heslo }, { withCredentials: true })
                .then(res => {
                    if (res.data.Status === 'Success') {
                        toast.success("Heslo bylo úspěšně změněno.")
                        navigate('/login');
                    } else {
                        toast.error(res.data.Error)
                    }
                })
        }



    }

    return (
        <>
            <div className='container'>
                <div className='row justify-content-center text-center'>
                    <div className='col-4 col-xxl-4 col-xl-4 col-lg-4 col-md-4' style={{ marginBottom: 50 }}>
                        <h4 style={{ marginBottom: 20 }}>Obnovení Hesla</h4>
                        <h6>Zadejte vaše nové heslo</h6>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className='row justify-content-center' style={{ marginBottom: 50 }}>
                        <div className='col-4 col-xxl-4 col-xl-4 col-lg-4 col-md-4'>
                            <label htmlFor='password' className='form-label'>Heslo</label>
                            <input id='password' type='password' className='form-control' placeholder='Zadejte Heslo'
                                onChange={e => setPassword(e.target.value)}></input>
                        </div>
                        <div className='row justify-content-center' style={{ marginBottom: '30px' }}>
                            <div className="col-4 col-xxl-4 col-xl-4 col-lg-4 col-md-4">Heslo nesmí obsahovat mezery, musí mít alespoň 8 znaků, obsahovat malé a velké písmeno, číslici a speciální znak (@, #, &).</div>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-4 col-xxl-4 col-xl-4 col-lg-4 col-md-4'>
                            <div className='row'>
                                <div className='col'>
                                    <button type='submit' className='btn-border-radius-lg form-control btn btn-outline-secondary'>Změnit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default RestorePassword