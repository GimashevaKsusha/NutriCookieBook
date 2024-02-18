import React, { useEffect, useState } from 'react';
import './Tagging.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';
import ParsingTable from '../Components/ParsingTable';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Tagging() {
    const navigate = useNavigate();
    const location = useLocation();

    const [file, setFile] = useState(null);
    const [filename, setFilename] = useState('');

    const handleChange = (event) => {
        try {
            setFile(event.target.files[0]);
            setFilename(event.target.files[0].name);
        }
        catch(e) {
            navigate('/auth');
        }
    }

    const handleSubmit = async() => {
        /*try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/tagging/start/";
            const formData = new FormData();
            formData.append('file', file);
            let data =  await axios(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                },
                withCredentials: true,
                credentials: 'same-origin',
                data: formData
            })
            setFile(null);
            setFilename('');
            toast.success("Парсинг выполнен успешно!")
        }
        catch(e){
            if (e.message === 'Network Error')
                navigate('/auth');
            else if (e.response.status === 403)
                navigate('/auth');
            else if (e.response.status === 422)
                toast.error("Произошла ошибка! " + e.response.data.error);
            else if (e.response.status === 500)
                toast.error("Произошла ошибка во время парсинга! Попробуйте позже!");
        }*/
    }

    return (
        <div>
            <SideMenu page="tagged_values"/>
            <div className="tagging-container">
                <p className="tagging-text">Вы можете загрузить новую онтологию для тегов
                и запустить выполнение парсинга и сопоставления тегов и продуктов,
                информация о выполненном парсинге отображается в таблице</p>
                <div className="upload-tag-ontology-container">
                    <label className="upload-tag-ontology-label">
                        <input type="file" name="file" onChange={handleChange}/>
                        <span className="upload-tag-ontology-button">Выберите файл</span>
                    </label>
                    <p>Текущий файл: {filename}</p>
                    <input type='button' className="upload-tag-ontology-button"
                        value='Загрузить онтологию' onClick={handleSubmit}/>
                    <ParsingTable file={file}/>
                </div>
                <div className='tagging-button-container'>
                    <input type='button'
                        className="tagging-button"
                        value='Вернуться назад'
                        onClick={() => {navigate('/tagged_values',  { state: location.state })}}/>
                    <input type='button'
                        className="tagging-button"
                        value='Выполнить тегирование'/>
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