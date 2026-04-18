import { useEffect, useState } from "react";
import { useNavigate, useResolvedPath, useLocation } from "react-router-dom";
import { handleData, handleCurrentValues } from "utils/handlers";

export const ADELANTE = "forward";
export const ATRAS = "backward";

const getCurrentPath = (location, basePath) => location.pathname.startsWith(basePath) ? location.pathname.slice(basePath.length).replace(/^\//, "") : "";
const getCurrentIndex = (steps, currPath) => steps.findIndex(step => (step.path || "") === currPath);
const getPath = (path) => path || ".";

/**
 * UPDATE: ya no es necesario el mainPath, solo se
 * navega usando { relative: "route" }.
 * 
 * hook que valida los pasos previos de un wizard multistep form.
 * 
 * mas reutilizable :)
 * 
 * - `steps` - array con los paths de los steps.
 * - `getFormData` - para obtener la data del formulario.
 * - `schemas` - array con los schemas de cada paso del formulario.
 * - `useStorage` - se usa o no (booleano) el storage de la sesion.
 * - `storageKey` - key donde se guardara el formData en la sesion.
 */
const useStepValidation = ({ steps, getFormData, schemas, hasSavedData }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const resolved = useResolvedPath(".");

    const [ direction, setDirection ] = useState("");

    const basePath = resolved.pathname.replace(/\/$/, "");

    const currPath = getCurrentPath(location, basePath);
    const currIndex = getCurrentIndex(steps,currPath);

    const nextStep = () => {
        if (currIndex < steps.length - 1) {
            setDirection(ADELANTE);
            navigate(getPath(steps[currIndex + 1].path), { relative: "route" });
        }
    };

    const prevStep = () => {
        if (currIndex > 0) {
            setDirection(ATRAS);
            navigate(getPath(steps[currIndex - 1].path), { relative: "route" });
        }
    };

    useEffect(() => {
        // no valida si te mueves para atras
        if (direction === ATRAS) return;

        // si estas donde no deberias, te manda para el step 0
        // si recien se carga el forumlario (direction === "")
        // entonces tambien te manda al step 0
        if (!hasSavedData() && (currIndex === -1 || (direction === "" && currIndex !== 0))) {
            navigate(getPath(steps[0].path), { relative: "route" });
            return;
        }

        // para rederigir a la parte del formulario
        // que no esta completo
        let newIndex = currIndex;
        let prevHadSchema = true;
        const check = steps.length < (currIndex + 1) ? steps.length : currIndex + 1;
        const fixedFormData = handleData(getFormData());
        for (let i = 0; i < check; i++) {
            if ((Object.keys(schemas[i].shape).length === 0) && prevHadSchema) {
                prevHadSchema = false;
                newIndex = i;
                continue;
            }

            prevHadSchema = true;
            const stepData = handleCurrentValues(fixedFormData, steps[i]);
            const res = schemas[i].safeParse(stepData);

            if (!res.success) {
                newIndex = i;
                break;
            }
        }

        // solo deberia redirigirte si estas en un index
        // mayor al que te quiere redirigir
        // No deberia redirigir si el paso incompleto es
        // mayor o igual al que esta actualmente
        if (currIndex > newIndex) {
            setDirection(ATRAS);
            navigate(getPath(steps[newIndex].path), { relative: "route" });
        }

    }, [getFormData, schemas, steps, navigate, currIndex, direction, hasSavedData]);

    return { nextStep, prevStep, currIndex, direction };
};

export default useStepValidation;