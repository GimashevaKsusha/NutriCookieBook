import React, { useEffect, useState } from 'react';
import './Tags.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import { MdCheckBox, MdCheckBoxOutlineBlank, MdChevronRight,
    MdKeyboardArrowDown, MdIndeterminateCheckBox } from "react-icons/md";
import { FaSeedling } from "react-icons/fa";
import { useCheckedTags } from '../Components/useCheckedTags';
import SideMenu from '../Components/SideMenu';

export default function Tags() {
    const navigate = useNavigate();

    const checked = useCheckedTags();
    const [expanded, setExpanded] = useState([]);
    const [nodes, setNodes] = useState([]);

    useEffect(() => {
        async function loadTagsTree () {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/aggregate_query/tags/";
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
        loadTagsTree();
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
            <SideMenu page="tags"/>
            <div className="tags-container">
                <p className="tags-text">Вы можете выбрать одну или несколько категорий из представленного списка
                и получить разнообразные рецепты, при подборе которых учитываются определенные продукты
                из выбранных категорий
                </p>
                <div className="tags-tree">
                    <CheckboxTree
                        nodes={nodes}
                        checked={checked.get}
                        expanded={expanded}
                        onCheck={nodes => checked.set(nodes)}
                        onExpand={expanded => {setExpanded(expanded)}}
                        icons={icons}
                    />
                </div>
                <div className='tags-button-container'>
                    <input type='button' className="tags-button" value='Показать рецепты'
                        onClick={() => navigate('/recipes_by_tags')}/>
                </div>
            </div>
        </div>
    );
}