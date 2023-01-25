import React, { useState, useEffect } from "react";
import '../Pages/Pages.css';
import { Link, useParams } from "react-router-dom";
import axios from 'axios';
import {useForm} from 'react-hook-form';

let ingred = [];

function AddRecipe() {
    let name = "";
    let method = "";
    const rname = document.getElementById("recipe-name");
    if (rname) {
         name = rname.value;
    }
    const rcook = document.getElementById("cooking-method");
    if (rcook) {
        method = rcook.value;
    }

    if (name == "" || method == "")
        return;

    try{
        let url = "http://127.0.0.1:5000/api/v1/smart_recipes/recipes/new";
        let data =  axios(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                recipe_name: name,
                cooking_method: method,
                source: 1
            }
            })
        alert("Рецепт был добавлен в БД! (⌒‿⌒)");
    }
    catch(e) {
        console.log(e);
    }
}

function RecipeAddForm(){
    const { recipe } = useForm();
    const onSubmit = data => console.log(data);
    return(
        <form id="form-to-add">
            <input id="recipe-name" placeholder="Название рецепта" className="field-recipe"></input><br/>
            <textarea id="cooking-method" placeholder="Способ приготовления" className="field-recipe"></textarea><br/>
            <Link to="/recipes" className="work-recipe">Отмена</Link>
            <Link to="/recipes" className="work-recipe" onClick={AddRecipe}>Добавить рецепт</Link>
            <Link to="/recipes" className="work-recipe">Добавить ингредиент</Link>
        </form>
    )
}

export default function RecipeInfo() {
    let { name } = useParams();
    return (
        <div className="container">
            <div className="checkbox">
                <RecipeAddForm />
            </div>
        </div>
    );
}