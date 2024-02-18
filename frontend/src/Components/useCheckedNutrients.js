import React, { useContext, createContext, useState } from "react";

const MapCheckedNutrientsContext = createContext();

export const MapCheckedNutrientsProvider = ({children}) => {
    const[get, set] = useState([]);

    return (
        <MapCheckedNutrientsContext.Provider value={{get, set}}>
            {children}
        </MapCheckedNutrientsContext.Provider>
    );
}

export const useCheckedNutrients = () => useContext(MapCheckedNutrientsContext);