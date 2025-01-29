import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

const User = ({ user }) => {
  const [data, setData] = useState(user);

  const handleDelete = async () => {
    const isConfirmed = window.confirm('Opravdu chcete smazat tohoto uživatele?');
    if (!isConfirmed) return;

    try {
      const response = await axios.delete(`http://localhost:3001/user/${user.id}`, { withCredentials: true });
      if (response.data.Status === 'Success') {
        toast.success('Uživatel úspěšně smazán.');
        window.location.reload();
      } else {
        toast.error(response.data.Error);
      }
    } catch (error) {
      toast.error('Chyba při mazání uživatele.');
    }
  };

  const handleChangeRole = async () => {
    const newRole = data.role === 'Admin' ? 'Uživatel' : 'Admin';

    const isConfirmed = window.confirm(`Opravdu chcete změnit roli na ${newRole}?`);
    if (!isConfirmed) return;

    try {
      const response = await axios.post(
        `http://localhost:3001/user/${data.id}/role`,
        { role: newRole },
        { withCredentials: true }
      );
      if (response.data.Status === 'Success') {
        setData((prevData) => ({
          ...prevData,
          role: newRole,
        }));
        toast.success(`Role změněna na ${newRole}.`);
      } else {
        toast.error(response.data.Error);
      }
    } catch (error) {
      toast.error('Chyba při změně role.');
    }
  };

  return (
    <div className="card mb-3" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '15px' }}>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
        <h5 className="card-title fw-bold">{`${data.jmeno} ${data.prijmeni}`}</h5>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
          </svg>
        </div>
        <h6 className="card-text"><span className='fw-bold' style={{color: 'black'}}>Email: </span> {data.email}</h6>
        <h6 className="card-text"><span className='fw-bold' style={{color: 'black'}}>Telefon: </span> {data.telefon}</h6>
        <h6 className="card-text"><span className='fw-bold' style={{color: 'black'}}>Role: </span> {data.role}</h6>
        <h6 className="card-text"><span className='fw-bold' style={{color: 'black'}}>Datum registrace: </span> {new Date(data.datum_registrace).toLocaleDateString()}</h6>
        <div className="d-flex justify-content-between">
          <button className="btn btn-danger" onClick={handleDelete}>
            Smazat
          </button>
          <button className="btn btn-primary" onClick={handleChangeRole}>
            Změnit roli
          </button>
        </div>
      </div>
    </div>
  );
};

export default User;