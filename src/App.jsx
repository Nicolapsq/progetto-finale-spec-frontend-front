import { BrowserRouter, Routes, Route } from "react-router-dom";

import DefaultLayout from "./layouts/DefaultLayout";


import ListaRecord from "./pages/ListaLaptop";
import DettaglioLaptop from "./pages/DettaglioLaptop";
import Comparatore from "./pages/Comparatore";
import Preferiti from "./pages/Preferiti";


export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<ListaRecord />} />
            
            
            <Route path="/laptops/:id" element={<DettaglioLaptop />} />
            <Route path="/compare" element={<Comparatore />} />
            <Route path="/preferiti" element={<Preferiti />} />
           
            
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
