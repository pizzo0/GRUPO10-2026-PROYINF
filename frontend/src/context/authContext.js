import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "utils/backend";
import { handleData } from "utils/handlers";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // INIT AUTH
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            setUser({ token });
        }

        setLoading(false);
    }, []);

    // LOGIN
    const login = async (rut, password) => {
        try {
            setError(null);

            const res = await fetch(`${backendUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rut, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

            localStorage.setItem("token", data.token);
            setUser({ token: data.token });

            return { ok: true };

        } catch (err) {
            setError(err.message);
            return { ok: false, error: err.message };
        }
    };

    // REGISTER
    const register = async (formData) => {
        try {
            setError(null);

            const data = handleData(formData);

            const res = await fetch(`${backendUrl}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Error al registrar usuario");

            return { ok: true };

        } catch (err) {
            setError(err.message);
            return { ok: false, error: err.message };
        }
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/iniciar-sesion");
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            loading,
            error,
            isAuthenticated: !!user
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};