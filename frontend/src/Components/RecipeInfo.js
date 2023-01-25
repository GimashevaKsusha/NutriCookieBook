import React, { useState, useEffect } from "react";
import '../Pages/Pages.css';
import { Link, useParams } from "react-router-dom";
import axios from 'axios';

function UpdateRecipe(id) {

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

    try{
        let url = "http://127.0.0.1:5000/api/v1/smart_recipes/recipes/" + id;
        axios(url, {
            method: 'PUT',
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
            }
        })
        alert("Рецепт был отредактирован! (⌒‿⌒)");
    }
    catch(e) {
        console.log(e);
    }
}

function DeleteRecipe(id) {
    axios.delete("http://127.0.0.1:5000/api/v1/smart_recipes/recipes/" + id + "/delete");
    alert("Рецепт был удален из БД! (⌒‿⌒)");
}

function RecipeForm(elem) {
    const name = elem.recipe.recipe_name;
    const method = elem.recipe.method;
    let result = (
        <form>
            <input id="recipe-name" required placeholder="Название рецепта" className="field-recipe">
            </input><br/>
            <textarea id="cooking-method" required placeholder="Способ приготовления" className="field-recipe">
            </textarea><br/>
            <Link to="/recipes" className="work-recipe">Отмена</Link>
            <Link to="/recipes" className="work-recipe" onClick={() => UpdateRecipe(elem.recipe.id)}>Редактировать рецепт</Link>
            <Link to="/recipes" className="work-recipe" onClick={() => DeleteRecipe(elem.recipe.id)}>Удалить рецепт</Link>
        </form>
    );
    const rname = document.getElementById("recipe-name");
    if (rname) {
        rname.value = name;
    }
    const rcook = document.getElementById("cooking-method");
    if (rcook) {
        rcook.value = method;
    }
    return result
}

export default function RecipeInfo() {
    let { id } = useParams();
    const [recipe, setRecipe] = useState([]);
    useEffect(() => {
        async function loadRecipeData () {
            try{
                let url = "http://127.0.0.1:5000/api/v1/smart_recipes/recipes/" + id;
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
                setRecipe(data.data);
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
                <RecipeForm recipe={recipe}/>
            </div>
        </div>
    );
}