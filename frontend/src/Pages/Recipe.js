import React, { useState, useEffect } from "react";
import './Pages.css';
import { Link } from "react-router-dom";
import axios from 'axios';

function GenerateLink(id) {
    return "/recipes/" + id;
}

function GenerateLinkToFile(file) {
    return "./source_files/" + file;
}

function SetRecipeName(i, name) {
    return i + ". " + name;
}

function CreateSource(source) {
    if (source === "1") {
        return "---"
    }
    else {
        return (
            <Link to="/recipes" onClick={() => window.open(GenerateLinkToFile(source))}>
                Источник данных: {source}
            </Link>
        );
    }
}

export default function Recipe() {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        async function loadRecipeData () {
            try{
                let url = "http://127.0.0.1:5000/api/v1/smart_recipes/recipes";
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
    }, []);

    return (
        <div className="container">
            <div className="checkbox">
                <table id="recipe-table">
                    <tbody>
                        {recipes.map((row, i) => {
                        return (
                            <>
                                <tr className="rname" id="rname-link">
                                    <td colSpan="3">
                                        <Link to={GenerateLink(row.id)}>
                                            {SetRecipeName(i + 1, row.recipe_name)}
                                        </Link>
                                    </td>
                                </tr>
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
                    <Link to="/recipes/new">Добавить рецепт</Link>
                </div>
            </div>
        </div>
    );
}