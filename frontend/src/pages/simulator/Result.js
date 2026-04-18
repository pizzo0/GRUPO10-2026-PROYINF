import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { 
    // Save, 
    Circle, 
    CircleCheck, 
    // ArrowRight, 
    // Form, 
    Sparkles 
} from 'lucide-react';

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// import { useAuth } from "context/authContext";

import { backendUrl } from "utils/backend";
import { formatearDineroStrBonito } from "utils/formatoDinero";

// import Container from "components/containers/Container";
// import Surface from "components/containers/Surface";
import SpinnerGrow from "components/spinners/SpinnerGrow";
import FillContainer from "components/containers/FillContainer";
import Span from "components/Span";

import { handleDelay } from "utils/handlers";

// const handleSaveSimulation = async (data, token) => {
//     if (!data) return { ok: false, error: "No hay datos" };

//     try {
//         const res = await fetch(backendUrl + "/api/simulacion/guardar", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`,
//             },
//             body: JSON.stringify(data)
//         });
//         const json = await res.json();
//         if (!res.ok) return { ok: false, error: json.error };
//         return { ok: true };
//     } catch (e) {
//         return { ok: false, errr: "Error de conexión" };
//     }
// }

/**
 * aqui deberian llegar todos los resultados de las
 * simulaciones, como tambien deberia poder verse
 * simulaciones previas, que hayan sido guardadas y
 * tendan un id en la bdd.
 * 
 * lo ultimo no esta implementado aun, pero es la
 * idea xd
 * 
 * desde aqui se puede tambien partir la solicitud
 * del credito simulado
 */
const Result = ({formData, selected, setSelected}) => {
    const navigate = useNavigate();
    // const { user, isAuthenticated } = useAuth();

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(backendUrl + "/api/simulacion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Error al simular crédito.");
                }

                await handleDelay(1500);

                const json = await res.json();
                setData(json);
                setSelected(json.options[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [formData, navigate]);

    if (!formData) return null;
    if (loading) return (
        <FillContainer>
            <SpinnerGrow className="text-primary" style={{width: "5rem", height: "5rem"}}/>
        </FillContainer>
    );
    if (error) return <span>ERROR: {error}</span>;

    // const saveSimulation = async () => {
    //     const res = await handleSaveSimulation(selected, user.token);
    //     if (res.ok) alert("Simulacion guardada");
    //     else alert(res.error);
    // };

    const SimulationCard = ({
        data,
        recommended,
        isSelected,
        onSelect,
    }) => {
        const { cuota_mensual, ctc, cae, tasa_mensual, tasa_anual, solicitud } = data;
        return (
            <div className={`${isSelected ? "card-selected" : "card-not-selected"} d-flex flex-column gap-2 p-3 px-4 rounded-4`} style={{ cursor: "pointer" }} onClick={() => onSelect(data)}>
                <div className="d-flex flex-row justify-content-between">
                    {recommended ? <Sparkles size={"2.5rem"} strokeWidth={1.25} /> : <div/>}
                    <div className={`d-flex card-element-border rounded-5 p-2 px-3 w-auto fw-medium`}>
                        {isSelected ?
                        <Span className="gap-2">
                            <CircleCheck />
                            Seleccionado
                        </Span> :
                        <Span className="gap-2">
                            <Circle />
                            Seleccionar
                        </Span>
                    }
                    </div>
                </div>
                <span>{recommended ? "Recomendación - " + recommended : "Tu simulación"}</span>

                <span className="fs-3 krona-one-regular">
                    {formatearDineroStrBonito(solicitud.monto)}
                </span>

                <div className="d-flex flex-column">
                    {Object.entries({
                        "Cuota Mensual": formatearDineroStrBonito(cuota_mensual),
                        "Cuotas": `${solicitud.plazo} ${solicitud.plazo === 1 ? "Mes" : "Meses"}`,
                        "CTC": formatearDineroStrBonito(ctc),
                        "CAE": cae,
                        "Interés Mensual": tasa_mensual,
                        "Interés Anual": tasa_anual,
                        "Fecha Primer Pago": solicitud.primer_pago,
                    }).map(([label, value]) => (
                        <div className="d-flex flex-row justify-content-between" key={label}>
                            <span>{label}</span>
                            <span className="text-end fw-semibold">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    };

    return (
        <>
            <Swiper
                className="pb-4 rounded-4"
                style={{
                    width: "100%",
                    "--swiper-pagination-color": "var(--bs-primary)",
                    "--swiper-pagination-bullet-inactive-color": "rgba(var(--bs-secondary-rgb), 0.5)",
                    "--swiper-pagination-bullet-inactive-opacity": "1",
                    "--swiper-pagination-bullet-size": "0.5rem",
                    "--swiper-pagination-bullet-horizontal-gap": "0.5rem",
                    "--swiper-pagination-bullet-border-radius": "0.5rem",
                    "--swiper-pagination-bottom": "1.5px",
                }}
                modules={[ Pagination ]}
                pagination={{ clickable: true }}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                    768: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                }}
            >
                {data.options.map((option,index) => (
                    <SwiperSlide key={index}>
                        <SimulationCard
                            data={option}
                            isSelected={selected === option}
                            onSelect={setSelected}
                            recommended={option.rec ?? ""}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* ESTO AUN NO FUNCIONA */}
            {/* {!isAuthenticated && (
                <button className="btn btn-primary" onClick={saveSimulation}>
                    <Span>
                        <Save size={"1.25rem"} strokeWidth={1.75} />
                        Guardar Simulación
                    </Span>
                </button>
            )} */}
        </>
    );
}

export default Result;