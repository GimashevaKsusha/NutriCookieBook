import React, { useEffect, useState } from 'react';
import './ReferenceIngredients.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

import { DataGrid, ruRU } from '@mui/x-data-grid';
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


export default function ReferenceIngredients(params) {
    const navigate = useNavigate();
    const location = useLocation();

    const option = params.option;
    const maxValue = 10;

    const [primaryIngredients, setPrimaryIngredients] = useState([]);
    const [selectedPrimaryIngredients, setSelectedPrimaryIngredients] = useState([]);

    const [benchmarkIngredients, setBenchmarkIngredients] = useState([]);
    const [selectedBenchmarkIngredients, setSelectedBenchmarkIngredients] = useState([]);

    const [primaryPaginationModel, setPrimaryPaginationModel] = useState(location.state === null ?
                                                                    { pageSize: maxValue, page: 0 } :
                                                                    location.state.primaryPaginationModel);
    const [benchmarkPaginationModel, setBenchmarkPaginationModel] = useState(location.state === null ?
                                                                    { pageSize: maxValue, page: 0 } :
                                                                    location.state.benchmarkPaginationModel);
    const [primaryFilterModel, setPrimaryFilterModel] = useState(location.state === null ?
                                                                    {items: []} : location.state.primaryFilterModel);
    const [benchmarkFilterModel, setBenchmarkFilterModel] = useState(location.state === null ?
                                                                    {items: []} : location.state.benchmarkFilterModel);

    const [title, setTitle] = useState("");

    const [reload, setReload] = useState(true);

    useEffect(() => {
        async function loadResultListIngredients() {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/multiple_listing/";
                url = option === "adapted" ? url + "primary_ingredients/" : url + "unadapted_benchmark_ingredients/";
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
                if (option === 'adapted')
                    setPrimaryIngredients(data.data);
                else
                    setBenchmarkIngredients(data.data);
            }
            catch(e){
                navigate('/auth');
            }
        }
        loadResultListIngredients();
    }, [reload]);

    useEffect(() => {
        async function loadBenchmarkIngredients() {
            try{
                let url = process.env.REACT_APP_ENDPOINT + "/api/v1/multiple_listing/benchmark_ingredients/";
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
                        primary: selectedPrimaryIngredients[0]
                    }
                })
                setBenchmarkIngredients(data.data);
                setSelectedBenchmarkIngredients([]);
            }
            catch(e){
                navigate('/auth');
            }
        }
        if (selectedPrimaryIngredients.length !== 0) {
            loadBenchmarkIngredients();
        }
    }, [selectedPrimaryIngredients]);

    const handleCreatePrimaryIngredients = () => {
        const currentState = {
            state: {
                option: option,
                primaryPaginationModel: primaryPaginationModel,
                benchmarkPaginationModel: benchmarkPaginationModel,
                primaryFilterModel: primaryFilterModel,
                benchmarkFilterModel: benchmarkFilterModel
            }
        };

        navigate('/primary_ingredients/create', currentState);
    }

    const handleCreateBenchmarkIngredients = () => {
        const currentState = {
            state: {
                option: option,
                primaryPaginationModel: primaryPaginationModel,
                benchmarkPaginationModel: benchmarkPaginationModel,
                primaryFilterModel: primaryFilterModel,
                benchmarkFilterModel: benchmarkFilterModel
            }
        };

        navigate('/benchmark_ingredients/create', currentState);
    }

    const handleUpdatePrimaryIngredients = () => {
        if (selectedPrimaryIngredients.length !== 1) {
            toast.warning("Выберите одно публичное наименование ингредиента для редактирования!");
            return;
        }

        const currentState = {
            state: {
                option: option,
                primaryPaginationModel:primaryPaginationModel,
                benchmarkPaginationModel: benchmarkPaginationModel,
                primaryFilterModel: primaryFilterModel,
                benchmarkFilterModel: benchmarkFilterModel,
                selectedPrimaryIngredients: selectedPrimaryIngredients[0],
                selectedPrimaryIngredientsName: primaryIngredients.find(item => item.id === selectedPrimaryIngredients[0]).label
            }
        };

        navigate('/primary_ingredients/update', currentState);
    };

    const handleUpdateBenchmarkIngredients = () => {
        if (selectedBenchmarkIngredients.length !== 1) {
            toast.warning("Выберите одно эталонное наименование ингредиента для редактирования!");
            return;
        }

        const currentState = {
            state: {
                option: option,
                primaryPaginationModel:primaryPaginationModel,
                benchmarkPaginationModel: benchmarkPaginationModel,
                primaryFilterModel: primaryFilterModel,
                benchmarkFilterModel: benchmarkFilterModel,
                selectedBenchmarkIngredients: selectedBenchmarkIngredients[0],
                selectedBenchmarkIngredientsName: benchmarkIngredients.find(item => item.id === selectedBenchmarkIngredients[0]).label
            }
        };

        navigate('/benchmark_ingredients/update', currentState);
    };

    const [deleteOption, setDeleteOption] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const handleDeletePrimaryIngredients = () => {
        if (selectedPrimaryIngredients.length !== 1) {
            toast.warning("Выберите одно публичное наименование ингредиента для удаления!");
            return;
        }
        setTitle(" «" + primaryIngredients.find(item => item.id === selectedPrimaryIngredients[0]).label + "»");
        setDeleteOption("delete_primary/");
        setDeleteItem(selectedPrimaryIngredients[0]);
        handleOpenConfirmation();
    };

    const handleDeleteBenchmarkIngredients = () => {
        if (selectedBenchmarkIngredients.length !== 1) {
            toast.warning("Выберите одно эталонное наименование ингредиента для удаления!");
            return;
        }
        if (option === "adapted") {
            toast.error("Невозможно удалить выбранное эталонное наименование ингредиента," +
                        "так как оно используется для формирования публичного наименования ингредиента");
            return;
        }
        setTitle(" «" + benchmarkIngredients.find(item => item.id === selectedBenchmarkIngredients[0]).label + "»");
        setDeleteOption("delete_benchmark/");
        setDeleteItem(selectedBenchmarkIngredients[0]);
        handleOpenConfirmation();
    };

    const [confirmation, setConfirmation] = useState(false);

    const handleOpenConfirmation = () => setConfirmation(true);
    const handleDisagreeConfirmation = () => setConfirmation(false);
    const handleAgreeConfirmation = async() => {
         try{
            let url = process.env.REACT_APP_ENDPOINT + "/api/v1/reference_ingredients/" + deleteOption;
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
                params: {
                    item_id: deleteItem
                }
            })
            toast.success(data.data.result);
        }
        catch(e) {
            console.log(e);
            if (e.message === 'Network Error')
                navigate('/auth');
            else if (e.response.status === 403)
                navigate('/auth');
            else if (e.response.status === 422)
                toast.error(e.response.data.error);
            else if (e.response.status === 500)
                toast.error("Произошла ошибка! Попробуйте позже!");
        }
        setReload(!reload);
        setSelectedPrimaryIngredients([]);
        setSelectedBenchmarkIngredients([]);
        setPrimaryIngredients([]);
        setBenchmarkIngredients([]);
        setConfirmation(false);
    };

    const handleChangeResultList = () => {
        const new_option = option === 'adapted' ? 'unadapted' : 'adapted';
        navigate('/reference_ingredients/' + new_option);
        window.location.reload();
    };

    return true ?
    (
        <div>
            <SideMenu page="reference_ingredients"/>
            <div className="reference-ingredients-container">
                <p className="reference-ingredients-text">
                    Раздел находится в процессе разработки! Извините за доставленные неудобства!
                </p>
            </div>
        </div>
    ) :
    (
        <div>
            <SideMenu page="reference_ingredients"/>
            <div className="reference-ingredients-container">
                <div className='reference-ingredients-reaction-button-container'>
                    <input type='button'
                        className="reference-ingredients-reaction-button"
                        value={option === 'adapted' ?
                            'Показать неиспользуемые эталонные наименования' :
                            'Вернуться к публичным наименованиям'}
                        onClick={handleChangeResultList}/>
                </div>
                <p className="reference-ingredients-text">
                    {option === 'adapted' ?
                        'СПИСОК ПУБЛИЧНЫХ НАИМЕНОВАНИЙ ИНГРЕДИЕНТОВ С УКАЗАНИЕМ ЭТАЛОННЫХ НАИМЕНОВАНИЙ' :
                        'СПИСОК НЕИСПОЛЬЗУЕМЫХ ЭТАЛОННЫХ НАИМЕНОВАНИЙ ИНГРЕДИЕНТОВ'}
                    <br/><br/>
                    {option === 'adapted' ?
                        '[в таблице «ПУБЛИЧНЫЕ НАИМЕНОВАНИЯ ИНГРЕДИЕНТОВ» указаны ' +
                        'наименования, которые используются при сопоставлении названий ингредиентов, ' +
                        'при выборе одного из них в таблице «ЭТАЛОННЫЕ НАИМЕНОВАНИЯ ИНГРЕДИЕНТОВ» отображаются ' +
                        'наименования, которые используются для формирования выбранного публичного наименования ингредиента]':
                        '[в таблице «ЭТАЛОННЫЕ НАИМЕНОВАНИЯ ИНГРЕДИЕНТОВ» указаны ' +
                        'наименование, которые не используются для формирования публичных наименований ингредиентов]'}
                </p>
                <div className="reference-ingredients-datagrid-container">
                    <div className="reference-ingredients-datagrid">
                        <StyledDataGrid
                            rows={primaryIngredients}
                            columns={[
                                {
                                    field: "label",
                                    type: "string",
                                    headerName: "ПУБЛИЧНЫЕ НАИМЕНОВАНИЯ ИНГРЕДИЕНТОВ",
                                    flex: 1,
                                    editable: false
                                }
                            ]}
                            localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                            pageSizeOptions={[maxValue]}
                            disableColumnSelector
                            rowSelectionModel={selectedPrimaryIngredients}
                            onRowSelectionModelChange={(items) => {setSelectedPrimaryIngredients(items)}}
                            paginationModel={primaryPaginationModel}
                            onPaginationModelChange={setPrimaryPaginationModel}
                            filterModel={primaryFilterModel}
                            onFilterModelChange={setPrimaryFilterModel}/>
                    </div>
                    <div className="reference-ingredients-datagrid">
                        <StyledDataGrid
                            rows={benchmarkIngredients}
                            columns={[
                                {
                                    field: "label",
                                    type: "string",
                                    headerName: "ЭТАЛОННЫЕ НАИМЕНОВАНИЯ ИНГРЕДИЕНТОВ",
                                    flex: 1,
                                }
                            ]}
                            localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                            pageSizeOptions={[maxValue]}
                            disableColumnSelector
                            rowSelectionModel={selectedBenchmarkIngredients}
                            onRowSelectionModelChange={(items) => {setSelectedBenchmarkIngredients(items)}}
                            paginationModel={benchmarkPaginationModel}
                            onPaginationModelChange={setBenchmarkPaginationModel}
                            filterModel={benchmarkFilterModel}
                            onFilterModelChange={setBenchmarkFilterModel}/>
                    </div>
                </div>
                <div className='reference-ingredients-operation-button-container'>
                    <input type='button'
                        className="reference-ingredients-operation-button"
                        value='Добавить публичное наименование'
                        onClick={handleCreatePrimaryIngredients}/>
                    <input type='button'
                        className="reference-ingredients-operation-button"
                        value='Добавить эталонное наименование'
                        onClick={handleCreateBenchmarkIngredients}/>
                    <br/>
                    <input type='button'
                        className="reference-ingredients-operation-button"
                        value='Редактирование публичное наименование'
                        onClick={handleUpdatePrimaryIngredients}/>
                    <input type='button'
                        className="reference-ingredients-operation-button"
                        value='Редактирование эталонное наименование'
                        onClick={handleUpdateBenchmarkIngredients}/>
                    <br/>
                    <input type='button'
                        className="reference-ingredients-operation-button"
                        value='Удалить публичное наименование'
                        onClick={handleDeletePrimaryIngredients}/>
                    <input type='button'
                        className="reference-ingredients-operation-button"
                        value='Удалить эталонное наименование'
                        onClick={handleDeleteBenchmarkIngredients}/>
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
                        Вы уверены, что хотите удалить выбранное наименование ингредиента{title}?
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