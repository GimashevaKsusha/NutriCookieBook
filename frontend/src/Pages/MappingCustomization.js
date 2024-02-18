import React from 'react';
import './MappingCustomization.css';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';
import { useMappingInfo } from '../Components/useMappingInfo';


export default function MappingCustomization() {
    const navigate = useNavigate();
    const location = useLocation();

    const info = useMappingInfo();

    const handleSubmit = () => {
        const depth_value = document.getElementById("synonyms-depth").value;
        const depth = depth_value >= 1 && depth_value <= 10 ? depth_value : 1;
        document.getElementById("synonyms-depth").value = depth;

        const amount_value = document.getElementById("synonyms-amount").value;
        const amount = amount_value >= 1 && amount_value <= 20 ? amount_value : 10;
        document.getElementById("synonyms-amount").value = amount;

        let data = info.get;
        data.set("depth", depth);
        data.set("amount", amount);
        info.set(data);

        navigate('/mapping',  { state: location.state });
    }

    return (
        <div>
            <SideMenu page="mapped_values"/>
            <div className="mapping-customization-container">
                <p className="mapping-customization-explanation-text">
                    ДЛЯ ВЫПОЛНЕНИЯ АВТОМАТИЧЕСКОГО СОПОСТАВЛЕНИЯ НАИМЕНОВАНИЙ ИНГРЕДИЕНТОВ
                    НЕОБХОДИМО ВЫПОЛНИТЬ НАЙСТРОКУ ПРЕДСТАВЛЕННЫХ НИЖЕ ПАРАМЕТРОВ
                </p>
                <p className="mapping-customization-text">
                    ГЛУБИНА ПОИСКА СИНОНИМОВ
                    <br/><br/>
                    При поиске синонимов используется инструмент, в котором слова
                    связаны через синсеты, тогда глубина поиска синонимов обозначает
                    количество связей между исходным словом и крайним найденным синсетом
                    (значение от 1 до 10)
                </p>
                <div className='mapping-customization-parameter' id='depth-parameter'>
                    <input type='number'
                        className="mapping-parameter"
                        id="synonyms-depth"
                        min="1"
                        max="10"
                        defaultValue={info.get.get("depth") === undefined ? "5" : info.get.get("depth")}/>
                </div>
                <p className="mapping-customization-text">
                    МАКСИМАЛЬНОЕ КОЛИЧЕСТВО СИНОНИМОВ
                    <br/><br/>
                    Для каждого исходного слова может быть найдено как слишком много синонимов,
                    так и критически мало, поэтому для того, чтобы не допустить чрезмерного
                    количества синонимов, устанавливается максимальное количество, при достижении
                    которого поиск синонимов прекращается, даже если не была достигнута
                    установленная глубина сопоставления
                    (значение от 1 до 20)
                    <br/><br/>
                    Внимание: в результате поиске может быть найдено меньше синонимов,
                    нежели максимальное установленное количество
                </p>
                <div className='mapping-customization-parameter' id='amount-parameter'>
                    <input type='number'
                        className="mapping-parameter"
                        id="synonyms-amount"
                        min="1"
                        max="20"
                        defaultValue={info.get.get("amount") === undefined ? "15" : info.get.get("amount")}/>
                </div>
                <div className='mapping-customization-button-container'>
                    <input type='button'
                        className="mapping-customization-button"
                        value='Вернуться назад'
                        onClick={() => {navigate('/mapped_values/' + location.state.option,  { state: location.state })}}/>
                    <input type='button'
                        className="mapping-customization-button"
                        value='Продолжить настройку'
                        onClick={handleSubmit}/>
                </div>
            </div>
        </div>
    );
}