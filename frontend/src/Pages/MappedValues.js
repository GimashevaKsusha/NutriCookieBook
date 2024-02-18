import React, { useEffect, useState } from 'react';
import './MappedValues.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

import { DataGrid, ruRU, useGridApiRef } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

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
        field: "practical_ingredient",
        type: "string",
        headerName: "НАИМЕНОВАНИЕ ИНГРЕДИЕНТА ИЗ РЕЦЕПТА",
        flex: 1,
    },
    {
        field: "primary_ingredient",
        type: "string",
        headerName: "ПУБЛИЧНОЕ НАИМЕНОВАНИЕ ИНГРЕДИЕНТА",
        flex: 1,
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

function SetFirstLettersOfIngredients(letters, first_letter) {
    const container = document.getElementById("mapped-values-combobox");
    if (container !== null) {
        container.innerHTML = '';
    }
    for (let i = 0; i < letters.length; i++) {
        let optionHtml = document.createElement('option')
        optionHtml.innerHTML = letters[i].letter;
        optionHtml.value = letters[i].letter;
        if (letters[i].letter === first_letter) {
            optionHtml.selected = true;
        }
        container.append(optionHtml);
    }
}

export default function MappedValues(params) {
    const navigate = useNavigate();
    const location = useLocation();

    const option = params.option;

    const maxValue = 10;

    const [mappedValues, setMappedValues] = useState([]);
    const [checkedMappedValues, setCheckedMappedValues] = useState([]);

    const [paginationModel, setPaginationModel] = useState(null);
    const [filterModel, setFilterModel] = useState(location.state === null ? {items: []} : location.state.filterModel);

    const [reload, setReload] = useState(true);

    const [letters, setLetters] = useState([]);
    const [selectedLetter, setSelectedLetter] = useState("");

    const apiRef = useGridApiRef();

    const setRowSelectionModel = (items) => {
        const count = Object.entries(apiRef.current.state.visibleRowsLookup).filter(x => x[1] === true).length;
        const page = paginationModel.page;
        if (items.length === count && items.length >= maxValue && checkedMappedValues.length + 1 !== items.length) {
            const part_items = items.slice(0 + page * maxValue, maxValue + page * maxValue);
            setCheckedMappedValues(part_items);
        }
        else {
            setCheckedMappedValues(items);
        }
    };

    useEffect(() => {
        async function loadFirstLettersOfIngredients () {
            try {
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/multiple_listing/first_letters/";
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
                setLetters(data.data[0]);
                if (localStorage.getItem("mapping_history") === null) {
                    setSelectedLetter(data.data[1]);
                    SetFirstLettersOfIngredients(data.data[0], data.data[1]);
                    setPaginationModel({pageSize: maxValue, page: data.data[2]});
                }
                else {
                    setSelectedLetter(JSON.parse(localStorage.getItem('mapping_history')).letter);
                    SetFirstLettersOfIngredients(data.data[0], JSON.parse(localStorage.getItem('mapping_history')).letter);
                    if (option === 'unverified') {
                        setPaginationModel({pageSize: maxValue, page: JSON.parse(localStorage.getItem('mapping_history')).page});
                    }
                    else {
                        setPaginationModel({pageSize: maxValue, page: 0});
                    }
                }
            }
            catch(e) {
                navigate('/auth');
            }
        }
        loadFirstLettersOfIngredients();
    }, []);

    useEffect(() => {
        async function loadMappedValues () {
            try {
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/mapped_values/read/";
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
                        letter: selectedLetter,
                        option: option
                    }
                 })
                setMappedValues(data.data);
            }
            catch(e) {
                navigate('/auth');
            }
        }
        if (letters.length !== 0 && selectedLetter !== "") {
            loadMappedValues();
        }
    }, [selectedLetter, reload, option]);

    const handleStartMappingProcess = () => {
        const currentState = {
            state: {
                option: option,
                mappedValues: mappedValues,
                filterModel: filterModel,
            }
        };

        navigate('/mapping_customization', currentState);
    }

    const handleCreateMappedValues = () => {
        const currentState = {
            state: {
                option: option,
                mappedValues: mappedValues,
                filterModel: filterModel,
            }
        };

        navigate('/mapped_values/create', currentState);
    }

    const handleUpdateMappedValues = () => {
        if (checkedMappedValues.length !== 1) {
            toast.warning("Выберите одну пару значений для редактирования!");
            return;
        }

        const currentState = {
            state: {
                option: option,
                mappedValues: mappedValues,
                filterModel: filterModel,
                checkedMappedValues: mappedValues.find(item => item.id === checkedMappedValues[0])
            }
        };

        navigate('/mapped_values/update', currentState);
    };

    const handleDeleteMappedValues = async() => {
        if (checkedMappedValues.length < 1) {
            toast.warning("Выберите одну или более пар значений для удаления!");
            return;
        }

        let status = true;
        for (let i = 0; i < checkedMappedValues.length; i++) {
            let value = mappedValues.find(item => item.id === checkedMappedValues[i]);
            if (value.status === 'проверено') {
                status = false;
                break;
            }
        }

        if (!status) {
            handleOpenConfirmation();
            return;
        }

        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/mapped_values/delete/?" + SetParams(checkedMappedValues);
            let data = await axios(url, {
                method: 'DELETE',
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
            setCheckedMappedValues([]);
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
        }
    };

    const handleDisplayBenchmarkMappedValues = () => {
        if (checkedMappedValues.length !== 1) {
            toast.warning("Выберите одну пару значений для просмотра эталонных наименований!");
            return;
        }

        const currentState = {
            state: {
                option: option,
                mappedValues: mappedValues,
                filterModel: filterModel,
                checkedMappedValues: mappedValues.find(item => item.id === checkedMappedValues[0])
            }
        };

        navigate('/mapped_values/benchmark', currentState);
    };

    const handleVerifyMappedValues = async() => {
        if (checkedMappedValues.length < 1) {
            toast.warning("Выберите одну или более пар значения для установления отметки «проверено»!");
            return;
        }
        try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/mapped_values/verify/?" + SetParams(checkedMappedValues);
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
            setCheckedMappedValues([]);
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
        }
    };

    const [confirmation, setConfirmation] = useState(false);

    const handleOpenConfirmation = () => setConfirmation(true);
    const handleDisagreeConfirmation = () => setConfirmation(false);
    const handleAgreeConfirmation = async() => {
         try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/mapped_values/delete/?" + SetParams(checkedMappedValues);
            let data = await axios(url, {
                method: 'DELETE',
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
            setCheckedMappedValues([]);
            setConfirmation(false);
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
        }
    };

    const handleChangeResultTable = () => {
        const new_option = option === 'verified' ? 'unverified' : 'verified';
        navigate('/mapped_values/' + new_option);
        window.location.reload();
    };

    return (
        <div>
            <SideMenu page="mapped_values"/>
            <div className="mapped-values-container">
                <div className='mapped-values-reaction-button-container'>
                    <input type='button'
                        className="mapped-values-reaction-button"
                        value={option === 'unverified' ?
                            'Перейти к проверенным значениям' :
                            'Вернуться к непроверенным значениям'}
                        onClick={handleChangeResultTable}/>
                    <input type='button'
                        className="mapped-values-reaction-button"
                        value='Запустить автоматическое сопоставление'
                        onClick={handleStartMappingProcess}/>
                </div>
                <p className="mapped-values-text">
                    {option === 'verified' ? 'ПРОВЕРЕННЫЕ ' : 'НЕПРОВЕРЕННЫЕ '}
                    РЕЗУЛЬТАТЫ АВТОМАТИЧЕСКОГО И ЭКСПЕРТНОГО
                    СОПОСТАВЛЕНИЯ
                    <br/>
                    НАИМЕНОВАНИЙ ИНГРЕДИЕНТОВ ИЗ РЕЦЕПТОВ
                    И ПУБЛИЧНЫХ НАИМЕНОВАНИЙ ИНГРЕДИЕНТОВ
                </p>
                <p>
                    Фильтр результатов сопоставления по наименованию ингредиентов из рецептов:
                    <select
                        id="mapped-values-combobox"
                        onChange={() => {
                            setSelectedLetter(document.getElementById("mapped-values-combobox").value);
                            setPaginationModel({ pageSize: maxValue, page: 0 });
                            const history = {
                                page: 0,
                                letter: document.getElementById("mapped-values-combobox").value,
                            }
                            localStorage.setItem('mapping_history', JSON.stringify(history));
                        }}>
                    </select>
                </p>
                <div className="mapped-values-datagrid-container">
                    <StyledDataGrid
                        rows={mappedValues}
                        columns={columns}
                        apiRef={apiRef}
                        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                        checkboxSelection
                        pageSizeOptions={[maxValue]}
                        disableColumnSelector
                        rowSelectionModel={checkedMappedValues}
                        onRowSelectionModelChange={(items) => {setRowSelectionModel(items)}}
                        paginationModel={paginationModel}
                        onPaginationModelChange={(model) => {
                            setPaginationModel(model);
                            if (option === 'unverified') {
                                const history = {
                                    page: model.page,
                                    letter: selectedLetter,
                                }
                                localStorage.setItem('mapping_history', JSON.stringify(history));
                            }
                        }}
                        filterModel={filterModel}
                        onFilterModelChange={setFilterModel}/>
                </div>
                <div className='mapped-values-operation-button-container'>
                    <input type='button'
                        className="mapped-values-operation-button"
                        value='Добавить'
                        onClick={handleCreateMappedValues}/>
                    <input type='button'
                        className="mapped-values-operation-button"
                        value='Редактировать'
                        onClick={handleUpdateMappedValues}/>
                    <input type='button'
                        className="mapped-values-operation-button"
                        value='Удалить'
                        onClick={handleDeleteMappedValues}/>
                    <br/>
                    <input type='button'
                        className="mapped-values-operation-button"
                        value='Показать эталонные наименования'
                        onClick={handleDisplayBenchmarkMappedValues}/>
                    <input type='button'
                        className="mapped-values-operation-button"
                        value='Поставить отметку «проверено»'
                        onClick={handleVerifyMappedValues}/>
                </div>
            </div>
            <Dialog
                open={confirmation}
                onClose={handleDisagreeConfirmation}>
                <DialogTitle style={{color: "#000000"}}>
                    <b>Подтвердите удаление</b>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText style={{color: "#000000"}}>
                        Среди выбранных Вами значений присутствуют
                        пары наименований ингредиентов, отмеченные
                        статусом «проверено»
                        <br/><br/>
                        Вы уверены, что хотите
                        удалить все выбранные значения, включая проверенные?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button style={{color: "#000000"}} onClick={handleDisagreeConfirmation}>
                        <b>Отменить</b>
                    </Button>
                    <Button style={{color: "#000000"}} onClick={handleAgreeConfirmation}>
                        <b>Удалить</b>
                    </Button>
                </DialogActions>
            </Dialog>
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