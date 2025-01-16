import React from 'react';
import logo from '../img/logo.png';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Navbar = () => {
    const [auth, jePrihlasen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3001/check', { withCredentials: true })
            .then(res => {
                if (res.data.Status === "Success") {
                    jePrihlasen(true);
                } else {
                    jePrihlasen(false);
                }
            })
    })

    const odhlasit = () => {
        axios.get('http://localhost:3001/odhlasit', { withCredentials: true })
            .then(res => {
                if (res.data.Status === "Success") {
                    jePrihlasen(false);
                    toast.success('Byl jste úspěšně odhlášen.');
                    navigate('/');
                } else {
                    toast.error(res.data.Error);
                }
            })
            .catch(err => console.error("Chyba při odhlašování", err));
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg container">
                <div className="container">
                    <Link className='nav-link active navbar-brand' aria-current="page" to="/">
                        <img className="me-2" src={logo} alt="Logo" width="80" height="30" />
                        Sportovní Auta
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNavDropdown"
                        aria-controls="navbarNavDropdown"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className='nav-link active' aria-current="page" to="/">
                                    Domů
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/cars">
                                    Vozidla
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active" to="/search">
                                    Hledat
                                </Link>
                            </li>
                            {
                                auth ?
                                <li>
                                    <Link className="nav-link active" to="/add">
                                        Vložit Inzerát
                                    </Link>
                                </li>
                                :
                                <></>
                            }
                        </ul>
                        {
                            auth ?
                                <ul className="navbar-nav ms-auto">
                                    <li className="nav-item d-flex align-items-center">
                                        <Link className="nav-link active" to="/favourites">
                                            <svg style={{ marginRight: 10 }} xmlns="http://www.w3.org/2000/svg" width="21" height="21" fillRule="currentColor" className="bi bi-heart" viewBox="0 0 16 16">
                                                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
                                            </svg>
                                            Oblíbené
                                        </Link>
                                    </li>
                                    <li className="nav-item d-flex align-items-center">
                                        <Link className="nav-link active" to="/profile">
                                            <svg style={{ marginRight: 10 }} xmlns="http://www.w3.org/2000/svg" width="21" height="21" fillRule="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                            </svg>
                                            Můj Účet
                                        </Link>
                                    </li>
                                    <li className="nav-item d-flex align-items-center">
                                        <Link className="nav-link active" onClick={odhlasit}>
                                            Odhlásit se
                                        </Link>
                                    </li>
                                </ul>
                                :
                                <ul className="navbar-nav ms-auto">
                                    <li className="nav-item">
                                        <Link className="nav-link active" to="/login">
                                            Přihlášení
                                        </Link>
                                    </li>
                                </ul>
                        }
                    </div>
                </div>
            </nav>
            <hr className="container mt-0" />
        </>
    );
};

export default Navbar;