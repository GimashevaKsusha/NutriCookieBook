import React, { useEffect, useState } from 'react';
import './Account.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

export default function Account() {
    const navigate = useNavigate();
    const [user, setUser] = useState({'user_name': '', 'user_role': ''});
    useEffect(() => {
        async function getUserInfo() {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/authentication/user_info/";
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
                setUser(data.data);
                localStorage.setItem('user_role', data.data['user_role']);
            }
            catch(e){
                navigate('/auth');
            }
        }
        getUserInfo();
    }, []);

    return (
        <div>
            <SideMenu page="account"/>
            <div className="account-container">
                <div className='account-text-container'>
                    <p className="account-text">УЧЕТНАЯ ЗАПИСЬ ПОЛЬЗОВАТЕЛЯ В ПРИЛОЖЕНИИ NUTRICOOKIEBOOK</p>
                    <p className='user-info-text'>ЛОГИН: {user['user_name']}</p>
                    <p className='user-info-text'>РОЛЬ: {user['user_role']}</p>
                </div>
                <div className='account-button-container'>
                    <input type='button'
                        className="account-exit-button"
                        value='Выйти'
                        onClick={() => navigate('/auth')}/>
                </div>
            </div>
        </div>
    );
}