import React, { useEffect, useState } from 'react';
import './OntologySelection.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function SetOntologyFiles(onto) {
    const container = document.getElementById("ontology-radio-button-container");
    if (container !== null) {
        container.innerHTML = '';
    }
    for (let i = 0; i < onto.length; i++) {
        let radioHtml = '<input type="radio" class="ontology-radio-button" id="' + onto[i].id +
            '" name="onto-radio" value="' + onto[i].id + '" >';
        let labelHtml = '<label htmlFor="' + onto[i].id  + '">' + onto[i].filename + '</label>';
        let radioButton = document.createElement('div')
        radioButton.innerHTML = radioHtml + labelHtml;
        container.append(radioButton);
    }
}

export default function OntologySelection() {
    const navigate = useNavigate();

    const [onto, setOnto] = useState([]);

    useEffect(() => {
        async function loadOntologyFiles() {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/parsing/sessions/";
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
                setOnto(data.data);
            }
            catch(e){
                navigate('/auth');
            }
        }
        loadOntologyFiles();
    }, []);

    SetOntologyFiles(onto);

    const handleSubmit = () => {
        let checkedOnto = null;
        for (let i = 0; i < onto.length; i++) {
            const onto_selection = document.getElementById(onto[i].id);
            if (onto_selection.checked) {
                checkedOnto = onto_selection.id;
            }
        }
        if (checkedOnto === null) {
            toast.warning("Чтобы продолжить парсинг, Вам необходимо выбрать онтологию!");
            return;
        }
        navigate('/web_parsing/' + checkedOnto);
    }

    return (
        <div>
            <SideMenu page="ontology_selection"/>
            <div className="selection-container">
                <p className="selection-text-explanation">
                    Вы можете выбрать одну из онтологий,
                    которые были получены в результате
                    настройки парсера на новый сайт<br/><br/>
                    После выбора Вы сможете при необходимости
                    скачать файл онтологии, файл БД или запустить парсинг
                    на основе выбранной онтологии
                </p>
                <div id="ontology-radio-button-container">
                </div>
                <div className='selection-button-container'>
                    <input type='button' className="selection-button"
                        value='Выбрать онтологию' onClick={handleSubmit}/>
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