import React from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'

export default function SingleCar() {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 768px)' });
  const { id } = useParams();
  const [carData, setCarData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [auth, jePrihlasen] = useState(false);

  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1);
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
        await axios.post('http://localhost:3001/favor', { carId: carData.id, cena: carData.cena }, { withCredentials: true });
        toast.success(`${carData.inzerat_nazev} byl přidán do oblíbených.`);
      } else {
        await axios.delete(`http://localhost:3001/favor/${carData.id}`, { withCredentials: true });
        toast.success(`${carData.inzerat_nazev} byl odebrán z oblíbených.`);
      }
      setIsFavourite(!isFavourite);
    } catch (err) {
      console.error("Error updating favourites:", err);
    }
  };


  useEffect(() => {
    axios.get(`http://localhost:3001/car/${id}`)
      .then(res => {
        if (res.data.Status === "Success") {
          setCarData(res.data.result);
          setImages(res.data.result.obrazky);
        } else {
          toast.error(res.data.Error)
        }
      })
      .catch(error => {
        toast.error("Došlo k chybě při náčítání inzerátu.");
      });
  }, [id]);

  useEffect(() => {
    if (carData) {
      axios.get('http://localhost:3001/profile', { withCredentials: true })
        .then(res => {
          if (res.data.Status === "Success") {
            jePrihlasen(true);
            axios.get(`http://localhost:3001/singleFavourite/${carData.id}`, { withCredentials: true })
              .then(res => {
                if (res.data.Status === "Success") {
                  setIsFavourite(true);
                } else {
                  setIsFavourite(false);
                }
              })
              .catch(err => {
                console.error("Chyba při kontrole oblíbeného inzerátu:", err);
              });
          } else {
            jePrihlasen(false);
          }
        })
        .catch(err => {
          console.error("Chyba při ověřování profilu:", err);
        });
    }
  }, [carData]);

  const renderSpecification = (name, data, color) => (
    <div className='col-11 col-xxl-11 col-xl-11 col-lg-11 col-md-11 col-sm-11 d-flex justify-content-between align-items-center' style={{ backgroundColor: color, height: '40px' }}>
      <span className='fw-bold'>{name}</span>
      <span className='fw-bold'>{data}</span>
    </div>
  );

  if (!carData) {
    return <div>Načítání...</div>;
  }


  const handleImageClick = (index) => {
    setIsOpen(true); // Otevře lightbox
    setCurrentImageIndex(index);
  };

  return (
    <>
      <div className='container'>
        <div className='row'>
          <div className='col col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12'>
            <h6 onClick={handleGoBack} style={{ cursor: 'pointer' }}>&lt; Zpět</h6>
          </div>
        </div>
        <div className='row' style={{ marginBottom: '30px' }}>
          <div className='col-6 col-xxl-7 col-xl-7 col-lg-7 col-md-7 col-sm-7' style={{ textAlign: "left" }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', // Dynamická velikost mezi 1rem a 2rem
            }}>{carData.inzerat_nazev}<span style={{ color: carData.stav === 'Aktivní' ? 'green' : carData.stav === 'Rezervovaný' ? 'orange' : carData.stav === 'Zrušený' ? 'red' : 'black' }}> - {carData.stav}</span></h2>
          </div>
          <div className='col-6 col-xxl-5 col-xl-5 col-lg-5 col-md-5 col-sm-5 d-flex align-items-center justify-content-end gap-3' style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', }}>{Number(carData.cena).toLocaleString('cs-CZ')} Kč</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fillRule="currentColor" className="bi bi-heart" viewBox="0 0 16 16" fill={isFavourite ? "red" : "currentColor"} onClick={handleHeartClick} style={{ cursor: 'pointer' }}>
              <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
            </svg>
          </div>
        </div>
        <div className='row' style={{ marginBottom: '30px' }}>
          <div className='col col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 d-flex justify-content-center'>
            <img
              src={images[0]}
              alt="Car"
              style={{ width: '75%', cursor: 'pointer' }}
              onClick={() => handleImageClick(0)}
            />
          </div>
        </div>
        {isOpen && (
          <Lightbox
            mainSrc={images[currentImageIndex]} // Hlavní obrázek v lightboxu
            nextSrc={images[(currentImageIndex + 1) % images.length]} // Další obrázek
            prevSrc={images[(currentImageIndex + images.length - 1) % images.length]} // Předchozí obrázek
            onCloseRequest={() => setIsOpen(false)} // Zavření lightboxu
            onMovePrevRequest={() => setCurrentImageIndex((currentImageIndex + images.length - 1) % images.length)}
            onMoveNextRequest={() => setCurrentImageIndex((currentImageIndex + 1) % images.length)}
          />
        )}
        <div className='row' style={{ marginBottom: '30px' }}>
          <div className='col col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 d-flex flex-column justify-content-center align-items-center'>
            <h2>Specifikace Vozu</h2>
            <hr style={{ width: '100%' }}></hr>
          </div>
        </div>
        <div className='row d-flex justify-content-center align-items-center' style={{ marginBottom: '30px' }}>
          <div className='col col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12'>
            <div className='row d-flex justify-content-center align-items-center'>
              {renderSpecification('Značka', carData.znacka_nazev, 'lightgray')}
              {renderSpecification('Model', carData.model_nazev, 'white')}
              {renderSpecification('Karoserie', carData.karoserie, 'lightgray')}
              {renderSpecification('Palivo', carData.palivo, 'white')}
              {renderSpecification('Pohon Kol', carData.pohon, 'lightgray')}
              {renderSpecification('Převodovka', carData.prevodovka, 'white')}
              {renderSpecification('Počet Dveří', carData.pocet_dveri, 'lightgray')}
            </div>
          </div>
          <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12'>
            <div className='row d-flex justify-content-center align-items-center'>
              {isSmallScreen ? (
                <>
                  {renderSpecification('Barva', carData.barva, 'white')}
                  {renderSpecification('Rok Výroby', carData.rok_vyroby, 'lightgray')}
                  {renderSpecification('Nájezd', `${new Intl.NumberFormat('cs-CZ').format(carData.najete_km)} km`, 'white')}
                  {renderSpecification('Výkon', `${carData.vykon_kw.toLocaleString()} kW (${Math.round(carData.vykon_kw * 1.341)} ps)`, 'lightgray')}
                  {renderSpecification('Objem', `${new Intl.NumberFormat('cs-CZ').format(carData.objem)} ccm`, 'white')}
                  {carData.vin ? renderSpecification('VIN', carData.vin, 'lightgray') : renderSpecification('VIN', '-', 'lightgray')}
                  {renderSpecification('Počet Sedadel', carData.pocet_sedadel, 'white')}
                </>
              ) : (
                <>
                  {renderSpecification('Barva', carData.barva, 'lightgray')}
                  {renderSpecification('Rok Výroby', carData.rok_vyroby, 'white')}
                  {renderSpecification('Nájezd', `${new Intl.NumberFormat('cs-CZ').format(carData.najete_km)} km`, 'lightgray')}
                  {renderSpecification('Výkon', `${carData.vykon_kw.toLocaleString()} kW (${Math.round(carData.vykon_kw * 1.341)} ps)`, 'white')}
                  {renderSpecification('Objem', `${new Intl.NumberFormat('cs-CZ').format(carData.objem)} ccm`, 'lightgray')}
                  {carData.vin ? renderSpecification('VIN', carData.vin, 'white') : renderSpecification('VIN', '-', 'white')}
                  {renderSpecification('Počet Sedadel', carData.pocet_sedadel, 'lightgray')}
                </>
              )}
            </div>
          </div>
        </div>
        <div className='row d-flex justify-content-center align-items-start' style={{ marginBottom: '30px' }}>
          <div className='col col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12'>
            <div className='row d-flex justify-content-center align-items-center'>
              <div className='col-11 col-xxl-11 col-xl-11 col-lg-11 col-md-11 col-sm-11 d-flex flex-column justify-content-between align-items-center'>
                <h2>Prodávající</h2>
                <hr style={{ marginBottom: '30px', width: '100%' }}></hr>
                <h5 style={{ marginBottom: '15px' }}>{carData.jmeno} {carData.prijmeni}</h5>
                <h5 style={{ marginBottom: '15px' }}>{carData.kraj} kraj, {carData.mesto}</h5>
                <h5 style={{ marginBottom: '15px' }}>{carData.telefon}</h5>
                <h5 style={{ marginBottom: '15px' }}>{carData.email}</h5>
              </div>
            </div>
          </div>
          <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12'>
            <div className='row d-flex justify-content-center align-items-center'>
              <div className='col-11 col-xxl-11 col-xl-11 col-lg-11 col-md-11 col-sm-11 d-flex flex-column justify-content-between align-items-center'>
                <h2>Popis Vozu</h2>
                <hr style={{ marginBottom: '30px', width: '100%' }}></hr>
                <p className='text-center'>{carData.popis}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
