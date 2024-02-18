import React, { useEffect, useState } from 'react';
import './Recipes.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import RecipesTable from '../Components/RecipesTable';
import SideMenu from '../Components/SideMenu';


export default function Recipes() {
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [recipes, setRecipes] = useState([]);
    const size = 10;

    useEffect(() => {
        async function getRecipesByPage() {
            try {
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/aggregate_query/recipes/";
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
                    }
                })
                setTotal(data.data[0]);
                setRecipes(data.data[1]);
            }
            catch(e){
                navigate('/auth');
            }
        }
        getRecipesByPage();
        document.getElementById("recipes").scrollTo(0, 0);
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

    return (
        <div>
            <SideMenu page="recipes"/>
            <div className="recipes-container" id="recipes">
                <div className='recipes-button-container'>
                    <input type='button' className="switch-button" value='Предыдущая страница' onClick={PrevPage}/>
                    <input type='button' className="switch-button" value='Следующая страница' onClick={NextPage}/>
                </div>
                <RecipesTable recipes={recipes} page={page} size={size}/>
                <div className='recipes-button-container'>
                    <input type='button' className="switch-button" value='Предыдущая страница' onClick={PrevPage}/>
                    <input type='button' className="switch-button" value='Следующая страница' onClick={NextPage}/>
                </div>
            </div>
        </div>
    );
}