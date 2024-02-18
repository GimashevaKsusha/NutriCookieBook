import React, { useContext, createContext, useState } from "react";

const MapMappingInfoContext = createContext();

export const MapMappingInfoProvider = ({children}) => {
    const[get, set] = useState(new Map());

    return (
        <MapMappingInfoContext.Provider value={{get, set}}>
            {children}
        </MapMappingInfoContext.Provider>
    );
}

export const useMappingInfo = () => useContext(MapMappingInfoContext);