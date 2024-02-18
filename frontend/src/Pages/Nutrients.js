import React, { useEffect, useState } from 'react';
import './Nutrients.css';
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import { MdCheckBox, MdCheckBoxOutlineBlank, MdChevronRight,
    MdKeyboardArrowDown, MdIndeterminateCheckBox } from "react-icons/md";
import { FaSeedling } from "react-icons/fa";
import { useCheckedNutrients } from '../Components/useCheckedNutrients';
import SideMenu from '../Components/SideMenu';

export default function Nutrients() {
    const navigate = useNavigate();

    const checked = useCheckedNutrients();
    const [expanded, setExpanded] = useState([]);
    const [nodes, setNodes] = useState([]);

    useEffect(() => {
        async function loadNutrientsTree () {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/aggregate_query/nutrients/";
                let data =  await axios(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                    },
                    withCredentials: true,
                    credentials: 'same-origin'
                    })
                setNodes(data.data);
            }
            catch(e){
                navigate('/auth');
            }
        }
        loadNutrientsTree();
    }, []);

    const icons = {
        check: <MdCheckBox className="rct-icon rct-icon-check" color="#4F4A45"/>,
        uncheck: <MdCheckBoxOutlineBlank className="rct-icon rct-icon-uncheck" color="#6C5F5B"/>,
        halfCheck: <MdIndeterminateCheckBox className="rct-icon rct-icon-half-check" color="#6C5F5B"/>,
        expandClose: <MdChevronRight className="rct-icon rct-icon-expand-close" color="#6C5F5B"/>,
        expandOpen: <MdKeyboardArrowDown className="rct-icon rct-icon-expand-open" color="#6C5F5B"/>,
        parentClose: <FaSeedling className="rct-icon rct-icon-parent-close" color="#75B1A9"/>,
        parentOpen: <FaSeedling className="rct-icon rct-icon-parent-open" color="#75B1A9"/>,
        leaf: <FaSeedling className="rct-icon rct-icon-leaf-close" color="#ACD0C0"/>
    };

    return (
        <div>
            <SideMenu page="nutrients"/>
            <div className="nutrients-container">
                <p className="nutrients-text">Вы можете выбрать один или несколько нутриентов(*)
                из представленного списка и получить разнообразные рецепты,
                при подборе которых учитываются определенные продукты, содержащие в составе
                выбранные нутриенты</p>
                <div className="nutrients-tree">
                    <CheckboxTree
                        nodes={nodes}
                        checked={checked.get}
                        expanded={expanded}
                        onCheck={nodes => checked.set(nodes)}
                        onExpand={expanded => {setExpanded(expanded)}}
                        icons={icons}
                    />
                </div>
                <p className="nutrients-text">* Нутриенты - питательные вещества, витамины и минералы,
                содержащиеся в продуктах питания</p>
                <div className='nutrients-button-container'>
                    <input type='button' className="nutrients-button" value='Показать рецепты'
                        onClick={() => navigate('/recipes_by_nutrients')}/>
                </div>
            </div>
        </div>
    );
}