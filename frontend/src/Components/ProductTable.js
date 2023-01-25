import '../Pages/Pages.css';
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import {useCheckedNodes} from '../Pages/useCheckedNodes';
import {useCheckedProducts} from '../Pages/useCheckedProducts';

function SetParams(list) {
    let params = "";
    for(let i = 0; i < list.length; i++)
    {
        params += "nutrients=" + list[i];
        if (i !== list.length - 1) params += "&";
    }
    return params;
}

export default function ProductTable() {
    const {get: checked} = useCheckedNodes();
    const products = useCheckedProducts();

    useEffect(() => {
        async function loadProductData () {
            try{
                let url = "http://127.0.0.1:5000/api/v1/smart_products/products/by_nutrients/?" + SetParams(checked);
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
                products.set(data.data);
            }
            catch(e){
                console.log(e);
            }
        }
        loadProductData();
    }, []);

    if (checked.length === 0)
    {
        return (
            <div className="container">
                <div className="checkbox">
                    <p className="textbox">
                        Пожалуйста, выберите хотя бы один нутриент!
                    </p>
                    <div className="choose">
                        <Link to="/products/">Назад</Link>
                    </div>
                </div>
            </div>
        );
    }

   if (products.get.length === 0)
    {
        return (
            <div className="container">
                <div className="checkbox">
                    <p className="textbox">
                        Не удалось найти продукты, которые бы соответствовали Вашему запросу!
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
                <table id="product-table">
                    <thead>
                        <tr>
                            <th>Название продукт</th>
                            <th>Название категории</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.get.map((row, i) => {
                        return (
                            <tr key={i} >
                                <td>{row.name}</td>
                                <td>{row.category}</td>
                            </tr>
                        )
                        })}
                    </tbody>
                </table>
                <div className="choose">
                    <Link to="/products/">Назад</Link>
                    <Link to="/recipes/list">Показать рецепты</Link>
                </div>
            </div>
        </div>
    );
}