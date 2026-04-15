import { useNavigate } from "react-router-dom";

import { Scan, User, Info, ArrowLeft, ArrowRight } from 'lucide-react';

import FillContainer from "components/containers/FillContainer";
import Span from "components/Span";

const Index = () => {
    const navigate = useNavigate();

    return (
        <FillContainer>
            {/* Sección del Título */}
            <div className="mb-5">
                <h1 className="display-2 krona-one-regular text-primary mb-3">
                    Prestamos🤑💸💳
                </h1>
                <p className="lead mx-auto" style={{ maxWidth: "600px" }}>
                    Toma el control de tu futuro financiero. Simula, evalúa y solicita tu crédito de consumo en minutos.
                </p>
            </div>

            {/* Contenedor de Botones */}
            <div className="d-flex flex-column gap-3 w-100 bg-primary bg-opacity-10 p-3 rounded-6" style={{ maxWidth: "500px" }}>
                
                {/*Botón Principal: Simulador */}
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate("/simular-credito")}
                >
                    <Span>
                        Simular mi Crédito
                        <ArrowRight size={"1rem"}/>
                    </Span>
                </button>

                {/*Fila de Botones: Herramientas y Acceso */}
                <div className="row g-2">
                    <div className="col-6">
                        <button 
                            className="btn btn-outline-text"
                            onClick={() => navigate("/escanear")}
                        >
                            <Span>
                                <Scan size={"1rem"}/>
                                Escanear Carnet
                            </Span>
                        </button>
                    </div>
                    <div className="col-6">
                        <button 
                            className="btn btn-outline-text"
                            onClick={() => navigate("/iniciar-sesion")}
                        >
                            <Span>
                                <User size={"1rem"}/>
                                Acceso Clientes
                            </Span>
                        </button>
                    </div>
                </div>

                {/* 3. Botón */}
                <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate("/about")}
                >
                    <Span>
                        <Info size={"1rem"}/>
                        Sobre el proyecto
                    </Span>
                </button>
            </div>

            {/* Enlace de registro */}
            <div className="text-center mt-2">
                <span className="text-muted small">¿No tienes cuenta? </span>
                <span 
                    className="text-primary text-decoration-underline small" 
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/crear-cuenta")}
                >
                    Regístrate aquí
                </span>
            </div>
        </FillContainer>
    )
}

export default Index;