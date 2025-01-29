import React, { useState, useEffect } from 'react';
import CheckAuth from '../functions/checkAuthAdmin';
import { useNavigate } from 'react-router-dom';
import Ad from '../components/Ad';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ManageAds() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [ads, setAds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAds, setFilteredAds] = useState([]);

    useEffect(() => {
        CheckAuth(navigate).then(() => {
            setLoading(false);
        });
    }, [navigate]);

    useEffect(() => {
        axios.get('http://localhost:3001/adList', { withCredentials: true })
            .then(res => {
                if (res.data.Status === 'Success') {
                    setAds(res.data.ads);
                    setFilteredAds(res.data.ads);
                }
            })
            .catch(error => {
                toast.error('Došlo k chybě při načítání inzerátů: ' + error);
            });
    }, []);

    useEffect(() => {
        const results = ads.filter(ad =>
            ad.nazev.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredAds(results);
    }, [searchTerm, ads]);

    if (loading) {
        return <></>;
    }

    return (
        <div className="container text-center">
            <h2>Správa Inzerátů</h2>
            <hr />
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Vyhledat inzeráty podle názvu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="row g-3">
                {filteredAds.length > 0 ? (
                    filteredAds.map(ad => (
                        <div className="col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-6" key={ad.id}>
                            <Ad ad={ad} />
                        </div>
                    ))
                ) : (
                    <p>Žádné inzeráty k zobrazení.</p>
                )}
            </div>
        </div>
    );
}