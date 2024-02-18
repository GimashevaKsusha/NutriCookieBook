import React, { useEffect, useState } from 'react';
import './Mapping.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

import { DataGrid, ruRU } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';

import { useMappingInfo } from '../Components/useMappingInfo';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const StyledDataGrid = styled(DataGrid)({
    color: '#000000',
    border: `2px solid #6C5F5B`,
    borderRadius: 10,
    backgroundColor: '#C5BEBA',
    '& .MuiDataGrid-row': {
        backgroundColor: '#FFFFFF',
        '&:hover': {
            backgroundColor: '#E9FFFA',
        },
    },
    '& .MuiDataGrid-row.Mui-selected, .MuiDataGrid-row.Mui-selected:hover': {
        backgroundColor: '#E9FFFA',
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
    '& .MuiCheckbox-root svg path': {
        color: '#6C5F5B'
    },
    '& .MuiDataGrid-footerContainer': {
        border: `2px solid #C5BEBA`,
        borderRadius: 10,
    },
});

const columns = [
    {
        field: "ingredient",
        type: "string",
        headerName: "НАИМЕНОВАНИЕ ИНГРЕДИЕНТОВ ИЗ РЕЦЕПТОВ, КОТОРЫЕ НЕОБХОДИМО СОПОСТАВИТЬ С ПУБЛИЧНЫМИ НАИМЕНОВАНИЯМИ",
        flex: 1
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

export default function Mapping() {
    const navigate = useNavigate();
    const location = useLocation();

    const [ingredients, setIngredients] = useState([]);
    const [selectionModel, setSelectionModel] = useState([]);

    const [mappingLog, setMappingLog] = useState(location.state.mapping_log == null ?
                                            null : location.state.mapping_log);

    const [paginationModel, setPaginationModel] = useState({ pageSize: 15, page: 0 });

    const info = useMappingInfo();

    const [mode, setMode] = useState({});
    const [reload, setReload] = useState(true);

    const maxValue = 5;

    useEffect(() => {
        async function loadIngredientsForMapping () {
            try {
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/mapping/ingredients/";
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
                setIngredients(data.data);
            }
            catch(e) {
                navigate('/auth');
            }
        }
        loadIngredientsForMapping();
    }, [reload]);

    const setRowSelectionModel = (items) => {
        const page = paginationModel.page;
        if (items.length <= maxValue) {
            setSelectionModel(items);
        }
        else {
            if (selectionModel.length + 1 !== items.length) {
                const part_items = items.slice(0 + page * 15, maxValue + page * 15);
                setSelectionModel(part_items);
            }
        }
    };

    const handleStartMappingProcess = async() => {
        if (info.get.size === 0) {
            toast.warning("Параметры настройки сопоставления были стерты! Пожалуйста, подтвердите новые параметры сопоставления");
            setMode({pointerEvents: 'none'});
            setTimeout(() => {
                navigate('/mapping_customization',  { state: location.state });
            }, 2500);
            return;
        }

        let checkedIngredients = selectionModel;
        if (checkedIngredients.length === 0) {
            checkedIngredients = ingredients.slice(0, maxValue);
        }

        const currentToast = toast.loading("Выполняется сопоставление! Пожалуйста, подождите...");
        setMode({pointerEvents: 'none'});

        let url = process.env.REACT_APP_ENDPOINT + "/api/v1/mapping/start/?" + SetParams(checkedIngredients);
        await axios(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
            },
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                depth: info.get.get("depth"),
                amount: info.get.get("amount")
            }
        })
        .then(res => {
            toast.update(currentToast, {
                render: res.data.result,
                type: "success",
                isLoading: false,
                autoClose: 5000,
                closeOnClick: true
            });
            setMappingLog(res.data.logs);
        })
        .catch(err => {
            if (err.message === 'Network Error')
                navigate('/auth');
            else if (err.response.status === 403)
                navigate('/auth');
            else if (err.response.status === 500) {
                toast.update(currentToast, {
                    render: "Произошла ошибка! Попробуйте позже!",
                    type: "error",
                    isLoading: false,
                    autoClose: 5000,
                    closeOnClick: true
                });
                return;
            }
        })
        .then(function () {
            setMode({});
            setReload(!reload);
            setSelectionModel([]);
        });
    };

    const handleShowMappingLog = async() => {
        if (mappingLog === null) {
            toast.warning("Невозможно выполнить! Лог сопоставления пуст!");
            return;
        }

        const currentState = location;
        console.log(currentState)

        currentState.state["mapping_log"] = mappingLog;

        navigate('/mapping_log', currentState);
    };

    return (
        <div style={mode}>
            <SideMenu page="mapped_values"/>
            <div className="mapping-container">
                <p className="mapping-text">
                    В таблице представлены наименования ингредиентов из сторонних рецептов,
                    которые требуется сопоставить с публичными наименованиями ингредиентов, то есть
                    выполнить автоматическое или экспертное сопоставление
                    <br/><br/>
                    Внимание: при выборе нескольких наименований сопоставление будет запускаться
                    для каждого наименования отдельно,
                    а если не было выбрано ни одного ингредиента для сопоставления, то
                    по умолчанию процесс независимого сопоставления будет запущен для {maxValue} случайных значений
                </p>
                <div className="mapping-datagrid-container">
                    <StyledDataGrid
                        rows={ingredients}
                        columns={columns}
                        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                        checkboxSelection
                        disableColumnSelector
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        rowSelectionModel={selectionModel}
                        onRowSelectionModelChange={(items) => {setRowSelectionModel(items)}}/>
                </div>
                <div className='mapping-button-container'>
                    <input type='button'
                        className="mapping-button"
                        value='Вернуться назад'
                        onClick={() => {navigate('/mapping_customization',  { state: location.state })}}/>
                    <input type='button'
                        className="mapping-button"
                        value='Показать лог сопоставления'
                        onClick={handleShowMappingLog}/>
                    <input type='button'
                        className="mapping-button"
                        value='Выполнить сопоставление'
                        onClick={handleStartMappingProcess}/>
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