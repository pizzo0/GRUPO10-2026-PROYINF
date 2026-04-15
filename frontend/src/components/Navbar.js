import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "context/authContext";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path;
        //  ? "active fw-bold" : "";

    const NavbarCollapseElement = ({ title, className, classNameSpan, to, onClick }) => (
        <div
            className={`d-flex align-items-center w-100 p-3 px-4 cursor-pointer ${className}`}
            onClick={() => {
                setIsOpen(false);

                if (onClick) return onClick();
                if (to) navigate(to);
            }}
        >
            <span className={(to ? (isActive(to) ? "text-primary" : "") : "") + " user-select-none " + classNameSpan}>
                {title}
            </span>
        </div>
    );

    const NavbarElement = ({ title, className, classNameSpan, to, onClick }) => (
        <div
            className={`d-flex justify-content-center align-items-center cursor-pointer ${className}`}
            onClick={() => {
                setIsOpen(false);

                if (onClick) return onClick();
                if (to) navigate(to);
            }}
        >
            <span className={(to ? (isActive(to) ? "text-primary" : "") : "") + " user-select-none " + classNameSpan}>
                {title}
            </span>
        </div>
    )

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }
    }, [isOpen]);

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-body custom-navbar-height border-bottom border-opacity-10 border-primary" style={{
                position: "sticky",
                zIndex: 2000,
                top: 0,
            }}>

                <div
                    id="navbar-collapse"
                    className={`collapse navbar-collapse bg-body ${isOpen ? "show" : ""}`}
                >
                    <NavbarCollapseElement
                        title="Inicio"
                        to="/"
                    />
                    <NavbarCollapseElement
                        title="Simulador"
                        to="/simular-credito"
                    />
                    { isAuthenticated &&
                        <NavbarCollapseElement
                            title="Historial"
                            to="/historial"
                        />
                    }
                    <NavbarCollapseElement
                        title="Herramienta OCR"
                        to="/escanear"
                    />
                    <NavbarCollapseElement
                        title="Sobre el Proyecto"
                        to="/about"
                    />
                    <br/>
                    {isAuthenticated ? (
                        <NavbarCollapseElement
                            title="Cerrar Sesión"
                            onClick={logout}
                        />
                    ) : (
                        <>
                            <NavbarCollapseElement
                                title="Iniciar Sesión"
                                to="/iniciar-sesion"
                            />
                            <NavbarCollapseElement
                                title="Crear Cuenta"
                                to="/crear-cuenta"
                            />
                        </>
                    )}
                </div>

                <div className="container-fluid gap-3 px-4" style={{
                    maxWidth:1320,
                }}>
                    <NavbarElement
                        title="G10"
                        onClick={() => navigate("/")}
                        classNameSpan="fs-5 krona-one-regular"
                    />

                    <div
                        className="p-2 cursor-pointer"
                        onClick={() => setIsOpen(prev => !prev)}
                    >
                        <button
                            className={`navbar-toggler ${isOpen ? "active" : ""}`}
                            type="button"
                        >
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                    <div className="justify-content-between d-none d-lg-flex gap-3 w-100">
                        <div className="d-flex gap-3">
                            <NavbarElement
                                title="Inicio"
                                to="/"
                            />

                            <NavbarElement
                                title="Simulador"
                                to="/simular-credito"
                            />

                            <NavbarElement
                                title="Herramienta OCR"
                                to="/escanear"
                            />

                            <NavbarElement
                                title="Sobre el Proyecto"
                                to="/about"
                            />
                        </div>

                        <div className="justify-content-between d-none d-lg-flex gap-3">
                            { isAuthenticated ? (
                                <NavbarElement
                                    title="Cerrar Sesión"
                                    onClick={logout}
                                />
                            ) : (
                                <>
                                    <NavbarElement
                                        title="Iniciar Sesión"
                                        to="/iniciar-sesion"
                                    />
                                    <NavbarElement
                                        title="Crear Cuenta"
                                        to="/crear-cuenta"
                                    />
                                </>
                            ) }
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;