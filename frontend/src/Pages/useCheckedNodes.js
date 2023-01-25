import React, { useContext, createContext, useState } from "react";

const MapCheckedNodesContext = createContext();

export const MapCheckedNodesProvider = ({children}) => {
    const[get, set] = useState([]);

    return (
        <MapCheckedNodesContext.Provider value={{get, set}}>
            {children}
        </MapCheckedNodesContext.Provider>
    );
}

export const useCheckedNodes = () => useContext(MapCheckedNodesContext);