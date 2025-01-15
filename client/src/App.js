import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Search from './pages/Search';
import Cars from './pages/Cars';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import RestorePassword from './pages/RestorePassword';
import SingleCar from './pages/SingleCar';
import Favourites from './pages/Favourites';
import Add from './pages/Add';
import Notifications from './pages/Notifications';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Navbar />
      <Toaster position='bottom-right' toastOptions={{duration: 5000}}/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/notifications' element={<Notifications />}/>
        <Route path='/registration' element={<Registration />} />
        <Route path='/add' element={<Add />}/>
        <Route path='/login' element={<Login />} />
        <Route path='/search' element={<Search />} />
        <Route path='/cars' element={<Cars />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/favourites' element={<Favourites />}/>
        <Route path='/resetPassword' element={<ResetPassword />} />
        <Route path='/restorePassword/:id/:token' element={<RestorePassword/>}/>
        <Route path='/car/:id' element={<SingleCar/>}/>
      </Routes>
      <Footer />
    </>
  );
}

export default App;