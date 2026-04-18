import { useRef } from "react";

/**
 * UPDATE: ahora usa useRef en vez de useState, para evitar
 * doble renderizado innecesario en los formularios
 * UPDATE2: ahora usa localStorage, para que al recargar
 * se mantenga el formData
 * 
 * hook para manejar la data de un formulario.
 * 
 * - `defaultData` - la data que debe tener el form por defecto.
 * - `useStorage` - se usa o no (booleano) el storage de la sesion.
 * - `storageKey` - key donde se guardara el formData en la sesion.
 */
export const useFormData = (defaultData = {}, useStorage, storageKey) => {
    const getInitialData = () => {
        if (typeof window === "undefined" || !useStorage) return defaultData;

        const saved = sessionStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : defaultData;
    };

    const formData = useRef(getInitialData());

    const persist = (data) => sessionStorage.setItem(storageKey, JSON.stringify(data));

    const getFormData = () => formData.current;

    const setField = (key, value) => {
        formData.current = {
            ...formData.current,
            [key]: value,
        };
        persist(formData.current);
    };

    const setFields = (values) => {
        formData.current = {
            ...formData.current,
            ...values,
        };
        persist(formData.current);
    };

    const resetField = (key) => {
        formData.current = {
            ...formData.current,
            [key]: defaultData[key],
        };
        persist(formData.current);
    };

    const resetForm = () => {
        formData.current = { ...defaultData };
        persist(formData.current);
    };

    const hasSavedData = () => {
        if (!useStorage) return false;
        const saved = sessionStorage.getItem(storageKey);
        if (saved) return true;
        return false;
    }

    return {
        getFormData,
        setField,
        setFields,
        resetField,
        resetForm,
        hasSavedData,
    };
};
