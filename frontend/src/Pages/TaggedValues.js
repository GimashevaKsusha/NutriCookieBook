import React, { useEffect, useState } from 'react';
import './TaggedValues.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

import { DataGrid, ruRU } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';

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
            backgroundColor: '#DAC3B3',
        },
    },
    '& .MuiDataGrid-row.Mui-selected': {
        backgroundColor: '#E9FFFA',
        '&:hover': {
            backgroundColor: '#DAC3B3',
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
        headerName: "ПУБЛИЧНОЕ НАИМЕНОВАНИЕ ИНГРЕДИЕНТА",
        flex: 1.2,
    },
    {
        field: "tags",
        type: "string",
        headerName: "СПИСОК НАИМЕНОВАНИЙ ТЕГОВ",
        flex: 1.2,
    },
    {
        field: "status",
        type: "string",
        headerName: "СТАТУС ПРОВЕРКИ",
        flex: 0.5,
    },
    {
        field: "author",
        type: "string",
        headerName: "АВТОР ПРОВЕРКИ",
        flex: 0.5,
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

export default function TaggedValues(params) {
    const navigate = useNavigate();
    const location = useLocation();

    const option = params.option;

    const maxValue = 15;

    const [taggedValues, setTaggedValues] = useState([]);
    const [checkedTaggedValues, setCheckedTaggedValues] = useState([]);

    const [paginationModel, setPaginationModel] = useState(null);
    const [filterModel, setFilterModel] = useState(location.state == null ?
                                                    {items: []} : location.state.filterModel);
    const [reload, setReload] = useState(true);

    useEffect(() => {
        async function loadTaggedValues () {
            try {
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/tagged_values/read/";
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
                        option: option
                    }
                 })
                setTaggedValues(data.data[0]);
                if (option === 'unverified') {
                    setPaginationModel({pageSize: maxValue, page: data.data[1]});
                }
                else {
                    setPaginationModel({pageSize: maxValue, page: 0});
                }
            }
            catch(e) {
                navigate('/auth');
            }
        }
        loadTaggedValues();
    }, [reload, option]);

    const handleStartTaggingProcess = () => {
        const currentState = {
            state: {
                option: option,
                filterModel: filterModel
            }
        };
        toast.warning("Раздел находится в процессе разработки! Извините за доставленные неудобства!");
        return;

        //navigate('/tagging', currentState);
    }

    const handleUpdateTaggedValues = () => {
        if (checkedTaggedValues.length !== 1) {
            toast.warning("Выберите одну пару значений для редактирования!");
            return;
        }

        const currentState = {
            state: {
                option: option,
                filterModel: filterModel,
                checkedTaggedValues: taggedValues.find(item => item.id === checkedTaggedValues[0])
            }
        };

        navigate('/tagged_values/update', currentState);
    };

    const handleVerifyTaggedValues = async() => {
        toast.warning("Раздел находится в процессе разработки! Извините за доставленные неудобства!");
        return;
        /*if (checkedTaggedValues.length < 1) {
            toast.warning("Выберите одну или более пар значения для установления отметки «проверено»!");
            return;
        }
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/tagged_values/verify/?" + SetParams(checkedTaggedValues);
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
            })
            toast.success(data.data.result);
            setReload(!reload);
            setCheckedTaggedValues([]);
        }
        catch(e){
            if (e.message === 'Network Error')
                navigate('/auth');
            else if (e.response.status === 403)
                navigate('/auth');
            else if (e.response.status === 500) {
                toast.error("Произошла ошибка! Попробуйте позже!");
                return;
            }
        }*/
    };

    const setRowSelectionModel = (items) => {
        const page = paginationModel.page;
        if (items.length === taggedValues.length && items.length >= maxValue) {
            let part_items = items.slice(0 + page * maxValue, maxValue + page * maxValue);
            setCheckedTaggedValues(part_items);
        }
        else {
            setCheckedTaggedValues(items);
        }
    };

    const handleChangeResultTable = () => {
        const new_option = option === 'verified' ? 'unverified' : 'verified';
        navigate('/tagged_values/' + new_option);
        window.location.reload();
    };

    return (
        <div>
            <SideMenu page="tagged_values"/>
            <div className="tagged-values-container">
                <div className='tagged-values-reaction-button-container'>
                    <input type='button'
                        className="tagged-values-reaction-button"
                        value={option === 'unverified' ?
                            'Перейти к проверенным значениям' :
                            'Вернуться к непроверенным значениям'}
                        onClick={handleChangeResultTable}/>
                    <input type='button'
                        className="tagged-values-reaction-button"
                        value='Запустить автоматическое тегирование'
                        onClick={handleStartTaggingProcess}/>
                </div>
                <p className="tagged-values-text">
                    {option === 'verified' ? 'ПРОВЕРЕННЫЕ ' : 'НЕПРОВЕРЕННЫЕ '}
                    ЗНАЧЕНИЯ ИЗ СПИСОКА ПУБЛИЧНЫХ НАИМЕНОВАНИЙ ИНГРЕДИЕНТОВ
                    <br/>
                    С УКАЗАНИЕМ ВЫСТАВЛЕННЫХ ВРУЧНУЮ ЭКСПЕРТОМ ИЛИ АВТОМАТИЧЕСКИ ТЕГОВ
                </p>
                <div className="tagged-values-datagrid-container">
                    <StyledDataGrid
                        rows={taggedValues}
                        columns={columns}
                        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                        checkboxSelection
                        pageSizeOptions={[maxValue]}
                        disableColumnSelector
                        rowSelectionModel={checkedTaggedValues}
                        onRowSelectionModelChange={(items) => {setRowSelectionModel(items)}}
                        paginationModel={paginationModel}
                        onPaginationModelChange={(model) => {
                            setPaginationModel(model);
                            if (option === 'unverified') {
                                const history = {
                                    page: model.page,
                                }
                                localStorage.setItem('tagging_history', JSON.stringify(history));
                            }
                        }}
                        filterModel={filterModel}
                        onFilterModelChange={setFilterModel}/>
                </div>
                <div className='tagged-values-operation-button-container'>
                    <input type='button'
                        className="tagged-values-operation-button"
                        value='Редактировать'
                        onClick={handleUpdateTaggedValues}/>
                    <input type='button'
                        className="tagged-values-operation-button"
                        value='Поставить отметку «проверено»'
                        onClick={handleVerifyTaggedValues}/>
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