import React from 'react'
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import CarAddOwner from '../components/CarAddOwner.js'

export default function MyAdd() {
    const [cars, setCars] = useState([]);
    const [favourites, setFavourites] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/favor', { withCredentials: true })
            .then(res => {
                if (res.data.Status === 'Success') {
                    setFavourites(res.data.favourites.map(fav => fav.fk_inzerat))
                } else {
                    return;
                }
            })
            .catch(error => {
                toast.error('Došlo k chybě při načítání inzerátů. ' + error)
            })

        axios.get(`http://localhost:3001/myadd`, { withCredentials: true })
            .then(res => {
                if (res.data.Status === "Success") {
                    setCars(res.data.cars)
                } else {
                    return;
                }
            })
            .catch(error => {
                toast.error("Došlo k chybě při náčítání inzerátů. " + error);
            });
    }, [])
    return (
        <>
            <div className='container text-center'>
                <h2>Moje Inzeráty</h2>
                <hr></hr>
                <div className="row">
                    <div className="col col-lg-12 col-xl-12">
                        {cars.map(car => (
                            <CarAddOwner key={car.id} car={car} isFavourite={favourites.includes(car.id)}/>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
