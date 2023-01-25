import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Product from "../Pages/Product";
import Recipe from "../Pages/Recipe";
import MainPage from "../Pages/MainPage";
import RecipeTable from "../Components/RecipeTable";
import ProductTable from "../Components/ProductTable";
import RecipeInfo from "../Components/RecipeInfo";
import RecipeAdd from "../Components/RecipeAdd";
import './Pages.css';
import { Link } from "react-router-dom";

export default function Main() {
    return (
        <BrowserRouter>
            <div className="main-menu">
                <ul className="menu">
                    <li className="link-menu"><Link to="/">Главная</Link></li>
                    <li className="link-menu"><Link to="/products">Продукты</Link></li>
                    <li className="link-menu"><Link to="/recipes">Рецепты</Link></li>
                </ul>
            </div>
            <Routes>
                <Route exact path ="/" element={<MainPage />} />
                <Route exact path ="/products" element={<Product />} />
                <Route exact path ="/recipes" element={<Recipe />} />
                <Route exact path ="/products/list" element={<ProductTable />} />
                <Route exact path ="/recipes/list" element={<RecipeTable />} />
                <Route exact path ="/recipes/new" element={<RecipeAdd />} />
                <Route exact path ="/recipes/:id" element={<RecipeInfo />} />
            </Routes>
        </BrowserRouter>
    );
}