import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import {MdCheckBox, MdCheckBoxOutlineBlank, MdChevronRight,
    MdKeyboardArrowDown, MdIndeterminateCheckBox} from "react-icons/md";
import {FaSeedling} from "react-icons/fa";
import axios from 'axios';
import {useCheckedNodes} from './useCheckedNodes';


export default function Product() {
    const checked = useCheckedNodes();
    const [expanded, setExpanded] = useState([]);
    const [nodes, setNodes] = useState([]);

    useEffect(() => {
        async function loadTree () {
            try{
                let url = "http://127.0.0.1:5000/api/v1/smart_products/headers/nutrients";
                let data =  await axios(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                    credentials: 'same-origin'
                    })
                setNodes(data.data);
            }
            catch(e){
                console.log(e);
            }
        }
        loadTree();
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
        <div className="container">
            <div className="checkbox">
                <CheckboxTree className="tree"
                    nodes={nodes}
                    checked={checked.get}
                    expanded={expanded}
                    onCheck={nodes => checked.set(nodes)}
                    onExpand={expanded => {setExpanded(expanded)}}
                    icons={icons}
                />
                <div className="choose"><Link to="/products/list">Выбрать</Link></div>
            </div>
        </div>
    );
}