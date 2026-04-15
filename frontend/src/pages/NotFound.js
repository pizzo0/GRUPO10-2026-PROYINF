import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="container align-items-center justify-content-center d-flex flex-column fit-flex">
            <div className="d-flex flex-column align-items-center">
                <h1 className="display-1 krona-one-regular">
                    404
                </h1>
                <p>
                    Página no encontrada
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/")}
                >
                    ir al inicio
                </button>
            </div>
        </div>
    );
};

export default NotFound;