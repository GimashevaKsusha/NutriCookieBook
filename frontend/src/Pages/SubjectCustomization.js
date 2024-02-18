import React, { useEffect, useState } from 'react';
import './SubjectCustomization.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import SideMenu from '../Components/SideMenu';
import { useParsingInfo } from '../Components/useParsingInfo';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SetSubjectCategories(info, categories) {
    const container = document.getElementById("subject-categories-container");
    if (container !== null) {
        container.innerHTML = '';
    }
    for (let i = 0; i < categories.length; i++) {
        let textCategory = '<p class="subject-text-explanation">' + categories[i]["name"] + ' </p>';

        let textTag = '<p class="subject-text">' + categories[i]["tag"] + '</p>';
        let fieldTag = "";
        if (info.get(categories[i]["name"]) === undefined) {
            fieldTag = '<input id="tag-' + i + '" class="subject-field"></input>';
        }
        else {
             fieldTag = '<input id="tag-' + i + '" class="subject-field" value='
                + info.get(categories[i]["name"]).get("tag") + '></input>';
        }

        let textAttrProp = '<p class="subject-text">' + categories[i]["attr_prop"] + '</p>';
        let fieldAttrProp = "";
        if (info.get(categories[i]["name"]) === undefined) {
            fieldAttrProp = '<input id="attr-prop-' + i + '" class="subject-field"></input>';
        }
        else {
             fieldAttrProp = '<input id="attr-prop-' + i + '" class="subject-field" value='
                + info.get(categories[i]["name"]).get("attr_prop") + '></input>';
        }

        let textAttrValue = '<p class="subject-text">' + categories[i]["attr_value"] + '</p>';
        let fieldAttrValue = "";
        if (info.get(categories[i]["name"]) === undefined) {
            fieldAttrValue = '<input id="attr-value-' + i + '" class="subject-field"></input>';
        }
        else {
             fieldAttrValue = '<input id="attr-value-' + i + '" class="subject-field" value='
                + info.get(categories[i]["name"]).get("attr_value") + '></input>';
        }

        let textValue = '<p class="subject-text">' + categories[i]["value"] + '</p>';
        let fieldValue = "";
        if (info.get(categories[i]["name"]) === undefined) {
            fieldValue = '<input id="value-' + i + '" class="subject-field"></input>';
        }
        else {
             fieldValue = '<input id="value-' + i + '" class="subject-field" value='
                + info.get(categories[i]["name"]).get("value") + '></input>';
        }

        let subject = document.createElement('div');
        subject.innerHTML = textCategory + textTag + fieldTag +
                                textAttrProp + fieldAttrProp +
                                textAttrValue + fieldAttrValue +
                                textValue + fieldValue;

        container.append(subject);
    }
}

export default function SubjectCustomization() {
    const navigate = useNavigate();

    const info = useParsingInfo();
    const [categories, setCategories] = useState(new Map());

    const [mode, setMode] = useState({});

    useEffect(() => {
        async function loadSubjectCategories() {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/parsing/subjects/";
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
                        theme: info.get.get('theme')
                    }
                })
                setCategories(data.data);
            }
            catch(e) {
                if (e.message === 'Network Error')
                    navigate('/auth');
                else if (e.response.status === 403)
                    navigate('/auth');
                else if (e.response.status === 422) {
                    toast.warning("Параметры настройки парсера были стерты! Пожалуйста, введите новые параметры!");
                    setMode({pointerEvents: 'none'});
                    setTimeout(() => {
                        navigate('/parser_customization');
                    }, 2500);
                }
                else if (e.response.status === 500) {
                    toast.warning("Произошла ошибка при настройке парсера! Попробуйте еще раз!");
                    setMode({pointerEvents: 'none'});
                    setTimeout(() => {
                        navigate('/parser_customization');
                    }, 2500);
                }
            }
        }
        loadSubjectCategories();
    }, []);

    SetSubjectCategories(info.get, categories);

    const handleReturn = () => {
        const data = info.get;
        for (let i = 0; i < categories.length; i++) {
            let category = new Map();

            let tagText = document.getElementById("tag-" + i);
            category.set("tag", tagText.value.trim());

            let attrPropText = document.getElementById("attr-prop-" + i);
            category.set("attr_prop", attrPropText.value.trim());

            let attrValueText = document.getElementById("attr-value-" + i);
            category.set("attr_value", attrValueText.value.trim());

            let valueText = document.getElementById("value-" + i);
            category.set("value", valueText.value.trim());

            data.set(categories[i]["name"], category);
        }
        info.set(data);
        navigate('/parser_customization');
    }

    const handleSubmit = async() => {
        const data = info.get;
        for (let i = 0; i < categories.length; i++) {
            let category = new Map();

            let tagText = document.getElementById("tag-" + i);
            category.set("tag", tagText.value.trim());

            let attrPropText = document.getElementById("attr-prop-" + i);
            category.set("attr_prop", attrPropText.value.trim());

            let attrValueText = document.getElementById("attr-value-" + i);
            category.set("attr_value", attrValueText.value.trim());

            let valueText = document.getElementById("value-" + i);
            category.set("value", valueText.value.trim());

            data.set(categories[i]["name"], JSON.stringify(Array.from(category.entries())));
        }
        info.set(data);

        let result = "";
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/parsing/customize/";
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
                    theme: info.get.get('theme'),
                    data: JSON.stringify(Array.from(info.get.entries()))
                }
            })
            result = data.data;
        }
        catch(e){
            if (e.message === 'Network Error')
                navigate('/auth');
            else if (e.response.status === 403)
                navigate('/auth');
            else if (e.response.status === 422 || e.response.status === 500) {
                info.set(new Map());
                toast.warning("Произошла ошибка при настройке парсера! Попробуйте еще раз!");
                setMode({pointerEvents: 'none'});
                setTimeout(() => {
                    navigate('/parser_customization');
                }, 2500);
            }
            return;
        }
        navigate('/web_parsing/' + result);
    }

    const handleHint = () => {
        const container = document.getElementById("hint-image");
        if (container.innerHTML !== '') {
            container.innerHTML = '';
        }
        else {
            let textTag = '<p>На первом изображении выделен пример тегов в разметке HTML</p>';
            let imgTag = '<img alt="" src="/hint1.png"/>';
            let textClass = '<p>На втором изображении выделен пример классов в разметке HTML</p>';
            let imgClass = '<img alt="" src="/hint2.png"/>';
            container.innerHTML = textTag + imgTag + textClass + imgClass;
        }
    }

    return (
        <div style={mode}>
            <SideMenu page="parser_customization"/>
            <div className="subject-container">
                <div className='hint-button-container'>
                    <p className="hint-text-explanation">Воспользуйтесь подсказкой
                        в случае возникновения затруднений при заполнении полей на форме!</p>
                    <input type='button' className="hint-button" value='Показать подсказку' onClick={handleHint}/>
                    <div id="hint-image">
                    </div>
                </div>
                <div id="subject-categories-container">
                </div>
                <div className='subject-button-container'>
                    <input type='button' className="subject-button"
                        value='Вернуться назад' onClick={handleReturn}/>
                    <input type='button' className="subject-button"
                        value='Сохранить данные' onClick={handleSubmit}/>
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