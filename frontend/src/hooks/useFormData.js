import { useRef } from "react";

/**
 * UPDATE: ahora usa useRef en vez de useState, para evitar
 * doble renderizado innecesario en los formularios
 * 
 * hook para manejar la data de un formulario.
 * 
 * - `defaultData` - la data que debe tener el form por defecto.
 */
export const useFormData = (defaultData = {}) => {
    const formData = useRef({ ...defaultData });

    const getFormData = () => formData.current;

    const setField = (key, value) => {
        formData.current = {
            ...formData.current,
            [key]: value,
        };
    };

    const setFields = (values) => {
        formData.current = {
            ...formData.current,
            ...values,
        };
    };

    const resetField = (key) => {
        formData.current = {
            ...formData.current,
            [key]: defaultData[key],
        };
    };

    const resetForm = () => {
        formData.current = { ...defaultData };
    };

    return {
        getFormData,
        setField,
        setFields,
        resetField,
        resetForm,
    };
};
