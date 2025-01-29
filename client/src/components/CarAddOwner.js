import React from 'react';
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

const CarAddOwner = ({ car, isFavourite: stateFavourite }) => {
    const [auth, jePrihlasen] = useState(false);
    const [isFavourite, setIsFavourite] = useState(stateFavourite);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [data, setData] = useState({ car });
    const [editData, setEditData] = useState({ car });
    const [isButtonEnabled, setIsButtonEnabled] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:3001/check', { withCredentials: true })
          .then(res => {
            if (!res.data.Status === "Success") {
              jePrihlasen(true);
            } else {
              jePrihlasen(false);
            }
          })
      }, []);

    const deleteAd = async (e, ad, car) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm('Opravdu chcete smazat tento inzerát?')) {
            try {
                await axios.delete(`http://localhost:3001/ad/${ad}/${car}`, { withCredentials: true })
                    .then(res => {
                        if (res.data.Status === 'Success') {
                            toast.success('Inzerát byl úspěšně smazán.');
                            const adElement = document.getElementById(`${ad}`);
                            if (adElement) {
                                adElement.remove();
                            }
                        } else {
                            toast.error(res.data.Error)
                        }
                    });

            } catch (error) {
                toast.error(error)
            }
        }
    };

    const toggleEditPanel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsButtonEnabled(prevState => !prevState);
        setEditData(data);
        setIsEditOpen(prev => !prev);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cenaString = String(editData.car.cena);
        editData.car.cena = cenaString.replace(/\s+/g, '');
        if (!editData.car.nazev) {
            toast.error('Název musí být vyplněn.');
        } else if (!editData.car.cena || Number(editData.car.cena) <= 0 || isNaN(Number(editData.car.cena))) {
            toast.error('Cena musí být vyplněna a kladná.');
        } else if (!editData.car.popis) {
            toast.error('Popis musí být vyplněn.');
        } else {
            axios.post("http://localhost:3001/editAdd", { editData }, { withCredentials: true })
                .then(res => {
                    if (res.data.Status === "Success") {
                        toast.success("Úspěšně jste upravil inzerát.")
                        setData(editData);
                        setIsButtonEnabled(true);
                        setIsEditOpen(false)
                    } else {
                        toast.error(res.data.Error)
                    }
                })
            setIsEditOpen(prev => !prev)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prevState => ({
            ...prevState,
            car: {
                ...prevState.car,
                [name]: value
            }
        }));
        console.log(data);
    };

    const handleHeartClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth) {
            toast.error("Musíte se nejdříve přihlásit.");
            return;
        }

        try {
            if (!isFavourite) {
                await axios.post('http://localhost:3001/favor', { carId: car.id, cena: car.cena }, { withCredentials: true });
                toast.success(`${car.nazev} byl přidán do oblíbených.`);
            } else {
                await axios.delete(`http://localhost:3001/favor/${car.id}`, { withCredentials: true });
                toast.success(`${car.nazev} byl odebrán z oblíbených.`);
            }
            setIsFavourite(!isFavourite);
        } catch (err) {
            console.error("Error updating favourites:", err);
        }
    };
    return (
        <div>
            <Link to={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className='row mb-5 align-items-center'>
                    <div className='col-12 col-xl-3 col-lg-3 col-sm-12'>
                        <img alt='auto' className='img-fluid' src={car.obrazek} />
                    </div>
                    <div className="col-7 col-xl-3 col-lg-3 col-sm-7 d-flex justify-content-center">
                        <div className="card" style={{ border: 'none', width: '100%' }}>
                            <div className="card-body" style={{ textAlign: 'left' }}>
                                <h5 className="card-title fw-bold mb-3">{data.car.nazev}</h5>
                                <h6 className="card-subtitle fw-semibold mb-3">{car.rok_vyroby}, {Number(car.najete_km).toLocaleString('cs-CZ')} Km</h6>
                                <h6 className="card-subtitle mb-3">{car.vykon_kw} kW ({Math.round(car.vykon_kw * 1.341)} ps)</h6>
                                <h6 className="card-subtitle mb-3">{car.karoserie}, {car.palivo}, {car.prevodovka}</h6>
                                <h6 className="card-subtitle mb-3">Lokace: {car.kraj} kraj</h6>
                            </div>
                        </div>
                    </div>
                    <div className='col-5 col-xl-2 col-lg-2 col-sm-5 d-flex justify-content-center'>
                        <div className="card" style={{ border: 'none', width: '100%' }}>
                            <div className="card-body" style={{ textAlign: 'right' }}>
                                <h4 className="card-title fw-bold" style={{ color: data.car.stav === 'Aktivní' ? 'green' : data.car.stav === 'Rezervovaný' ? 'orange' : data.car.stav === 'Zrušený' ? 'red' : 'black' }}>{data.car.stav}</h4>
                                <h5 className="card-subtitle fw-semibold" style={{ marginBottom: 70 }}>{Number(data.car.cena).toLocaleString('cs-CZ')} Kč</h5>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fillRule="currentColor" className="bi bi-heart" viewBox="0 0 16 16" fill={isFavourite ? "red" : "currentColor"} onClick={(e) => handleHeartClick(e, car.id)} style={{ cursor: 'pointer' }}>
                                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className='col-12 col-xl-4 col-lg-4 col-sm-12 d-flex flex-column'>
                        <button disabled={!isButtonEnabled} style={{ marginBottom: '50px' }} onClick={toggleEditPanel} className="btn-border-radius-lg btn btn-outline-secondary">Upravit</button>
                        <button disabled={!isButtonEnabled} className="btn btn-danger" onClick={(e) => deleteAd(e, car.id, car.carId)}>Smazat</button>
                    </div>
                </div>
            </Link>

            {isEditOpen && (
                <div className="edit-panel container">
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className='row' style={{ marginBottom: '50px' }}>
                                <div className='text-center'>
                                    <h2>Inzerát</h2>
                                    <hr></hr>
                                </div>
                                <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                                    <label htmlFor='nazev' className='form-label'>Název</label>
                                    <input name='nazev' style={{ marginBottom: '20px' }} id='nazev' type='text' className='form-control' placeholder='Audi RS3 MATRIX'
                                        onChange={handleChange}
                                        value={isEditOpen ? editData.car.nazev || "" : data.car.nazev || ""}></input>
                                    <div className='row'>
                                        <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-6'>
                                            <label htmlFor='cena' className='form-label'>Cena</label>
                                            <div className="input-group" style={{ marginBottom: '20px' }}>
                                                <input name='cena' onChange={handleChange} value={isEditOpen ? editData.car.cena || "" : data.car.cena || ""} id='cena' type='text' className='form-control' placeholder='1 999 000'></input>
                                                <span className="input-group-text" style={{ backgroundColor: 'white' }}>Kč</span>
                                            </div>
                                        </div>
                                        <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-6'>
                                            <label htmlFor='stav' className='form-label'>Stav</label>
                                            <div className="input-group" style={{ marginBottom: '20px' }}>
                                                <select name='stav' onChange={handleChange} id='stav' type='text' className='form-select' value={isEditOpen ? editData.car.stav || "" : data.car.stav || ""}>
                                                    <option value='' disabled>Vyberte stav</option>
                                                    <option value="Aktivní">Aktivní</option>
                                                    <option value="Rezervovaný">Rezervovaný</option>
                                                    <option value="Zrušený">Zrušený</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                                    <label htmlFor='popis' className='form-label'>Popis</label>
                                    <textarea name='popis' onChange={handleChange} style={{ marginBottom: '20px', height: '128px' }} id='popis' type='text' className="form-control" placeholder='Zde napiště svůj popis vozu, závady, co chcete přidat k vozu, výbavu atd.'
                                        value={isEditOpen ? editData.car.popis || "" : data.car.popis || ""}></textarea>
                                </div>
                            </div>
                            <div className='row justify-content-center'>
                                <div className='mb-3 col-12 form-group'>
                                    <button className='btn-border-radius-lg btn btn-outline-secondary' style={{ marginBottom: '10px', width: '100%' }} type="submit" onClick={handleSubmit}>Uložit změny</button>
                                    <button className='btn-border-radius-lg btn btn-outline-secondary' style={{ marginBottom: '10px', width: '100%' }} onClick={(e) => toggleEditPanel(e)}>Zavřít</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};
export default CarAddOwner;