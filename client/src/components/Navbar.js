import React from 'react';
import logo from '../img/logo.png';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Navbar = () => {
    const [auth, jePrihlasen] = useState(false);
    const [authAdmin, jeAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3001/check', { withCredentials: true })
            .then(res => {
                if (res.data.Status === "Success") {
                    jePrihlasen(true);
                    if (res.data.role === "Admin") {
                        jeAdmin(true)
                    } else {
                        jeAdmin(false);
                    }
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
            <nav className="navbar navbar-expand-xl container">
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
                            auth && authAdmin ? (
                                <ul className="navbar-nav ms-auto">
                                    <li className="nav-item dropdown">
                                        <a style={{ color: 'black' }} className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            <svg style={{ marginRight: 10 }} xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-shield-lock" viewBox="0 0 16 16">
                                                <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56" />
                                                <path d="M9.5 6.5a1.5 1.5 0 0 1-1 1.415l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99a1.5 1.5 0 1 1 2-1.415" />
                                            </svg>
                                            Admin
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <Link className="dropdown-item" to="/manageads">
                                                    <svg style={{ marginRight: 10 }} xmlns="http://www.w3.org/2000/svg" width="21" height="21" fillRule="currentColor" className="bi bi-folder" viewBox="0 0 16 16">
                                                        <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                                                    </svg>
                                                    Správa Inzerátů
                                                </Link></li>
                                            <li><Link className="dropdown-item" to="/manageusers">
                                                <svg style={{ marginRight: 10 }} xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-people" viewBox="0 0 16 16">
                                                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                                                </svg>
                                                Správa Uživatelů
                                            </Link></li>
                                        </ul>
                                    </li>
                                    <li className="nav-item d-flex align-items-center">
                                        <Link className="nav-link active" to="/myadd">
                                            <svg style={{ marginRight: 10 }} xmlns="http://www.w3.org/2000/svg" width="21" height="21" fillRule="currentColor" className="bi bi-folder" viewBox="0 0 16 16">
                                                <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                                            </svg>
                                            Moje Inzeráty
                                        </Link>
                                    </li>
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
                            ) : auth ? (
                                <ul className="navbar-nav ms-auto">
                                    <li className="nav-item d-flex align-items-center">
                                        <Link className="nav-link active" to="/myadd">
                                            <svg style={{ marginRight: 10 }} xmlns="http://www.w3.org/2000/svg" width="21" height="21" fillRule="currentColor" className="bi bi-folder" viewBox="0 0 16 16">
                                                <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                                            </svg>
                                            Moje Inzeráty
                                        </Link>
                                    </li>
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
                            ) : (
                                <ul className="navbar-nav ms-auto">
                                    <li className="nav-item">
                                        <Link className="nav-link active" to="/login">
                                            Přihlášení
                                        </Link>
                                    </li>
                                </ul>
                            )
                        }
                    </div>
                </div>
            </nav>
            <hr className="container mt-0" />
        </>
    );
};

export default Navbar;