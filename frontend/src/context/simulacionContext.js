// import { createContext, useContext, useState, useEffect } from "react";

// import { backendUrl } from "utils/backend";
// import { formatearDineroNumber } from "utils/formatoDinero";
// import { handleData } from "utils/handlers";

// import { useAuth } from "context/authContext";

// const SimulacionContext = createContext();
// export const useSimulacion = () => useContext(SimulacionContext);

// export function SimulacionProvider({ children, formData }) {
//     const { user } = useAuth();

//     const [dataFetch, setDataFetch] = useState(null);
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const getSimulacion = async (data) => {
//         const res = await fetch(backendUrl + "/api/simulacion", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 rut: data.rut,
//                 renta: formatearDineroNumber(data.renta),
//                 monto: formatearDineroNumber(data.monto),
//                 plazo: data.plazo,
//                 pago: data.primerPago
//             })
//         });

//         const json = await res.json();
//         if (!res.ok) throw new Error(json.error || "Error al simular crédito.");

//         return json;
//     };

//     const handleGuardar = async () => {
//         if (!dataFetch) return { ok: false, error: "No hay datos" };

//         try {
//             const res = await fetch(backendUrl + "/api/simulacion/guardar", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${user.token}`,
//                 },
//                 body: JSON.stringify({
//                     monto: dataFetch.monto,
//                     plazo: dataFetch.solicitud.plazo,
//                     cuotaMensual: dataFetch.cuotaMensual,
//                     cae: dataFetch.CAE,
//                 }),
//             });

//             const json = await res.json();
//             if (!res.ok) return { ok: false, error: json.error };

//             return { ok: true };

//         } catch (err) {
//             return { ok: false, error: "Error de conexión" };
//         }
//     };

//     useEffect(() => {
//         const fetchSim = async () => {
//             setLoading(true);
//             setError(null);

//             try {
//                 const data = handleData(formData);
//                 if (data.rut === "0") data.rut = "";

//                 const sim = await getSimulacion(data);
//                 setDataFetch(sim);

//             } catch (err) {
//                 setError(err.message);
//                 setDataFetch(null);

//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchSim();
//     }, [formData]);

//     return (
//         <SimulacionContext.Provider value={{ dataFetch, error, loading, handleGuardar }}>
//             {children}
//         </SimulacionContext.Provider>
//     );
// }