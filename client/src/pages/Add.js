import React from 'react'
import { useEffect, useState } from 'react';
import CheckAuth from '../functions/checkAuthUnLogged';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
export default function Add() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const [inzerat, setInzerat] = useState({
    nazev: '',
    cena: '',
    stav: '',
    popis: ''
  });
  const [auto, setAuto] = useState({
    znacka: '',
    model: '',
    karoserie: '',
    pocetDveri: '',
    pocetSedadel: '',
  });
  const [specifikace, setSpecifikace] = useState({
    najeto: '',
    barva: '',
    rokVyroby: '',
    prevodovka: '',
    vykon: '',
    objem: '',
    palivo: '',
    pohon: '',
    vin: '',
  });
  const [droppedFiles, setDroppedFiles] = useState([]);

  useEffect(() => {
    CheckAuth(navigate).then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <></>;
  }
  

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));

    if (invalidFiles.length > 0) {
      toast.error(`Některé soubory nejsou obrázky: ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    setDroppedFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileInputChange = (event) => {
    const files = Array.from(event.target.files);

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));

    if (invalidFiles.length > 0) {
      toast.error(`Některé soubory nejsou obrázky: ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    setDroppedFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const handleDelete = (event, fileToDelete) => {
    event.preventDefault();
    setDroppedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToDelete)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    inzerat.cena = inzerat.cena.replace(/\s+/g, '');
    auto.pocetDveri = auto.pocetDveri.replace(/\s+/g, '');
    auto.pocetSedadel = auto.pocetSedadel.replace(/\s+/g, '');
    specifikace.najeto = specifikace.najeto.replace(/\s+/g, '');
    specifikace.rokVyroby = specifikace.rokVyroby.replace(/\s+/g, '');
    specifikace.vykon = specifikace.vykon.replace(/\s+/g, '');
    specifikace.objem = specifikace.objem.replace(/\s+/g, '');

    if (!inzerat.nazev) {
      toast.error('Název musí být vyplněný.');
    } else if (!inzerat.cena || Number(inzerat.cena) <= 0 || isNaN(Number(inzerat.cena))) {
      toast.error('Cena musí být vyplněna a kladná.');
    } else if (!inzerat.stav) {
      toast.error('Stav inzerátů musí být zvolen.');
    } else if (!inzerat.popis) {
      toast.error('Popis musí být vyplněn.');
    } else if (!auto.znacka) {
      toast.error('Značka musí být vyplněna');
    } else if (!auto.model) {
      toast.error('Model musí být vyplněn.');
    } else if (!auto.karoserie) {
      toast.error('Karoserie musí být vyplněna.')
    } else if (!auto.pocetDveri || isNaN(Number(auto.pocetDveri))) {
      toast.error('Počet dveří musí být vyplněn a napsán číslicí.')
    } else if (!auto.pocetSedadel || isNaN(Number(auto.pocetSedadel))) {
      toast.error('Počet sedadel musí být vyplněn a napsán číslicí.')
    } else if (!specifikace.najeto || isNaN(Number(specifikace.najeto))) {
      toast.error('Nájeté kilometry musí být vyplněny a napsány pouze číslovkou.')
    } else if (!specifikace.barva) {
      toast.error('Barva musí být vyplněna.')
    } else if (!specifikace.rokVyroby || isNaN(Number(specifikace.rokVyroby)) || specifikace.rokVyroby > currentYear || specifikace.rokVyroby < 1885) {
      toast.error(`Rok musí být vyplněn a napsán číslovkou a menší nebo roven ${currentYear}.`)
    } else if (!specifikace.prevodovka) {
      toast.error('Převodovka musí být zvolena.')
    } else if (!specifikace.vykon || isNaN(Number(specifikace.vykon))) {
      toast.error('Výkon musí být vyplněn a napsán číslovkou.')
    } else if (!specifikace.objem || isNaN(Number(specifikace.objem))) {
      toast.error('Objem musí být vyplněn a napsán číslovkou.')
    } else if (!specifikace.palivo) {
      toast.error('Palivo musí být zvoleno.')
    } else if (!specifikace.pohon) {
      toast.error('Pohon musí být zvolen.')
    } else {
      droppedFiles.forEach((file) => {
        formData.append(`images`, file);
      });

      formData.append('inzerat', JSON.stringify(inzerat));
      formData.append('auto', JSON.stringify(auto));
      formData.append('specifikace', JSON.stringify(specifikace));

      axios.post("http://localhost:3001/add", formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          if (res.data.Status === "Success") {
            toast.success("Úspěšné vložení inzerátu.");
            navigate('/');
          } else {
            toast.error(res.data.Error);
          }
        })
        .catch(error => console.log("Chyba při odesílání formuláře:", error));
    }
  };

  return (
    <>
      <div className='container '>
        <div>
          <form onSubmit={handleSubmit}>
            <div className='row' style={{ marginBottom: '50px' }}>
              <div className='text-center'>
                <h2>Inzerát</h2>
                <hr></hr>
              </div>
              <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                <label htmlFor='nazev' className='form-label'>Název</label>
                <input style={{ marginBottom: '20px' }} id='nazev' type='text' className='form-control' placeholder='Audi RS3 MATRIX'
                  onChange={e => setInzerat({ ...inzerat, nazev: e.target.value })}></input>
                <div className='row'>
                  <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-6'>
                    <label htmlFor='cena' className='form-label'>Cena</label>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                      <input id='cena' type='text' className='form-control' placeholder='1 999 000' onChange={e => setInzerat({ ...inzerat, cena: e.target.value })}></input>
                      <span className="input-group-text" style={{ backgroundColor: 'white' }}>Kč</span>
                    </div>
                  </div>
                  <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-6'>
                    <label htmlFor='stav' className='form-label'>Stav</label>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                      <select id='stav' type='text' className='form-select' defaultValue={''}
                        onChange={e => setInzerat({ ...inzerat, stav: e.target.value })}>
                        <option value='' disabled>Vyberte stav</option>
                        <option value="Aktivni">Aktivní</option>
                        <option value="Rezervovany">Rezervovaný</option>
                        <option value="Zruseny">Zrušený</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                <label htmlFor='popis' className='form-label'>Popis</label>
                <textarea style={{ marginBottom: '20px', height: '128px' }} id='popis' type='text' className="form-control" placeholder='Zde napiště svůj popis vozu, závady, co chcete přidat k vozu, výbavu atd.'
                  onChange={e => setInzerat({ ...inzerat, popis: e.target.value })}></textarea>
              </div>
            </div>
            <div className='row' style={{ marginBottom: '50px' }}>
              <div className='text-center'>
                <h2>Auto</h2>
                <hr></hr>
              </div>
              <h4>Výrobce</h4>
              <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                <label htmlFor='znacka' className='form-label'>Značka</label>
                <input style={{ marginBottom: '20px' }} id='znacka' type='text' className='form-control' placeholder='Audi'
                  onChange={e => setAuto({ ...auto, znacka: e.target.value })}></input>
              </div>
              <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                <label htmlFor='model' className='form-label'>Model</label>
                <input style={{ marginBottom: '20px' }} id='model' type='text' className='form-control' placeholder='RS3'
                  onChange={e => setAuto({ ...auto, model: e.target.value })}></input>
              </div>
            </div>
            <div className='row' style={{ marginBottom: '50px' }}>
              <h4>Typ Vozidla</h4>
              <div className='col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12'>
                <label htmlFor='karoserie' className='form-label'>Karoserie</label>
                <input style={{ marginBottom: '20px' }} id='karoserie' type='text' className='form-control' placeholder='Sportovní hatchback'
                  onChange={e => setAuto({ ...auto, karoserie: e.target.value })}></input>
              </div>
              <div className='col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12'>
                <label htmlFor='pocetDveri' className='form-label'>Počet Dveří</label>
                <input style={{ marginBottom: '20px' }} id='pocetDVeri' type='text' className='form-control' placeholder='3'
                  onChange={e => setAuto({ ...auto, pocetDveri: e.target.value })}></input>
              </div>
              <div className='col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12'>
                <label htmlFor='pocetSedadel' className='form-label'>Počet Sedadel</label>
                <input style={{ marginBottom: '20px' }} id='pocetSedadel' type='text' className='form-control' placeholder='5'
                  onChange={e => setAuto({ ...auto, pocetSedadel: e.target.value })}></input>
              </div>
            </div>
            <div className='row' style={{ marginBottom: '50px' }}>
              <h4>Specifikace</h4>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='najeto' className='form-label'>Najeto</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <input id='najeto' type='text' className='form-control' placeholder='125 000'
                    onChange={e => setSpecifikace({ ...specifikace, najeto: e.target.value })}></input>
                  <span className="input-group-text" style={{ backgroundColor: 'white' }}>Km</span>
                </div>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='barva' className='form-label'>Barva</label>
                <input style={{ marginBottom: '20px' }} id='barva' type='text' className='form-control' placeholder='Černá'
                  onChange={e => setSpecifikace({ ...specifikace, barva: e.target.value })}></input>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='rokVyroby' className='form-label'>Rok Výroby</label>
                <input style={{ marginBottom: '20px' }} id='rokVyroby' type='text' className='form-control' placeholder='2022'
                  onChange={e => setSpecifikace({ ...specifikace, rokVyroby: e.target.value })}></input>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='prevodovka' className='form-label'>Převodovka</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <select id='prevodovka' type='text' className='form-select' defaultValue={''}
                    onChange={e => setSpecifikace({ ...specifikace, prevodovka: e.target.value })}>
                    <option value='' disabled>Vyberte Převodovku</option>
                    <option value="Automatická">Automatická</option>
                    <option value="Manuální">Manuální</option>
                    <option value="Polo-automatická">Polo-automatická</option>
                  </select>
                </div>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='vykon' className='form-label'>Výkon</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <input id='vykon' type='text' className='form-control' placeholder='125'
                    onChange={e => setSpecifikace({ ...specifikace, vykon: e.target.value })}></input>
                  <span className="input-group-text" style={{ backgroundColor: 'white' }}>kW</span>
                </div>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='objem' className='form-label'>Objem</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <input id='objem' type='text' className='form-control' placeholder='2 480'
                    onChange={e => setSpecifikace({ ...specifikace, objem: e.target.value })}></input>
                  <span className="input-group-text" style={{ backgroundColor: 'white' }}>ccm</span>
                </div>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='palivo' className='form-label'>Palivo</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <select id='palivo' type='text' className='form-select' defaultValue={''}
                    onChange={e => setSpecifikace({ ...specifikace, palivo: e.target.value })}>
                    <option value='' disabled>Vyberte Palivo</option>
                    <option value="Benzín">Benzín</option>
                    <option value="Nafta">Nafta</option>
                    <option value="Elektro">Elektro</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='pohon' className='form-label'>Pohon</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <select id='pohon' type='text' className='form-select' defaultValue={''}
                    onChange={e => setSpecifikace({ ...specifikace, pohon: e.target.value })}>
                    <option value='' disabled>Vyberte Pohon</option>
                    <option value="Přední pohon">Přední pohon</option>
                    <option value="Zadní pohon">Zadní pohon</option>
                    <option value="Pohon všech kol">Pohon všech kol</option>
                  </select>
                </div>
              </div>
            </div>
            <div className='row' style={{ marginBottom: '50px' }}>
              <h4>VIN</h4>
              <div className='col-12'>
                <label htmlFor='vin' className='form-label'>Kód není povinný, je to ve vašem zájmu</label>
                <input id='vin' type='text' className='form-control' placeholder='TMBAEA200P0635724'
                  onChange={e => setSpecifikace({ ...specifikace, vin: e.target.value })}></input>
              </div>
            </div>
            <div className='row' style={{ marginBottom: '50px' }}>
              <div className='text-center'>
                <h2>Fotogalerie</h2>
                <hr></hr>
              </div>
              <div className='col-12 text-center'>
                <div className="col-12 text-center">
                  <div
                    className="drag-drop-area"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    style={{
                      border: '2px dashed #ccc',
                      padding: '20px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <p>Přetáhněte sem obrázky.</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                      id="fileInput"
                    />
                    <label htmlFor="fileInput" style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                      Klikněte pro zobrazení průzkumníka
                    </label>
                    {droppedFiles.length > 0 && (
                      <div>
                        <h5>Nahrané obrázky</h5>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                          {droppedFiles.map((file, index) => (
                            <li key={index} style={{ margin: '10px 0' }}>
                              {file.type.startsWith('image/') ? (
                                <div style={{ alignItems: 'center' }}>
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    width="100"
                                    style={{ marginRight: '10px' }}
                                  />
                                  <span>{file.name}</span>
                                  <button
                                    onClick={(event) => handleDelete(event, file)}
                                    style={{
                                      marginLeft: '10px',
                                      background: 'red',
                                      color: 'white',
                                      border: 'none',
                                      padding: '5px 10px',
                                      cursor: 'pointer',
                                      borderRadius: '5px',
                                    }}
                                  >
                                    Smazat
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <span>{file.name}</span>
                                  <button
                                    onClick={(event) => handleDelete(event, file)}
                                    style={{
                                      marginLeft: '10px',
                                      background: 'red',
                                      color: 'white',
                                      border: 'none',
                                      padding: '5px 10px',
                                      cursor: 'pointer',
                                      borderRadius: '5px',
                                    }}
                                  >
                                    Smazat
                                  </button>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='row justify-content-center'>
              <div className='mb-3 col-12 form-group'>
                <button type='submit' className='btn-border-radius-lg form-control btn btn-outline-secondary'>
                  Vložit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
