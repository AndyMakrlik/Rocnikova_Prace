import React from 'react';
import { Link } from 'react-router-dom';
import bg from '../img/bg.png';

export default function Home() {
    return (
        <>
            <div className="container text-center">
                <div className="row">
                    <div className="col col-lg-4 col-xl-4">
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
                    <div className="col-lg-8 col-xl-8 d-none d-lg-block">
                        <h4 className="fw-bold">Jsme největší autoinzerce sportovních aut v České Republice</h4>
                        <h6 className="fw-bold">Pro vložení inzerátů se zaregistrujte, popřípadě založte účet</h6>
                        <div className="d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
                            <img className="img-fluid" src={bg} alt="auto" style={{ maxWidth: '100%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
