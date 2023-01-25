import React, { useContext, createContext, useState } from "react";

const MapCheckedProductsContext = createContext();

export const MapCheckedProductsProvider = ({children}) => {
    const[get, set] = useState([]);

    return (
        <MapCheckedProductsContext.Provider value={{get, set}}>
            {children}
        </MapCheckedProductsContext.Provider>
    );
}

export const useCheckedProducts = () => useContext(MapCheckedProductsContext);