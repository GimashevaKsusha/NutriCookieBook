import React, { useState } from 'react';
import './MappingLog.css';
import { useNavigate, useLocation } from "react-router-dom";
import SideMenu from '../Components/SideMenu';
import MappingLogTable from '../Components/MappingLogTable';


export default function MappingLog() {
    const navigate = useNavigate();
    const location = useLocation();

    const [page, setPage] = useState(1);
    const total = location.state.mapping_log.length;

    const PrevPage = () => {
        if (page !== 1) {
            setPage(page - 1);
        }
    }

    const NextPage = () => {
        if (page < total) {
            setPage(page + 1);
        }
    }

    return (
        <div>
            <SideMenu page="mapped_values"/>
            <div className="mapping-log-container">
                <div className='recipes-by-checked-button-container'>
                    <input type='button' className="recipes-by-checked-switch-button"
                        value='Предыдущая страница' onClick={PrevPage}/>
                    <input type='button' className="recipes-by-checked-switch-button"
                        value='Следующая страница' onClick={NextPage}/>
                </div>
                <MappingLogTable log={location.state.mapping_log[page - 1]} page={page}/>
                <div className='mapping-log-button-container'>
                    <input type='button'
                        className="mapping-log-button"
                        value='Вернуться назад'
                        onClick={() => {navigate('/mapping', { state: location.state })}}/>
                </div>
            </div>
        </div>
    );
}