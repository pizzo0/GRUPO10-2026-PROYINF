import { useNavigate } from "react-router-dom";

import { ArrowLeft } from 'lucide-react';

import FillContainer from "components/containers/FillContainer";
import BtnsContainer from "components/containers/BtnsContainer";
import Span from "components/Span";

const About = () => {
    const navigate = useNavigate();

    return (
        <FillContainer>
            <div className="container d-flex flex-column fit-flex justify-content-center py-4">
                <div className="mb-5">
                    <h1 className="display-4 mb-4 krona-one-regular text-primary">Sobre el Proyecto</h1>
                    <p>Gestión y Simulación de Créditos de Consumo</p>
                </div>

                <div className="row g-4">
                    {/* Tarjeta del Equipo */}
                    <div className="col-md-6">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h3 className="card-title h4 mb-3">Integrantes</h3>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">Alejandro Caceres</li>
                                    <li className="list-group-item">Benjamin Caro</li>
                                    <li className="list-group-item">Alex Espinosa</li>
                                    <li className="list-group-item">Eduardo Canales</li>
                                    <li className="list-group-item">Felipe Contreras</li>
                                </ul>
                                <div className="mt-3 small">
                                    <strong>Tutor:</strong> Carlos Arébalo
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de Tecnología */}
                    <div className="col-md-6">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h3 className="card-title h4 mb-3">Tecnológias Usadas</h3>
                                <p>La aplicación está desarrollada sobre una arquitectura moderna basada en contenedores, integrando diversas tecnologías para backend, frontend y procesamiento de datos.</p>
                                <div className="d-flex flex-wrap gap-2">
                                    <span className="badge bg-primary text-dark">Docker</span>
                                    <span className="badge bg-secondary">React</span>
                                    <span className="badge bg-primary text-dark">Node.js</span>
                                    <span className="badge bg-secondary">PostgreSQL</span>
                                    <span className="badge bg-primary text-dark">Tesseract OCR</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BtnsContainer>
                <button className="btn btn-secondary" onClick={() => navigate("/")}>
                    <Span>
                        <ArrowLeft size={"1rem"} />
                        Volver al Inicio
                    </Span>
                </button>
            </BtnsContainer>
        </FillContainer>
    );
};

export default About;