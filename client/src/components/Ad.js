import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Ad({ ad }) {

  const handleDelete = async (adId, fk_auto, e) => {
    e.preventDefault();

    const isConfirmed = window.confirm('Oprvadu chcete tento inzerát smazat?');
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:3001/ad/${adId}/${fk_auto}`, { withCredentials: true });
      if (response.data.Status === 'Success') {
        window.location.reload();
        toast.success('Inzerát úspěšně smazán.');
      } else {
        toast.error(response.data.Error);
      }
    } catch (error) {
      toast.error('Chyba při mazání inzerátu.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0'); // Den
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Měsíc (měsíce jsou od 0)
    const year = date.getFullYear(); // Rok
    return `${day}. ${month}. ${year}`;
  };

  return (
    <Link to={`/car/${ad.id}`} style={{ textDecoration: 'none', color: 'inherit'}}>
      <div className="card mb-3" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '15px' }}>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
          <h5 className="card-title fw-bold">{ad.nazev}</h5>
          <img alt='auto' className='img-fluid' src={ad.obrazek}></img>
          <h6 className="card-text" style={{ color: ad.stav === 'Aktivní' ? 'green' : ad.stav === 'Rezervovaný' ? 'orange' : ad.stav === 'Zrušený' ? 'red' : 'black' }}><span className='fw-bold' style={{color: 'black'}}>Stav: </span>{ad.stav}</h6>
          <h6 className="card-text"><span className='fw-bold' style={{color: 'black'}}>Inzerent: </span> {ad.jmeno} {ad.prijmeni}</h6>
          <h6 className="card-text"><span className='fw-bold' style={{color: 'black'}}>Email: </span> {ad.email}</h6>
          <h6 className="card-text">
            <span className='fw-bold' style={{color: 'black'}}>Datum vytvoření: </span> {formatDate(ad.datum_vytvoreni)}
          </h6>
          <h6 className="card-text">
            <span className='fw-bold' style={{color: 'black'}}>Datum aktualizace: </span> {formatDate(ad.datum_aktualizace)}
          </h6>
          <div className="d-flex justify-content-between">
            <button style={{ width: '100%' }} className="btn btn-danger" onClick={(e) => handleDelete(ad.id, ad.fk_auto, e)}>
              Smazat
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
