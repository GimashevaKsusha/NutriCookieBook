import React, { useEffect, useState } from 'react';
import './DataCollection.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

export default function DataCollection() {
    const navigate = useNavigate();

    const loadDataFromDB = async(table) => {
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/data_collection/" + table + "/";
            let data =  await axios(url, {
                method: 'GET',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
                withCredentials: true,
                credentials: 'same-origin'
            })
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([JSON.stringify(data.data)], {type: "application/json"}));
            link.setAttribute("download", table + ".json");
            link.click();
        }
        catch(e){
            navigate('/auth');
        }
    };

    const loadDeletedMappedValues = () => {
        loadDataFromDB("deleted_mapped_values")
    };

    const loadMappedIngredientValues = () => {
        loadDataFromDB("mapped_ingredient_values")
    };

    const loadMappingLogs = () => {
        loadDataFromDB("mapping_logs")
    };

    const loadTaggedIngredientStatuses = () => {
        loadDataFromDB("tagged_ingredient_statuses")
    };

    const loadTaggedIngredientValues = () => {
        loadDataFromDB("tagged_ingredient_values")
    };

    const loadReferenceIngredients = () => {
        loadDataFromDB("reference_ingredients")
    };

    const loadPrimaryIngredients = () => {
        loadDataFromDB("primary_ingredients")
    };

    const loadProducts = () => {
        loadDataFromDB("products")
    };

    return (
        <div>
            <SideMenu page="data_collection"/>
            <div className="data-collection-container">
                <p className="data-collection-text">
                    СБОР ДАННЫХ ИЗ ТАБЛИЦ БД В ФОРМАТЕ JSON
                </p>
                <div className='data-collection-button-container'>
                    <div>
                        <p>СКАЧАТЬ ТАБЛИЦУ УДАЛЕННЫХ СОПОСТАВЛЕННЫХ НАИМЕНОВАНИЙ</p>
                        <input type='button' className="data-collection-button"
                            value='main.deleted_mapped_values'
                            onClick={loadDeletedMappedValues}/>
                    </div>
                    <div>
                        <p>СКАЧАТЬ ТАБЛИЦУ СОПОСТАВЛЕННЫХ НАИМЕНОВАНИЙ</p>
                        <input type='button' className="data-collection-button"
                            value='main.mapped_ingredient_values'
                            onClick={loadMappedIngredientValues}/>
                    </div>
                    <div>
                        <p>СКАЧАТЬ ТАБЛИЦУ ЛОГОВ СОПОСТАВЛЕНИЯ</p>
                        <input type='button' className="data-collection-button"
                            value='main.mapping_logs'
                            onClick={loadMappingLogs}/>
                    </div>
                    <div>
                        <p>СКАЧАТЬ ТАБЛИЦУ «ПРОТЕГИРОВАННЫХ» ПУБЛИЧНЫХ НАИМЕНОВАНИЙ</p>
                        <input type='button' className="data-collection-button"
                            value='main.tagged_ingredient_statuses'
                            onClick={loadTaggedIngredientStatuses}/>
                    </div>
                    <div>
                        <p>СКАЧАТЬ ТАБЛИЦУ СВЯЗИ ПУБЛИЧНЫХ НАИМЕНОВАНИЙ С ТЕГАМИ</p>
                        <input type='button' className="data-collection-button"
                            value='main.tagged_ingredient_values'
                            onClick={loadTaggedIngredientValues}/>
                    </div>
                    <div>
                        <p>СКАЧАТЬ ТАБЛИЦУ СВЯЗИ ЭТАЛОННЫХ И ПУБЛИЧНЫХ НАИМЕНОВАНИЙ</p>
                        <input type='button' className="data-collection-button"
                            value='main.reference_ingredients'
                            onClick={loadReferenceIngredients}/>
                    </div>
                    <div>
                        <p>СКАЧАТЬ ТАБЛИЦУ ПУБЛИЧНЫХ НАИМЕНОВАНИЙ</p>
                        <input type='button' className="data-collection-button"
                            value='main.primary_ingredients'
                            onClick={loadPrimaryIngredients}/>
                    </div>
                    <div>
                        <p>СКАЧАТЬ ТАБЛИЦУ ЭТАЛОННЫХ НАИМЕНОВАНИЙ</p>
                        <input type='button' className="data-collection-button"
                            value='public.products'
                            onClick={loadProducts}/>
                    </div>
                </div>
            </div>
        </div>
    );
}