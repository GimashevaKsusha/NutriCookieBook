import React, { useContext, createContext, useState } from "react";

const MapCheckedTagsContext = createContext();

export const MapCheckedTagsProvider = ({children}) => {
    const[get, set] = useState([]);

    return (
        <MapCheckedTagsContext.Provider value={{get, set}}>
            {children}
        </MapCheckedTagsContext.Provider>
    );
}

export const useCheckedTags = () => useContext(MapCheckedTagsContext);