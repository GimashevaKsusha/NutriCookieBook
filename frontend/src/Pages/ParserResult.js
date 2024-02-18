import React, { useEffect, useState } from 'react';
import './ParserResult.css';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import RecipesTable from '../Components/RecipesTable';
import SideMenu from '../Components/SideMenu';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function ParserResult(params) {
    let { session } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState([]);

    let par = params.par;

    useEffect(() => {
        async function getParsingResult() {
            try {
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/parsing/current_result/";
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
                    params: {
                        id: session,
                    }
                })
                setResult(data.data);
            }
            catch(e){
                if (e.response.status === 403)
                    navigate('/auth');
                else if (e.response.status === 500)
                    toast.error("Произошла ошибка! Нет доступа к результатам парсинга!");
            }
        }
        getParsingResult();
    }, []);

    return (
        <div>
            <SideMenu current_page="ontology_selection"/>
            <div className="result-container">
                 <div className='result-button-container'>
                    <input type='button' className="result-button"
                        value='Вернуться назад' onClick={() => navigate('/web_parsing/' + session)}/>
                </div>
                <table id="result-table">
                    <tbody>
                        {result.map((row, i) => {
                        return (
                            <tr className="result-row">
                                <td className="result-number">{i + 1}</td>
                                {result[i].map((row, j) => {
                                    return (
                                        <tr className="result-field">
                                            <td>{row}</td>
                                        </tr>
                                        )
                                    })
                                }
                            </tr>
                        )
                        })}
                    </tbody>
                </table>
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