import React, { useEffect, useState } from 'react';
import './WebParsing.css';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import SideMenu from '../Components/SideMenu';
import { useParsingInfo } from '../Components/useParsingInfo';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function WebParsing(params) {
    let { session } = useParams();
    const navigate = useNavigate();

    const info = useParsingInfo();
    const [filename, setFilename] = useState("");

    const [mode, setMode] = useState({});

    useEffect(() => {
        async function loadFilename() {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/parsing/current_session/";
                let data =  await axios(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    withCredentials: true,
                    credentials: 'same-origin',
                    params: {
                        id: session
                    }
                })
                setFilename(data.data);
                info.set(new Map());
            }
            catch(e){
                navigate('/auth');
            }
        }
        loadFilename();
    }, []);

    const startParsing = async() => {
        const currentToast = toast.loading("Выполняется парсинг! Пожалуйста, подождите...");
        setMode({pointerEvents: 'none'});

        let url = process.env.REACT_APP_ENDPOINT + "/api/v1/parsing/start/";
        let data =  await axios(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                filename: filename
            }
        })
        .then(res => {
            toast.update(currentToast, {
                render: res.data,
                type: "success",
                isLoading: false,
                autoClose: 5000,
                closeOnClick: true
            });
            setMode({});
        })
        .catch(err => {
            if (err.message === 'Network Error')
                navigate('/auth');
            else if (err.response.status === 403)
                navigate('/auth');
            else if (err.response.status === 422)
                 toast.update(currentToast, {
                    render: "Произошла ошибка! Попробуйте позже!",
                    type: "error",
                    isLoading: false,
                    autoClose: 5000,
                    closeOnClick: true
                });
            else if (err.response.status === 500)
                toast.update(currentToast, {
                    render: "Произошла ошибка! Попробуйте позже!",
                    type: "error",
                    isLoading: false,
                    autoClose: 5000,
                    closeOnClick: true
                });
            return;
        });
    }

    const loadOntology = async() => {
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/parsing/current_ontology/";
            let data =  await axios(url, {
                method: 'GET',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
                withCredentials: true,
                credentials: 'same-origin',
                params: {
                    id: session
                }
            })
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([JSON.stringify(data.data)], {type: "application/json"}));
            link.setAttribute("download", filename);
            link.click();
        }
        catch(e){
            navigate('/auth');
        }
    }

    const loadDB = async() => {
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/parsing/current_database/";
            let data =  await axios(url, {
                method: 'GET',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
                withCredentials: true,
                credentials: 'same-origin',
                params: {
                    id: session
                }
            })
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([data.data], {type: 'text/plain'}));
            link.setAttribute("download", filename.replace(".ont", ".sql"));
            link.click();
        }
        catch(e){
            navigate('/auth');
        }
    }

    return (
        <div style={mode}>
            <SideMenu page="ontology_selection"/>
            <div className="web-parsing-container">
                <p className="web-parsing-explanation">Настройка парсера на новый сайт успешно выполнена!<br/><br/>
                Теперь Вы можете запустить парсер, а также скачать файл с онтологией, ориентированной
                на выбранный Вами сайт, и файл c БД, полученной в результате работы парсера</p>
                <p className="web-parsing-text">Текущая онтология: {filename}</p>
                <div className='web-parsing-button-container'>
                    <input type='button' className="web-parsing-button"
                        value='Запустить парсер' onClick={startParsing}/>
                    <input type='button' className="web-parsing-button"
                        value='Посмотреть результат' onClick={() => navigate('/parser_result/' + session)}/><br/>
                    <input type='button' className="web-parsing-button"
                        value='Скачать файл с онтологией' onClick={loadOntology}/>
                    <input type='button' className="web-parsing-button"
                        value='Скачать скрипт БД' onClick={loadDB}/>
                    <input type='button' className="web-parsing-button"
                        value='Вернуться назад' onClick={() => navigate('/ontology_selection')}/>
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