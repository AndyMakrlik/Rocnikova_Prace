import React from 'react';
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react'; 

const CarAdd = ({ car, isFavourite: stateFavourite }) => {
  const [auth, jePrihlasen] = useState(false);
  const [isFavourite, setIsFavourite] = useState(stateFavourite);

  useEffect(() => {
      axios.get('http://localhost:3001/check', { withCredentials: true })
        .then(res => {
          if (res.data.Status === "Success") {
            jePrihlasen(true);
          } else {
            jePrihlasen(false);
          }
        })
    }, []);

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
      <Link to={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className='row mb-5 align-items-center'>
        <div className='col-12 col-xl-4 col-lg-4 col-sm-12'>
          <img alt='auto' className='img-fluid' src={car.obrazek}/>
        </div>
        <div className="col-7 col-xl-5 col-lg-4 col-sm-8 d-flex justify-content-center">
          <div className="card" style={{ border: 'none', width: '100%' }}>
            <div className="card-body" style={{ textAlign: 'left' }}>
              <h4 className="card-title fw-bold mb-3">{car.nazev}</h4>
              <h6 className="card-subtitle fw-semibold mb-3">{car.rok_vyroby}, {Number(car.najete_km).toLocaleString('cs-CZ')} Km</h6>
              <h6 className="card-subtitle mb-3">{car.vykon_kw} kW ({Math.round(car.vykon_kw * 1.341)} ps)</h6>
              <h6 className="card-subtitle mb-3">{car.karoserie}, {car.palivo}, {car.prevodovka}</h6>
              <h6 className="card-subtitle mb-3">Lokace: {car.kraj} kraj</h6>
            </div>
          </div>
        </div>
        <div className='col-5 col-xl-3 col-lg-4 col-sm-4 d-flex justify-content-center'>
          <div className="card" style={{ border: 'none', width: '100%' }}>
            <div className="card-body" style={{ textAlign: 'right' }}>
              <h4 className="card-title fw-bold" style={{ color: car.stav === 'Aktivní' ? 'green' : car.stav === 'Rezervovaný' ? 'orange' : car.stav === 'Zrušený' ? 'red' : 'black' }}>{car.stav}</h4>
              <h5 className="card-subtitle fw-semibold" style={{ marginBottom: 70 }}>{Number(car.cena).toLocaleString('cs-CZ')} Kč</h5>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fillRule="currentColor" className="bi bi-heart" viewBox="0 0 16 16" fill={isFavourite ? "red" : "currentColor"} onClick={handleHeartClick} style={{ cursor: 'pointer' }}>
                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      </Link>
    );
  };
export default CarAdd;