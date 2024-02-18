import './ParsingTable.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function ParsingTable(params) {
    const file = params.file;
    const navigate = useNavigate();

    const [status, setStatus] = useState([])

    useEffect(() => {
        async function loadParsingStatus () {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/tagging/sessions/";
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
                setStatus(data.data);
            }
            catch(e){
                navigate('/auth');
            }
        }
        loadParsingStatus();
    }, [file]);

    return (
        <table id="parsing-table">
            <thead>
                <tr>
                    <th>Дата загрузки</th>
                    <th>Название онтологии</th>
                </tr>
            </thead>
            <tbody>
                { status.length !== 0 ?
                    status.map((row, i) => {
                        return (
                            <tr key={i} >
                                <td>{row.datetime}</td>
                                <td>{row.filename}</td>
                            </tr>
                        )
                    }) :
                    <tr>
                        <td> </td>
                        <td> </td>
                    </tr>
                }
            </tbody>
        </table>
    );
}