import React, { useEffect, useState } from 'react';
import './BenchmarkIngredients.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function BenchmarkIngredients(params) {
    const navigate = useNavigate();
    const location = useLocation();

    const option = params.option;

    return (
        <div>
            <SideMenu page="benchmark_ingredients"/>
            <div className="benchmark-ingredients-container">
                <div className='benchmark-ingredients-button-container'>
                    <input type='button'
                        className="benchmark-ingredients-button"
                        value='Сохранить изменения'/>
                    <input type='button'
                        className="benchmark-ingredients-button"
                        value='Отменить изменения'
                        onClick={() => {navigate('/reference_ingredients/' + location.state.option,  { state: location.state })}}/>
                </div>
            </div>
            <ToastContainer
                style={{ width: "auto" }}
                position="top-center"
                autoClose={1500}
                limit={1}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
                theme="light"/>
        </div>
    );
}