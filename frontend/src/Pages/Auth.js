import React, { useRef } from 'react';
import './Auth.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useCheckedNutrients } from '../Components/useCheckedNutrients';
import { useCheckedTags } from '../Components/useCheckedTags';
import { useParsingInfo } from '../Components/useParsingInfo';
import { useMappingInfo } from '../Components/useMappingInfo';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Auth() {
    const navigate = useNavigate();

    const checkedNutrients = useCheckedNutrients();
    const checkedTags = useCheckedTags();
    const parsingInfo = useParsingInfo();
    const mappingInfo = useMappingInfo();

    localStorage.clear();

    const loginRef = useRef();
    const passwordRef = useRef();

    const UserAuthentication = async() => {
        const login = loginRef.current.value;
        const password = passwordRef.current.value;
        let grant_type = {
            'grant_type': '',
            'username': login,
            'password': password,
            'scope': '',
            'client_id': '',
            'client_secret': '',
        }
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/authentication/authentication/";
            let data =  await axios(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                withCredentials: true,
                credentials: 'same-origin',
                data: grant_type,
            })
            localStorage.setItem('access_token', data.data['access_token']);
            checkedNutrients.set([]);
            checkedTags.set([]);
            parsingInfo.set(new Map());
            mappingInfo.set(new Map());
            navigate('/account');
        }
        catch(e) {
            if (e.message === 'Network Error')
                toast.error("Произошла ошибка! Сервер не отвечает!");
            else if (e.response.status === 401)
                toast.error("Произошла ошибка! " + e.response.data.error);
            else if (e.response.status === 422)
                toast.error("Произошла ошибка! Логин и пароль не могут быть пустыми");
            else if (e.response.status === 500)
                toast.error("Произошла ошибка! Попробуйте позже!");
        }
    }

    const UserRegistration = async() => {
        const login = loginRef.current.value;
        const password = passwordRef.current.value;
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/authentication/registration/";
            let data =  await axios(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
                credentials: 'same-origin',
                params: {
                    login: login,
                    password: password,
                }
            })
            localStorage.setItem('access_token', data.data['access_token']);
            checkedNutrients.set([]);
            checkedTags.set([]);
            parsingInfo.set(new Map());
            mappingInfo.set(new Map());
            navigate('/account');
        }
        catch(e) {
            if (e.message === 'Network Error')
                toast.error("Произошла ошибка! Сервер не отвечает!");
            else if (e.response.status === 401)
                toast.error("Произошла ошибка! " + e.response.data.error);
            else if (e.response.status === 500)
                toast.error("Произошла ошибка! Попробуйте позже!");
        }
    }

    return (
        <div className="form-container">
            <p className="enter-text">Вход в приложение</p>
            <form className="auth-form">
                <input ref={loginRef} placeholder="Логин" className="auth-field"></input><br/>
                <input ref={passwordRef} type="password" placeholder="Пароль" className="auth-field"></input><br/>
                <input type='button' className="auth-button" value='Войти в систему' onClick={UserAuthentication}/><br/>
                <input type='button' className="auth-button" value='Зарегистрироваться' onClick={UserRegistration}/><br/>
            </form>
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