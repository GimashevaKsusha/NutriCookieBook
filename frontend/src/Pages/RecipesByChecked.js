import React, { useEffect, useState } from 'react';
import './RecipesByChecked.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import RecipesTable from '../Components/RecipesTable';
import SideMenu from '../Components/SideMenu';
import { useCheckedNutrients } from '../Components/useCheckedNutrients';
import { useCheckedTags } from '../Components/useCheckedTags';

function SetParams(list) {
    let params = "";
    for(let i = 0; i < list.length; i++)
    {
        params += "items=" + list[i];
        if (i !== list.length - 1) params += "&";
    }

    return params;
}

export default function RecipesByChecked(params) {
    const option = params.option;
    const navigate = useNavigate();

    const {get: checkedNutrients} = useCheckedNutrients();
    const {get: checkedTags} = useCheckedTags();

    const [query, setQuery] = useState("");

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [recipes, setRecipes] = useState([]);
    const size = 5;

    useEffect(() => {
        async function getUserQuery() {
            try {
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/aggregate_query/user_query/?";
                if (option === "nutrients")
                    url = url + SetParams(checkedNutrients);
                else
                    url = url + SetParams(checkedTags);
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
                        type: option === "nutrients" ? 1 : 2,
                    },
                })
                setQuery(data.data);
            }
            catch(e){
                navigate('/auth');
            }
        }
        getUserQuery();
    }, []);

    useEffect(() => {
        async function getRecipesByPage() {
            try {
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/aggregate_query/";
                if (option === "nutrients")
                    url = url + "recipes_by_nutrients/?" + SetParams(checkedNutrients);
                else
                    url = url + "recipes_by_tags/?" + SetParams(checkedTags);
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
                        page: page,
                        size: size,
                    },
                })
                setTotal(data.data[0]);
                setRecipes(data.data[1]);
            }
            catch(e){
                navigate('/auth');
            }
        }
        getRecipesByPage();
        document.getElementById("recipes-by-checked").scrollTo(0, 0);
    }, [page]);

    const PrevPage = () => {
        if (page !== 1) {
            setPage(page - 1);
        }
    }

    const NextPage = () => {
        if (page * size < total) {
            setPage(page + 1);
        }
    }

    const NavigateToPage = () => {
        navigate('/' + option);
    }

    return (
        <div>
            <SideMenu page={option}/>
            <div className="recipes-by-checked-container" id="recipes-by-checked">
                <div className='recipes-by-checked-button-container'>
                    <input type='button' className="recipes-by-checked-switch-button"
                        value='Предыдущая страница' onClick={PrevPage}/>
                    <input type='button' className="recipes-by-checked-switch-button"
                        value='Следующая страница' onClick={NextPage}/>
                </div>
                <p className="recipes-by-checked-user-query">Ваш запрос: {query}</p>
                <RecipesTable recipes={recipes} page={page} size={size}/>
                <div className='recipes-by-checked-button-container'>
                    <input type='button' className="recipes-by-checked-switch-button"
                        value='Предыдущая страница' onClick={PrevPage}/>
                    <input type='button' className="recipes-by-checked-switch-button"
                        value='Следующая страница' onClick={NextPage}/>
                </div>
                <div className='recipes-by-checked-exit-button-container'>
                    <input type='button'
                        className="recipes-by-checked-exit-button"
                        value='Вернуться назад'
                        onClick={NavigateToPage}/>
                </div>
            </div>
        </div>
    );
}