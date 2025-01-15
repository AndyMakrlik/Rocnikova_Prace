import React from 'react'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSameEmail, setIsSameEmail] = useState(true);
  const [isSamePhone, setIsSamePhone] = useState(true);

  useEffect(() => {
    if (editData.email === data.email) {
      setIsSameEmail(true);
    } else {
      setIsSameEmail(false);
    }

    if (editData.telefon === data.telefon) {
      setIsSamePhone(true);
    } else {
      setIsSamePhone(false);
    }

    console.log(data);
    console.log(editData);
  }, [editData, data]);

  const handleSave = (e) => {
    e.preventDefault();

    const jmenoRegex = /^[a-zA-ZÀ-ž]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    editData.telefon = editData.telefon.replace(/\s+/g, '');

    if (!editData.jmeno || !jmenoRegex.test(editData.jmeno)) {
      toast.error('Jméno musí být vyplněné a obsahovat pouze písmena bez mezer.');
    } else if (!editData.prijmeni || !jmenoRegex.test(editData.prijmeni)) {
      toast.error('Příjmení musí být vyplněné a obsahovat pouze písmena bez mezer.');
    } else if (!/^\+\d{1,4}\d{9,15}$/.test(editData.telefon)) {
      toast.error('Telefonní číslo musí být mezi 9 až 15 číslicemi a obsahovat telefonní předvolbu mezi 1 až 4 číslicemi.');
    } else if (!editData.email) {
      toast.error('Prosím vyplňtě email.');
    } else if (!emailRegex.test(editData.email)) {
      toast.error('Zadejte prosím email ve správném formátu. (example@gmail.com)')
    } else if (!editData.kraj) {
      toast.error('Prosím, vyberte kraj.')
    } else if (!editData.mesto) {
      toast.error('Prosím, vypište město.')
    } else {
      axios.post('http://localhost:3001/profile', { editData, isSameEmail, isSamePhone }, { withCredentials: true })
        .then(res => {
          if (res.data.Status === "Success") {
            setData(editData);
            setIsEditing(false);
            toast.success("Profil byl úspěšně aktualizován.");
          } else {
            toast.error(res.data.Error);
          }
        })
        .catch(error => {
          toast.error(error);
        });
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
  };

  useEffect(() => {
    axios.get('http://localhost:3001/profile', { withCredentials: true })
      .then(res => {
        if (res.data.Status === "Success") {
          setData(res.data);
          setEditData(res.data);
        } else {
          toast.error(res.data.Error)
          navigate('/Login');
        }
      })
      .catch(error => {
        toast.error("Došlo k chybě při náčítání stránky profilu. " + error);
      });
  }, [])


  const renderInputField = (label, name, value) => (
    <div className="row align-items-center" style={{ marginBottom: 30 }}>
      <label htmlFor={name} className="col-sm-2 col-form-label fs-4">{label}</label>
      <div className="col-sm-10">
        <input
          id={name}
          name={name}
          type="text"
          className="form-control"
          disabled={!isEditing}
          value={isEditing ? editData[name] || "" : value || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className='col col-xxl-8 col-xl-8 col-lg-8'>
            <div className='row'>
              <div className='col-12 col-xxl-4 col-xl-4 col-lg-12 col-md-12 col-sm-12 text-center text-xl-start'>
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                  <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                </svg>
              </div>
              <div className='col col-xxl-8 col-xl-8 col-lg-12'>
                <h2 className='fw-bold' style={{ marginTop: 40, marginBottom: 40 }}>{data.jmeno} {data.prijmeni}</h2>
                <h3>
                  <span className='text-primary'>{data.email}</span>
                  <span> - {data.role}</span>
                </h3>
              </div>
            </div>
            <h2 className='fw-bold' style={{ marginTop: 30, marginBottom: 30 }}>Účet</h2>
            <form onSubmit={handleSave}>
              {renderInputField("Jméno", "jmeno", data.jmeno)}
              {renderInputField("Příjmení", "prijmeni", data.prijmeni)}
              {renderInputField("Telefon", "telefon", data.telefon)}
              {renderInputField("Email", "email", data.email)}
              <div className='row align-items-center' style={{ marginBottom: 30 }}>
                <label htmlFor="jmeno" className="col-sm-2 col-form-label fs-4">Kraj</label>
                <div className="col-sm-10">
                  <select
                    id="kraj"
                    name="kraj"
                    className="form-select"
                    value={isEditing ? editData.kraj || "" : data.kraj || ""}
                    disabled={!isEditing}
                    onChange={handleChange}
                  >
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
              </div>
              {renderInputField("Město", "mesto", data.mesto)}

              <div>
                {isEditing ? (
                  <div>
                    <button type='submit' className='btn-border-radius-lg form-control btn btn-outline-secondary' style={{ marginBottom: 10 }}>Uložit</button>
                    <button className='btn-border-radius-lg form-control btn btn-outline-secondary' onClick={handleCancel} style={{ marginBottom: 30 }}>Zrušit</button>
                  </div>
                ) : (
                  <button className='btn-border-radius-lg form-control btn btn-outline-secondary' onClick={() => setIsEditing(true)} style={{ marginBottom: 30 }}>Upravit</button>
                )}

              </div>
            </form>
          </div>
        </div>
      </div >
    </>
  )
}
