import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import Auth from "../Pages/Auth";
import Account from "../Pages/Account";

import Recipes from "../Pages/Recipes";
import RecipesByChecked from "../Pages/RecipesByChecked";
import Nutrients from "../Pages/Nutrients";
import Tags from "../Pages/Tags";

import ParserCustomization from "../Pages/ParserCustomization";
import SubjectCustomization from "../Pages/SubjectCustomization";
import OntologySelection from "../Pages/OntologySelection";
import WebParsing from "../Pages/WebParsing";
import ParserResult from "../Pages/ParserResult";

import ReferenceIngredients from "../Pages/ReferenceIngredients";
import PrimaryIngredients from "../Pages/PrimaryIngredients";
import BenchmarkIngredients from "../Pages/BenchmarkIngredients";

import MappedValues from "../Pages/MappedValues";
import MappedValuesRedaction from "../Pages/MappedValuesRedaction";
import MappedValuesBenchmark from "../Pages/MappedValuesBenchmark";
import MappingCustomization from "../Pages/MappingCustomization";
import Mapping from "../Pages/Mapping";
import MappingLog from "../Pages/MappingLog";

import TaggedValues from "../Pages/TaggedValues";
import TaggedValuesRedaction from "../Pages/TaggedValuesRedaction";
import Tagging from "../Pages/Tagging";

import DataCollection from "../Pages/DataCollection";

export default function Main() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path ="/" element={<Navigate replace to="/account" />} />
                <Route path ="/auth" element={<Auth />} />
                <Route path ="/account" element={<Account />}/>

                <Route path ="/recipes" element={<Recipes/>}/>
                <Route path ="/nutrients" element={<Nutrients />}/>
                <Route path ="/recipes_by_nutrients" element={<RecipesByChecked option="nutrients"/>}/>
                <Route path ="/tags" element={<Tags />}/>
                <Route path ="/recipes_by_tags" element={<RecipesByChecked option="tags"/>}/>

                <Route path ="/parser_customization" element={<ParserCustomization/>}/>
                <Route path ="/subject_customization" element={<SubjectCustomization/>}/>
                <Route path ="/ontology_selection" element={<OntologySelection/>}/>
                <Route path ="/web_parsing/:session" element={<WebParsing/>}/>
                <Route path ="/parser_result/:session" element={<ParserResult/>}/>

                <Route path ="/reference_ingredients/adapted" element={<ReferenceIngredients option="adapted"/>}/>
                <Route path ="/reference_ingredients/unadapted" element={<ReferenceIngredients option="unadapted"/>}/>
                <Route path ="/primary_ingredients/create" element={<PrimaryIngredients option="create"/>}/>
                <Route path ="/primary_ingredients/update" element={<PrimaryIngredients option="update"/>}/>
                <Route path ="/benchmark_ingredients/create" element={<BenchmarkIngredients option="create"/>}/>
                <Route path ="/benchmark_ingredients/update" element={<BenchmarkIngredients option="update"/>}/>

                <Route path ="/mapped_values/verified" element={<MappedValues option="verified"/>}/>
                <Route path ="/mapped_values/unverified" element={<MappedValues option="unverified"/>}/>
                <Route path ="/mapped_values/create" element={<MappedValuesRedaction option="create"/>}/>
                <Route path ="/mapped_values/update" element={<MappedValuesRedaction option="update"/>}/>
                <Route path ="/mapped_values/benchmark" element={<MappedValuesBenchmark/>}/>
                <Route path ="/mapping_customization" element={<MappingCustomization/>}/>
                <Route path ="/mapping" element={<Mapping/>}/>
                <Route path ="/mapping_log" element={<MappingLog/>}/>

                <Route path ="/tagged_values/verified" element={<TaggedValues option="verified"/>}/>
                <Route path ="/tagged_values/unverified" element={<TaggedValues option="unverified"/>}/>
                <Route path ="/tagged_values/update" element={<TaggedValuesRedaction/>}/>
                <Route path ="/tagging" element={<Tagging/>}/>

                <Route path ="/data_collection" element={<DataCollection/>}/>
            </Routes>
        </BrowserRouter>
    );
}