import React, { useEffect, useState } from 'react';
import './TaggedValuesRedaction.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

import { DataGrid, ruRU } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import { MdCheckBox, MdCheckBoxOutlineBlank, MdChevronRight,
    MdKeyboardArrowDown, MdIndeterminateCheckBox } from "react-icons/md";
import {FaSeedling} from "react-icons/fa";

const StyledDataGrid = styled(DataGrid)({
    color: '#000000',
    border: `2px solid #6C5F5B`,
    borderRadius: 10,
    backgroundColor: '#C5BEBA',
    '& .MuiDataGrid-row': {
        backgroundColor: '#FFFFFF',
        '&:hover': {
            backgroundColor: '#FFFFFF',
        },
    },
    '& .MuiDataGrid-iconSeparator': {
        display: 'none',
    },
    '& .MuiDataGrid-columnHeader': {
        borderBottom: `2px solid #6C5F5B`,
        borderRadius: `10px 10px 0px 0px`,
        '&:focus, :focus-within': {
            outline: 'none',
        },
    },
    '& .MuiDataGrid-columnHeaderTitle': {
        color: '#000000',
        fontSize: 14,
    },
    '& .MuiDataGrid-cell': {
        borderBottom: `2px solid #6C5F5B`,
        color: '#000000',
        fontSize: 14,
        '&:focus, :focus-within': {
            outline: 'none',
        },
    },
    '& .MuiDataGrid-footerContainer': {
        border: `2px solid #C5BEBA`,
        borderRadius: 10,
    },
});

const columns = [
    {
        field: "category",
        type: "string",
        headerName: "КАТЕГОРИЯ ИНГРЕДИЕНТА",
        flex: 0.5,
    },
    {
        field: "benchmark",
        type: "string",
        headerName: "НАИМЕНОВАНИЕ ИНГРЕДИЕНТА",
        flex: 1,
    },
];

function SetParams(list) {
    let params = "";
    for(let i = 0; i < list.length; i++)
    {
        params += "items=" + (typeof list[i] === 'object' ? list[i].id : list[i]);
        if (i !== list.length - 1) params += "&";
    }
    return params;
}

export default function TaggedValuesRedaction() {
    const navigate = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState({});

    const [checked, setChecked] = useState([]);
    const [expanded, setExpanded] = useState([]);
    const [nodes, setNodes] = useState([]);

    const [benchmarks, setBenchmarks] = useState([]);

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

    useEffect(() => {
        async function loadTagsReference () {
            try {
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/multiple_listing/tags_reference/";
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
                let tags = location.state.checkedTaggedValues.tags.split(', ');
                tags = tags.filter(item => item !== '');
                let newChecked = [];
                for (let i = 0; i < tags.length; i += 1) {
                    let value = data.data[0].children.find(item => item.label === tags[i]).value;
                    newChecked.push(value);
                }
                setChecked(newChecked);
                setExpanded([data.data[0].value]);
            }
            catch(e) {
                navigate('/auth');
            }
        }
        loadTagsReference();
    }, []);

    useEffect(() => {
        async function loadTaggedValuesBenchmark () {
            try {
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/multiple_listing/benchmark_ingredients_with_categories/";
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
                        primary: location.state.checkedTaggedValues.ingredient,
                    }
                })
                setBenchmarks(data.data);
            }
            catch(e) {
                navigate('/auth');
            }
        }
        loadTaggedValuesBenchmark();
    }, []);

    const handleSavingMappedValues = async() => {
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/tagged_values/update/?" + SetParams(checked);
            let data = await axios(url, {
                method: 'PUT',
                mode: 'no-cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                },
                withCredentials: true,
                credentials: 'same-origin',
                params: {
                    primary_id: location.state.checkedTaggedValues.id
                }
            })
            setMode({pointerEvents: 'none'});
            toast.success(data.data.result);
            setTimeout(() => {
                navigate('/tagged_values/' + location.state.option,  { state: location.state });
            }, 2500);
        }
        catch(e){
            if (e.message === 'Network Error')
                navigate('/auth');
            else if (e.response.status === 403)
                navigate('/auth');
            else if (e.response.status === 422) {
                toast.error("Произошла ошибка! " + e.response.data.error);
                return;
            }
            else if (e.response.status === 500) {
                toast.error("Произошла ошибка! Попробуйте позже!");
                return;
            }
        }
    }

    return (
        <div style={mode}>
            <SideMenu page="tagged_values"/>
            <div className="tagged-values-redaction-container">
                <p className="tagged-values-redaction-text">
                    Для того чтобы выполнить тегирование выбранного
                    наименования ингредиента, необходимо отметить в списке
                    наименований тегов те, к которым относится ингредиент,
                    и сохранить внесенные изменения с отметкой «проверено»
                    <br/><br/>
                    Если выбранный ингредиент не относится ни к одному представленному тегу,
                    то необходимо убрать отметки в тегов и сохранить изменения с отметкой «проверено»
                    <br/><br/>
                    При отмене изменения будет считаться, что для ингредиента не было выполнено
                    экспертное тегирования, то есть отметка «проверено» не будет выставлена
                </p>
                <div>
                    <input type='button'
                        className="tagged-values-redaction-button"
                        value='Сохранить с отметкой «проверено»'
                        onClick={handleSavingMappedValues}/>
                    <input type='button'
                        className="tagged-values-redaction-button"
                        value='Отменить изменения'
                        onClick={() => {navigate('/tagged_values/' + location.state.option,  { state: location.state })}}/>
                </div>
                <p className="tagged-values-redaction-title">
                    ПУБЛИЧНОЕ НАИМЕНОВАНИЕ ИНГРЕДИЕНТА
                </p>
                <p className="tagged-values-redaction-name">
                    {location.state.checkedTaggedValues.ingredient}
                </p>
                <p className="tagged-values-redaction-title">
                    СПИСОК НАИМЕНОВАНИЙ ТЕГОВ
                </p>
                <div className="tagged-values-redaction-tags">
                    <CheckboxTree
                        nodes={nodes}
                        checked={checked}
                        expanded={expanded}
                        onCheck={checked => setChecked(checked)}
                        onExpand={expanded => {setExpanded(expanded)}}
                        icons={icons}/>
                </div>
                <p className="tagged-values-redaction-title">
                    ЭТАЛОННЫЕ НАИМЕНОВАНИЯ ИНГРЕДИЕНТА
                </p>
                <div className="tagged-values-benchmark-datagrid-container">
                    <StyledDataGrid
                        rows={benchmarks}
                        columns={columns}
                        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                        autoPageSize
                        disableRowSelectionOnClick
                        disableColumnSelector/>
                </div>
                <div className='tagged-values-redaction-button-container'>
                    <input type='button'
                        className="tagged-values-redaction-button"
                        value='Сохранить с отметкой «проверено»'
                        onClick={handleSavingMappedValues}/>
                    <input type='button'
                        className="tagged-values-redaction-button"
                        value='Отменить изменения'
                        onClick={() => {navigate('/tagged_values/' + location.state.option,  { state: location.state })}}/>
                </div>
            </div>
            <ToastContainer
                style={{ width: "auto" }}
                position="top-center"
                autoClose={1500}
                limit={1}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
                theme="light"/>
        </div>
    );
}