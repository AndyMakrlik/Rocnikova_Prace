import React from 'react'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import CarAddFav from '../components/CarAddFav.js'
import { useState } from 'react';

export default function Favourites() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/favor', { withCredentials: true })
      .then(res => {
        if(res.data.Status === 'Success') {
          setFavourites(res.data.favourites.map(fav => fav.fk_inzerat))
        } else {
          toast.error(res.data.Error)
        }
      })
      .catch(error => {
        toast.error('Došlo k chybě při načítání inzerátů. ' + error)
      })

    axios.get('http://localhost:3001/favourites', { withCredentials: true })
      .then(res => {
        if (res.data.Status === "Success") {
          setCars(res.data.cars)
        } else {
          toast.error(res.data.Error)
        }
      })
      .catch(error => {
        toast.error("Došlo k chybě při náčítání stránky profilu. " + error);
      });
  }, [])

  
  
  return (
    <>
    <div className='container text-center'>
      <h2>Oblíbené Inzeráty</h2>
      <hr></hr>
      <div className="row">
          <div className="col col-lg-12 col-xl-12">
          {cars.map(car => (
                <CarAddFav key={car.id} car={car} isFavourite={favourites.includes(car.id)} />
              ))}
          </div>
        </div>
    </div> 
    </>
  )
}
