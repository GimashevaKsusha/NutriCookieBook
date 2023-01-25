import React from 'react';
import './Pages.css';


export default function MainPage() {
    return (
        <div id="main-page" className="container">
            <p className="textbox">
                Здравствуйте!
            </p>
            <p className="textbox">
                NutriCookieBook - это сервис, который поможет Вам узнать, в каких
                продуктах содержатся необходимые Вам питательные вещества и микроэлементы!
            </p>
            <img alt="" src="./image.png"/>
        </div>
    );
}