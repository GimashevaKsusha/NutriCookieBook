import React, { useEffect, useState } from 'react';
import './MappedValuesRedaction.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

import TextField from '@mui/material/TextField';
import Popper from '@mui/material/Popper';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StyledAutocomplete = styled(Autocomplete)({
    width: 'auto',
    margin: `60px`,
});

const StyledTextField = styled(TextField)({
    backgroundColor: '#E9FFFA',
    borderBottom: `5px solid #6C5F5B`,
    '& label, label.Mui-focused': {
        color: '#6C5F5B',
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: 0,
        '&.Mui-focused fieldset, fieldset, :hover fieldset': {
            border: `2px solid #6C5F5B`,
        },
    },
    '&:hover, .MuiOutlinedInput-root.Mui-focused': {
        backgroundColor: '#DAC3B3',
    },
});

export default function MappedValuesRedaction(params) {
    const navigate = useNavigate();

    const [practicalIngredients, setPracticalIngredients] = useState([]);
    const [primaryIngredients, setPrimaryIngredients] = useState([]);

    const [selectedPracticalIngredients, setSelectedPracticalIngredients] = useState(null);
    const [selectedPrimaryIngredients, setSelectedPrimaryIngredients] = useState(null);

    const [mode, setMode] = useState({});

    const option = params.option;
    const location = useLocation();

    useEffect(() => {
        async function loadPracticalIngredients () {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/multiple_listing/practical_ingredients/";
                let data =  await axios(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                    },
                    withCredentials: true,
                    credentials: 'same-origin'
                })
                setPracticalIngredients(data.data);
                if (option === 'update') {
                    const value = location.state.checkedMappedValues.practical_ingredient;
                    setSelectedPracticalIngredients(data.data.find(item => item.label === value));
                }
            }
            catch(e){
                navigate('/auth');
            }
        }
        loadPracticalIngredients();
    }, []);

    useEffect(() => {
        async function loadPrimaryIngredients () {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/multiple_listing/primary_ingredients/";
                let data =  await axios(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                    },
                    withCredentials: true,
                    credentials: 'same-origin'
                })
                setPrimaryIngredients(data.data);
                if (option === 'update') {
                    const value = location.state.checkedMappedValues.primary_ingredient;
                    setSelectedPrimaryIngredients(data.data.find(item => item.label === value));
                }
            }
            catch(e){
                navigate('/auth');
            }
        }
        loadPrimaryIngredients();
    }, []);

    const handleSavingMappedValues = async() => {
        if (selectedPracticalIngredients === null || selectedPrimaryIngredients === null) {
            toast.warning("Необходимо выбрать пару значений из публичных наименований и наименований ингредиентов из рецепта!");
            return;
        }
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/mapped_values/";
            if (option === 'update')
                url = url + "update/";
            else
                url = url + "create/";
            let data = await axios(url, {
                method: option === 'update' ? 'PUT' : 'POST',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                },
                withCredentials: true,
                credentials: 'same-origin',
                params: option === "update" ? {
                    value_id: location.state.checkedMappedValues.id,
                    ingredient_id: selectedPracticalIngredients.id,
                    primary_id: selectedPrimaryIngredients.id,
                } : {
                    ingredient_id: selectedPracticalIngredients.id,
                    primary_id: selectedPrimaryIngredients.id,
                },
            })
            setMode({pointerEvents: 'none'});
            toast.success(data.data.result);
            setTimeout(() => {
                navigate('/mapped_values/' + location.state.option,  { state: location.state });
            }, 2500);
        }
        catch(e){
            if (e.message === 'Network Error')
                navigate('/auth');
            else if (e.response.status === 403)
                navigate('/auth');
            else if (e.response.status === 422) {
                toast.error("Произошла ошибка! " + e.response.data.error);
                return;
            }
            else if (e.response.status === 500) {
                toast.error("Произошла ошибка! Попробуйте позже!");
                return;
            }
        }
    }

    return (
        <div style={mode}>
            <SideMenu page="mapped_values"/>
            <div className="mapped-values-redaction-container">
                <p className="mapped-values-redaction-text">
                    При добавлении или редактировании сопоставленных наименований ингредиентов
                    необходимо выбрать значения из представленных списков
                    и сохранить внесенные изменения с отметкой «проверено»
                    <br/><br/>
                    При отмене изменения отметка «проверено» не будет выставлена
                </p>
                <p className="mapped-values-redaction-title">
                    {option === 'create' ?
                        'ДОБАВЛЕНИЕ ПАРЫ СОПОСТАВЛЕННЫХ НАИМЕНОВАНИЙ' :
                        'РЕДАКТИРОВАНИЕ ПАРЫ СОПОСТАВЛЕННЫХ НАИМЕНОВАНИЙ '}
                </p>
                <div>
                    <StyledAutocomplete
                        id="practical_ingredients"
                        disablePortal
                        options={practicalIngredients}
                        value={selectedPracticalIngredients || null}
                        noOptionsText={'Ингредиент не найден'}
                        PopperComponent={
                            (props) =>
                                <Popper {...props} style={{textAlign: "left", width: "calc(100% - 500px)"}}/>}
                        renderInput={
                            (params) =>
                                <StyledTextField {...params} label="Наименование ингредиента из рецепта"/>}
                        onChange={(event, value) => setSelectedPracticalIngredients(value)}/>
                    <StyledAutocomplete
                        id="primary_ingredients"
                        disablePortal
                        options={primaryIngredients}
                        value={selectedPrimaryIngredients || null}
                        noOptionsText={'Ингредиент не найден'}
                        PopperComponent={
                            (props) =>
                                <Popper {...props} style={{textAlign: "left", width: "calc(100% - 500px)"}}/>}
                        renderInput={
                            (params) =>
                                <StyledTextField {...params} label="Публичное наименование ингредиента"/>}
                        onChange={(event, value) => setSelectedPrimaryIngredients(value)}/>
                </div>
                <div className='mapped-values-redaction-button-container'>
                    <input type='button'
                        className="mapped-values-redaction-button"
                        value='Сохранить с отметкой «проверено»'
                        onClick={handleSavingMappedValues}/>
                    <input type='button'
                        className="mapped-values-redaction-button"
                        value='Отменить изменения'
                        onClick={() => {navigate('/mapped_values/' + location.state.option,  { state: location.state })}}/>
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