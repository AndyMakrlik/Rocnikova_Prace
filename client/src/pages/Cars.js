import React from 'react'
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useState } from 'react';
import CarAdd from '../components/CarAdd.js'

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/favor', { withCredentials: true })
      .then(res => {
        if(res.data.Status === 'Success') {
          setFavourites(res.data.favourites.map(fav => fav.fk_inzerat))
        }
      })
      .catch(error => {
        toast.error('Došlo k chybě při načítání inzerátů. ' + error)
      })

    axios.get(`http://localhost:3001/cars`, { withCredentials: true })
      .then(res => {
        if (res.data.Status === "Success") {
          setCars(res.data.cars)
        } else {
          toast.error(res.data.Error)
        }
      })
      .catch(error => {
        toast.error("Došlo k chybě při náčítání inzerátů. " + error);
      });
  })

  return (
    <>
      <div className="container text-center">
        <div className="row">
          <div className="col col-lg-3 col-xl-3">
            <form>
              <h4 className="fw-bold">Vyhledávání</h4>
              <hr className="mb-4" />
              <div className="row">
                <div className="col mb-3">
                  <div className="form-floating">
                    <select className="form-select" name="znacka" id="znacka" aria-label="Vyberte značku auta">
                      <option value="0">Bez Omezení</option>
                    </select>
                    <label htmlFor="znacka">Značka auta</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col mb-3">
                  <div className="form-floating">
                    <select className="form-select" name="model" id="model" aria-label="Vyberte model auta">
                      <option>Bez omezení</option>
                    </select>
                    <label htmlFor="model">Model Vozidla</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col mb-3">
                  <div className="form-floating">
                    <select className="form-select" name="karoserie" id="karoserie" aria-label="Vyberte karoserii auta">
                      <option>Bez omezení</option>
                    </select>
                    <label htmlFor="karoserie">Karoserie Vozidla</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col mb-3">
                  <div className="form-floating">
                    <select className="form-select" name="rokOd" id="rokOd" aria-label="Vyberte rok od">
                      <option>Bez omezení</option>
                    </select>
                    <label htmlFor="rokOd">Rok Výroby Vozidla Od</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col mb-3">
                  <div className="form-floating">
                    <select className="form-select" name="vykonOd" id="vykonOd" aria-label="Vyberte výkon od">
                      <option>Bez omezení</option>
                    </select>
                    <label htmlFor="vykonOd">Výkon Vozidla Od [kW]</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col mb-3">
                  <div className="form-floating">
                    <select className="form-select" name="cenaDo" id="cenaDo" aria-label="Vyberte cenu do">
                      <option>Bez omezení</option>
                    </select>
                    <label htmlFor="cenaDo">Cena Vozidla Do</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col mb-3">
                  <div className="form-floating">
                    <select className="form-select" name="palivo" id="palivo" aria-label="Vyberte palivo auta">
                      <option>Bez omezení</option>
                    </select>
                    <label htmlFor="palivo">Palivo Vozidla</label>
                  </div>
                </div>
              </div>
              <div className="row mb-5">
                <div className="col-6 d-flex align-items-center justify-content-center">
                  <Link className="link-opacity-100" to="/search">
                    Podrobné hledání
                  </Link>
                </div>
                <div className="col-6 d-grid">
                  <button type="submit" className="btn btn-outline-secondary">Vyhledat</button>
                </div>
              </div>
            </form>
          </div>
          <div className="col-lg-9 col-xl-9">
            <h4 className="fw-bold">Vozidla</h4>
            <hr className="mb-4" />
            <div>
              {cars.map(car => (
                <CarAdd key={car.id} car={car} isFavourite={favourites.includes(car.id)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
