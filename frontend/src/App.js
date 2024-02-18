import Main from './Pages/Main';
import { MapCheckedNutrientsProvider } from './Components/useCheckedNutrients';
import { MapCheckedTagsProvider } from './Components/useCheckedTags';
import { MapParsingInfoProvider } from './Components/useParsingInfo';
import { MapMappingInfoProvider } from './Components/useMappingInfo';

function App() {
    return (
        <div className="app">
            <MapMappingInfoProvider>
                <MapParsingInfoProvider>
                    <MapCheckedTagsProvider>
                        <MapCheckedNutrientsProvider>
                            <Main />
                        </MapCheckedNutrientsProvider>
                    </MapCheckedTagsProvider>
                </MapParsingInfoProvider>
            </MapMappingInfoProvider>
        </div>
    );
}

export default App;
