import { z } from "zod";
import { createContext, useContext } from "react";

import { handleOtherKey } from "utils/handlers";
import { useFormData } from "hooks/useFormData";
import useStepValidation, { ADELANTE, ATRAS } from "hooks/useStepValidation";

const wizardContext = createContext(null);

export const WizardProvider = ({ children, struct }) => {
    const steps = struct.steps;

    const hasFieldNameOrId = (field) => field && (field.name || field.id);
    const getFieldNameOrId = (field) => field.name ?? field.id;
    const getFieldDefault = (field) => field.default ?? "";
    const getFieldValidation = (field) => field.validation;

    // data por defecto. se usara para generar el formData.
    const defaultData = steps.reduce((acc, step) => {
        if (!step.fields) return acc;

        step.fields.flat().forEach(field => {
            if (!hasFieldNameOrId(field)) return;

            const key = getFieldNameOrId(field);
            acc[key] = getFieldDefault(field);

            // other
            if (field.otherField) {
                const otherKey = handleOtherKey(key);
                acc[otherKey] = getFieldDefault(field.otherField);
            }
        });

        return acc;
    }, {});

    // schemas con zod para validaciones en cada paso
    const schemas = steps.map(step => {
        if (!step.fields) return z.object({});

        const schemaObj = {};

        step.fields.flat().forEach(field => {
            if (!hasFieldNameOrId(field)) return;

            const key = getFieldNameOrId(field);

            schemaObj[key] = getFieldValidation(field) ?? z.any();

            // other
            // if (field.type === "select" && field.otherField) {
            //     const otherKey = handleOtherKey(key);
            //     schemaObj[otherKey] = getFieldValidation(field) ?? z.any();

            //     // se obtiene el del field (no desde el otherField)
            // } else if (field.type !== "select" && field.otherField) {
            //     throw new Error(
            //         "para usar otherField, debes usar 'select' como 'type'"
            //     );
            // }
        });

        return z.object(schemaObj);
    });

    // se genera el formData donde se guardaran los datos de cada field y ls setters
    const { getFormData, setField, setFields } = useFormData(defaultData);

    const { nextStep, prevStep, currIndex, direction } = useStepValidation({
        steps,
        schemas,
        getFormData,
    });

    return (
        <wizardContext.Provider
            value={{
                struct,
                defaultData,
                schemas,
                getFormData,
                setField,
                setFields,
                nextStep,
                prevStep,
                hasFieldNameOrId,
                getFieldNameOrId,
                currIndex,
                direction,
                ADELANTE,
                ATRAS,
                length: struct.steps.length,
            }}
        >
            {children}
        </wizardContext.Provider>
    );
};

const useWizard = () => useContext(wizardContext);
export default useWizard;