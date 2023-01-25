import React, { useState, useEffect } from "react";
import '../Pages/Pages.css';
import { Link } from "react-router-dom";
import {useCheckedProducts} from '../Pages/useCheckedProducts';
import axios from 'axios';

function SetParams(list) {
    let params = "";
    for(let i = 0; i < list.length; i++)
    {
        params += "products=" + list[i].name;
        if (i !== list.length - 1) params += "&";
    }
    return params;
}

function SetRecipeName(i, name) {
    return i + ". " + name;
}

function GenerateLinkToFile(file) {
    return "../source_files/" + file;
}

function CreateSource(source) {
    if (source === "1") {
        return "---"
    }
    else {
        return (
            <Link to="/recipes/list" onClick={() => window.open(GenerateLinkToFile(source))}>
                Источник данных: {source}
            </Link>
        );
    }
}

export default function RecipesTable() {
    const [recipes, setRecipes] = useState([]);
    const {get: checked} = useCheckedProducts();

    useEffect(() => {
        async function loadRecipeData () {
            try{
                let url = "http://127.0.0.1:5000/api/v1/smart_recipes/recipes/by_products/?" + SetParams(checked);
                let data = await axios(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                    credentials: 'same-origin',
                    })
                setRecipes(data.data);
            }
            catch(e){
                console.log(e);
            }
        }
        loadRecipeData();
    }, [checked]);

    if (recipes.length === 0)
    {
        return (
            <div className="container">
                <div className="checkbox">
                    <p className="textbox">
                        Не удалось найти рецепты для заданных продуктов!
                    </p>
                    <div className="choose">
                        <Link to="/products/">Назад</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="checkbox">
                <table id="recipe-table">
                    <tbody>
                        {recipes.map((row, i) => {
                        return (
                            <>
                                <tr className="rname"><td colSpan="3">{SetRecipeName(i + 1, row.recipe_name)}</td></tr>
                                <tr className="cook"><td colSpan="3">{row.method.replaceAll('\n', ". ")}</td></tr>
                                <tr className="source">
                                    <td colSpan="3">
                                        {CreateSource(row.source)}
                                    </td>
                                </tr>
                                {recipes[i].ingredients.map((row, j) => {
                                    return (
                                        <tr className="ingredient">
                                            <td>{row.ingredient_name}</td>
                                            <td>{row.amount}</td>
                                            <td>{row.unit}</td>
                                        </tr>
                                        )
                                    })
                                }
                            </>
                        )
                        })}
                    </tbody>
                </table>
                <div className="choose">
                    <Link to="/products/">Назад</Link>
                </div>
            </div>
        </div>
    );
}