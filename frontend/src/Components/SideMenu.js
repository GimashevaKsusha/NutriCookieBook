import './SideMenu.css';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';

export default function SideMenu(params) {
    const navigate = useNavigate();
    const page = params.page;

    const role = localStorage.getItem('user_role');
    if (role !== 'Пользователь' && role !== 'Разработчик' && role !== 'Эксперт' && role !== 'Администратор') {
        navigate('/auth');
    }

    if (page !== 'mapped_values') {
        localStorage.removeItem("mapping_history");
    }

    if (page !== 'tagged_values') {
        localStorage.removeItem("tagging_history");
    }

    const handleSaveMappingHistory = async() => {
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/mapped_values/history/";
            await axios(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                },
                withCredentials: true,
                credentials: 'same-origin',
                params: {
                    page: JSON.parse(localStorage.getItem('mapping_history')).page,
                    letter: JSON.parse(localStorage.getItem('mapping_history')).letter,
                }
            })
        }
        catch(e){
            navigate('/auth');
        }
    }

    if (localStorage.getItem("mapping_history") !== null) {
        handleSaveMappingHistory();
    };

    const handleSaveTaggingHistory = async() => {
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/tagged_values/history/";
            await axios(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                },
                withCredentials: true,
                credentials: 'same-origin',
                params: {
                    page: JSON.parse(localStorage.getItem('tagging_history')).page,
                }
            })
        }
        catch(e){
            navigate('/auth');
        }
    }

    if (localStorage.getItem("tagging_history") !== null) {
        handleSaveTaggingHistory();
    };

    return (
        <div className="side-menu">
            <Link to="/account" id={"side-menu-" + (page === "account").toString()}>
                Учетная запись
            </Link>
            <Link to="/recipes" id={"side-menu-" + (page === "recipes").toString()}>
                Все рецепты
            </Link>
            <Link to="/nutrients" id={"side-menu-" + (page === "nutrients").toString()}>
                Поиск рецептов <br/>по нутриентам
            </Link>
            <Link to="/tags" id={"side-menu-" + (page === "tags").toString()}>
                Поиск рецептов <br/>по категориям
            </Link>
            { role === 'Разработчик' || role === 'Администратор' ?
                <Link to="/parser_customization" id={"side-menu-" + (page === "parser_customization").toString()}>
                    Настройка парсера
                </Link> : null }
            { role === 'Разработчик' || role === 'Администратор' ?
                <Link to="/ontology_selection" id={"side-menu-" + (page === "ontology_selection").toString()}>
                    Запуск парсера
                </Link> : null }
            { role === 'Эксперт' || role === 'Администратор' ?
                <Link to="/reference_ingredients/adapted" id={"side-menu-" + (page === "reference_ingredients").toString()}>
                    Редактирование <br/>списков ингредиентов
                </Link> : null }
            { role === 'Эксперт' || role === 'Администратор' ?
                <Link to="/mapped_values/unverified" id={"side-menu-" + (page === "mapped_values").toString()}>
                    Сопоставление <br/>названий ингредиентов
                </Link> : null }
            { role === 'Эксперт' || role === 'Администратор' ?
                <Link to="/tagged_values/unverified" id={"side-menu-" + (page === "tagged_values").toString()}>
                    Тегирование <br/>названий ингредиентов
                </Link> : null }
            { role === 'Администратор' ?
                <Link to="/data_collection" id={"side-menu-" + (page === "data_collection").toString()}>
                    Сбор данных
                </Link> : null }
            <Link to="/auth">
                Выход
            </Link>
        </div>
    );
}