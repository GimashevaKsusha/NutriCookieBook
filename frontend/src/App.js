import Main from './Pages/Main';
import {MapCheckedNodesProvider} from './Pages/useCheckedNodes';
import {MapCheckedProductsProvider} from './Pages/useCheckedProducts';

function App() {
  return (
    <div className="app">
        <MapCheckedNodesProvider>
            <MapCheckedProductsProvider>
                <Main />
            </MapCheckedProductsProvider>
        </MapCheckedNodesProvider>
    </div>
  );
}

export default App;
