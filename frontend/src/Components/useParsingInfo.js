import React, { useContext, createContext, useState } from "react";

const MapParsingInfoContext = createContext();

export const MapParsingInfoProvider = ({children}) => {
    const[get, set] = useState(new Map());

    return (
        <MapParsingInfoContext.Provider value={{get, set}}>
            {children}
        </MapParsingInfoContext.Provider>
    );
}

export const useParsingInfo = () => useContext(MapParsingInfoContext);