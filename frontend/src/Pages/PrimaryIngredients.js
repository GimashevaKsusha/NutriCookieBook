import React, { useEffect, useState } from 'react';
import './PrimaryIngredients.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

import TextField from '@mui/material/TextField';
import Popper from '@mui/material/Popper';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PrimaryIngredients(params) {
    const navigate = useNavigate();
    const location = useLocation();

    const option = params.option;

    const [benchmarkIngredients, setBenchmarkIngredients] = useState([]);
    const [selectedBenchmarkIngredients, setSelectedBenchmarkIngredients] = useState([]);

    /*useEffect(() => {
        async function loadBenchmarkIngredients() {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/multiple_listing/unadapted_benchmark_ingredients/";
                let data =  await axios(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                    },
                    withCredentials: true,
                    credentials: 'same-origin',
                })
                setBenchmarkIngredients(data.data);
                if (option === 'update') {
                    const value = location.state.checkedMappedValues.primary_ingredient;
                    setSelectedPrimaryIngredients(data.data.find(item => item.label === value));
                }
            }
            catch(e){
                navigate('/auth');
            }
        }
        loadBenchmarkIngredients();
    }, []);*/

    return (
        <div>
            <SideMenu page="reference_ingredients"/>
            <div className="primary-ingredients-container">
                <div className="primary-ingredients-title-container">
                    <p className="primary-ingredients-text">
                        Укажите публичное наименование ингредиента:
                    </p>
                    <input
                        id="title"
                        className="primary-ingredients-field"
                        defaultValue={option === "update" ? location.state.selectedPrimaryIngredientsName : ''}/>
                    <p className="primary-ingredients-text">
                        Укажите эталонные наименования ингредиентов,
                        на основе которых создается публичное наименование:
                    </p>
                </div>
                <div className='primary-ingredients-button-container'>
                    <input type='button'
                        className="primary-ingredients-button"
                        value='Сохранить изменения'/>
                    <input type='button'
                        className="primary-ingredients-button"
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