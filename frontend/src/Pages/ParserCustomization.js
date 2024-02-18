import React, { useEffect, useState } from 'react';
import './ParserCustomization.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import SideMenu from '../Components/SideMenu';
import { useParsingInfo } from '../Components/useParsingInfo';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function SetParsingThemes(info, themes) {
    const container = document.getElementById("radio-button-container1");
    if (container !== null) {
        container.innerHTML = '';
    }
    for (let i = 0; i < themes.length; i++) {
        let radioHtml = "";
        if (info.get('theme') == themes[i].id) {
            radioHtml = '<input type="radio" class="parser-radio-button" id="' + themes[i].id +
                '" name="radio1" value="' + themes[i].id + '" checked={true}>';
        }
        else {
            radioHtml = '<input type="radio" class="parser-radio-button" id="' + themes[i].id +
                '" name="radio1" value="' + themes[i].id + '" >';
        }
        let labelHtml = '<label htmlFor="' + themes[i].id  + '">' + themes[i].theme + '</label>';
        let radioButton = document.createElement('div')
        radioButton.innerHTML = radioHtml + labelHtml;
        container.append(radioButton);
    }
}

export default function ParserCustomization() {
    const navigate = useNavigate();

    const info = useParsingInfo();
    const [themes, setThemes] = useState([]);

    useEffect(() => {
        async function loadParsingTheme () {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/parsing/themes/";
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
                setThemes(data.data);
            }
            catch(e){
                navigate('/auth');
            }
        }
        loadParsingTheme();
    }, []);

    SetParsingThemes(info.get, themes);

    const handleSubmit = () => {
        let checkedTheme = null;
        for (let i = 0; i < themes.length; i++) {
            const theme = document.getElementById(themes[i].id);
            if (theme.checked) {
                checkedTheme = theme.id;
            }
        }
        if (checkedTheme === null) {
            toast.warning("Пожалуйста, выберите тематику сайта!");
            return;
        }
        const url = document.getElementById("url");
        if (url.value.trim() === '') {
            toast.warning("Пожалуйста, укажите URL сайта!");
            return;
        }
        const mainUrl = document.getElementById("main_url");
        if (mainUrl.value.trim() === '') {
            toast.warning("Пожалуйста, укажите URL страницы первого уровня!");
            return;
        }
        let checkedStructure = null;
        const singleStructure = document.getElementById("single");
        const multiStructure = document.getElementById("multi");
        if (singleStructure.checked) {
            checkedStructure = singleStructure.id;
        }
        if (multiStructure.checked) {
            checkedStructure = multiStructure.id;
        }
        if (checkedStructure === null) {
            toast.warning("Пожалуйста, выберите вариант представления данных на первом уровне!");
            return;
        }
        let data = info.get;
        data.set("theme", checkedTheme);
        data.set("structure", checkedStructure);
        data.set("url", url.value.trim());
        data.set("main_url", mainUrl.value.trim());
        info.set(data);
        navigate('/subject_customization');
    }

    return (
        <div>
            <SideMenu page="parser_customization"/>
            <div className="parser-container">
                <p className="parser-text-explanation">Вы можете настроить парсер на выбранный Вами сайт
                в одной из предложенных тематик, ответив на несколько вопросов<br/><br/>
                Внимание: выбранный Вами сайт должен иметь определенную структуру - двухуровневое представление данных
                (на первом уровне представлен список ссылок на второй уровень)<br/><br/>
                Например: первый уровень содержит список рецептов, тогда вторым уровнем будет конкретный рецепт</p>
                <p className="parser-text">Выберите тематику сайта:</p>
                <div id="radio-button-container1">
                </div>
                <p className="parser-text">Укажите URL сайта:</p>
                <input id="url" className="parser-field" defaultValue={info.get.get("url")}></input>
                <p className="parser-text">Укажите URL первого уровня (содержит список ссылок на второй уровень):</p>
                <input id="main_url" className="parser-field" defaultValue={info.get.get("main_url")}></input>
                <p className="parser-text">Укажите, как организованы данные на первом уровне:</p>
                <div id="radio-button-container2">
                    <div>
                        { info.get.get("structure") === "single" ?
                            <input type="radio" className="parser-radio-button" id="single"
                                name="radio2" value="single" defaultChecked={true}/> :
                            <input type="radio" className="parser-radio-button" id="single"
                                name="radio2" value="single"/>
                        }
                        <label htmlFor="single">на одной странице</label>
                    </div>
                    <div>
                        { info.get.get("structure") === "multi" ?
                            <input type="radio" className="parser-radio-button" id="multi"
                                name="radio2" value="multi" defaultChecked={true}/> :
                             <input type="radio" className="parser-radio-button" id="multi"
                                name="radio2" value="multi"/>
                        }
                        <label htmlFor="multi">на нескольких страницах
                            (есть счетчик страниц, информация динамически подгружается на страницу и т.д.)</label>
                    </div>
                </div>
                <div className='parser-button-container'>
                    <input type='button' className="parser-button"
                        value='Продолжить настройку' onClick={handleSubmit}/>
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