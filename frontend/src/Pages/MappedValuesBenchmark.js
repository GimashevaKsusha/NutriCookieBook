import React, { useEffect, useState } from 'react';
import './MappedValuesBenchmark.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';

import { DataGrid, ruRU } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';

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

export default function MappedValuesBenchmark() {
    const navigate = useNavigate();
    const location = useLocation();

    const [benchmarks, setBenchmarks] = useState([]);

    const [paginationModel, setPaginationModel] = useState({ pageSize: 15, page: 0 });

    useEffect(() => {
        async function loadMappedValuesBenchmark () {
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
                        primary: location.state.checkedMappedValues.primary_ingredient,
                    }
                })
                setBenchmarks(data.data);
            }
            catch(e) {
                navigate('/auth');
            }
        }
        loadMappedValuesBenchmark();
    }, []);

    return (
        <div>
            <SideMenu page="mapped_values"/>
            <div className="mapped-values-benchmark-container">
                <div className='mapped-values-benchmark-button-container'>
                    <input type='button'
                        className="mapped-values-benchmark-button"
                        value='Вернуться назад к общей таблице'
                        onClick={() => {navigate('/mapped_values/' + location.state.option,  { state: location.state })}}/>
                </div>
                <p className="mapped-values-benchmark-text">
                    ЭТАЛОННЫЕ НАИМЕНОВАНИЕ ИНГРЕДИЕНТА<br/>
                    «{location.state.checkedMappedValues.primary_ingredient}»
                </p>
                <div className="mapped-values-benchmark-datagrid-container">
                    <StyledDataGrid
                        rows={benchmarks}
                        columns={columns}
                        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                        disableRowSelectionOnClick
                        disableColumnSelector
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}/>
                </div>
            </div>
        </div>
    );
}