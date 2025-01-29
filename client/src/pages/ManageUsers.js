import React from 'react'
import CheckAuth from '../functions/checkAuthAdmin';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import User from '../components/User.js';
import toast from 'react-hot-toast';
import axios from 'axios';


export default function ManageUsers() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        CheckAuth(navigate).then(() => {
            setLoading(false);
        });
    }, [navigate]);

    useEffect(() => {
        axios.get(`http://localhost:3001/userList`, { withCredentials: true })
            .then(res => {
                if (res.data.Status === "Success") {
                    setUsers(res.data.users)
                    setFilteredUsers(res.data.users);
                }
            })
            .catch(error => {
                toast.error("Došlo k chybě při náčítání uživatelů. " + error);
            });
    }, [])

    useEffect(() => {
        const results = users.filter(user =>
            `${user.jmeno} ${user.prijmeni}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    if (loading) {
        return <></>;
    }
    return (

        <div className='container text-center'>
            <h2>Správa Uživatelů</h2>
            <hr></hr>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Vyhledat uživatele podle jména..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="row g-3">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <div className="col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-6" key={user.id}>
                            <User user={user} />
                        </div>
                    ))
                ) : (
                    <p>Žádní uživatelé nenalezeni.</p>
                )}
            </div>
        </div>
    )
}
