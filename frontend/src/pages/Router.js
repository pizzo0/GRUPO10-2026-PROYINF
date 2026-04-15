import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "components/Navbar";

import Index from "pages/Index";
import About from "pages/About";
import ScannerPage from "pages/ScannerPage";
import Historial from "pages/Historial";
import NotFound from "pages/NotFound";

import { Router as SimulatorRouter } from "pages/simulator/Router";
import { Router as ApplyRouter } from "pages/apply/Router";
import Login from "./Login";
import Register from "./Register";

const Main = () => {
    return (
        <>
            <Navbar/>
            <div className="container d-flex flex-column h-100 fit-flex py-3 text-color">
                <Outlet/>
            </div>
        </>
    );
}

export const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Main/>}>
                <Route index element={<Index />} />
                <Route path="/about" element={<About/>} />
                <Route path="/escanear" element={<ScannerPage/>} />
                <Route path="/iniciar-sesion">
                    {Login()}
                </Route>
                <Route path="/crear-cuenta">
                    {Register()}
                </Route>
                {SimulatorRouter()}
                {ApplyRouter()}
                <Route path="/historial" element={<Historial/>} />
                <Route path="*" element={<NotFound/>}/>
            </Route>
        </Routes>
    )
}
// {WizardRouter("/crear-cuenta", [{ path: "", component: Register }])}
// {WizardRouter("/iniciar-sesion", [{ path: "", component: Login }])}