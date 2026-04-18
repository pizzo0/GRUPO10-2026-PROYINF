import { useEffect, useState } from "react";

import { ArrowLeft, ArrowRight } from 'lucide-react';

import { useAuth } from 'context/authContext';

import { WizardRouter } from "components/renderers/wizardRenderer";

import {
    validations,
    MAX_PRIMER_PAGO,
    MIN_PRIMER_PAGO,
    MIN_MONTO,
    MAX_MONTO,
    MIN_PLAZO,
    MAX_PLAZO,
    defaultData
} from "schemas/schema";

import {
    formatearDineroNumber,
    formatearDineroStr,
    formatearDineroStrBonito
} from "utils/formatoDinero";

import { formatearRut } from "utils/formatoRut";
import { optionsRenta } from "utils/options";

import Span from "components/Span";
import Result from './Result';

export const Simulator = () => {
    const { user } = useAuth()
    const [selected, setSelected] = useState(null);

    const handleRut = ({e, field, handleChange, setFieldValue}) => {
        handleChange(e);
        setFieldValue(field, formatearRut(e.target.value));
    };

    const handleDinero = ({e, field, max, handleChange, setFieldValue, values}) => {
        handleChange(e);
        const input = e.target;
        const selectionStart = input.selectionStart;
        const value = formatearDineroNumber(input.value);

        if (!value) {
            setFieldValue(field, "");
            return;
        }

        const newValue = formatearDineroStr(value);
        let diff = newValue.length - (values[field] ? values[field].length : 0);

        if (value > max || value.length > max.toString().length) {
            setFieldValue(field, values[field]);
            diff = 0;
        } else {
            setFieldValue(field, newValue);
        }

        requestAnimationFrame(() => {
            if (diff < 0) diff++;
            if (diff > 0) diff--;
            const newPos = Math.max(selectionStart + diff, 0);
            input.setSelectionRange(newPos, newPos);
        });
    };

    const handlePlazo = ({e, field, max, handleChange, setFieldValue, values}) => {
        handleChange(e);
        const value = e.target.value;
        if (value > max || value.length > max.toString().length)
            setFieldValue(field, values[field]);
        else setFieldValue(field, value);
    };

    const struct = {
        id: "simulator",
        name: "Simulador",
        stepper: true,
        submitButtonText: (
            <Span>
                Simular mi crédito
                <ArrowRight size={"1rem"} />
            </Span>
        ),
        onSubmit: async ({ formData, setSubmitting, navigate }) => {
            console.log("wa my shi");
            try {
                navigate("/solicitar-credito", {
                    state: { request:selected },
                })
            } catch (e) {
                console.error("ERROR:", e);
                setSubmitting(false);
            }
        },
        steps: [
            { // 1
                path: "", // para que sea /simulador
                name: "Simula tu crédito de consumo",
                // content: (
                //     <div className="d-flex flex-column fit-flex justify-content-center">
                //         <h1 className="display-3 krona-one-regular">
                //             Simula tu crédito de consumo
                //         </h1>
                //     </div>
                // ),
                fields: user ? null : [
                    { // RUT
                        id: "rut",
                        name: "rut",
                        type: "text",
                        placeholder: "11.111.111-1",
                        textHelp: "Ingresar tu Rut es opcional.",
                        onChange: handleRut,

                        label: "Rut",

                        validation: validations.rut,
                    }
                ],
                continueButtonText: user ? (
                    <Span>
                        Continuar con mi cuenta
                        <ArrowRight size={"1rem"} />
                    </Span>
                ) : null,
                bottomButtons: [
                    {
                        text: (
                            <Span>
                                <ArrowLeft size={"1rem"} />
                                Volver al inicio
                            </Span>
                        ),
                        onClick: ({navigate}) => navigate("/"),
                        className: "btn btn-secondary btn-opacity-25"
                    }
                ]
            }, { // 2
                path: "credito",
                name: "Datos del credito",
                fields: [
                    [
                        { // MONTO
                            id: "monto",
                            name: "monto",
                            type: "text",
                            placeholder: "1,500,000",
                            textHelp: `El monto debe ser entre ${formatearDineroStrBonito(MIN_MONTO)} y ${formatearDineroStrBonito(MAX_MONTO)}`,

                            // min: MIN_MONTO,
                            max: MAX_MONTO,

                            onChange: handleDinero,
                            label: "Monto",
                            required: true,

                            validation: validations.monto,
                        },
                        { // RENTA
                            id: "renta",
                            name: "renta",
                            type: "select",
                            placeholder: "Selecciona tu renta",
                            textHelp: "Rango aproximado de tu renta liquida mensual.",

                            label: "Renta",
                            options: optionsRenta,
                            required: true,

                            otherField: {
                                type: "text",
                                placeholder: `${formatearDineroStr(1000000)}`,
                                textHelp: "Un aproximado de tu renta liquida mensual.",

                                // min: MIN_MONTO,
                                max: MAX_MONTO,

                                onChange: handleDinero,
                                required: true,
                            },

                            validation: validations.renta,
                        }, { // PLAZO
                            id: "plazo",
                            name: "plazo",
                            type: "number",
                            placeholder: "3",
                            textHelp: `Ingrese un plazo entre ${MIN_PLAZO} y ${MAX_PLAZO} meses.`,

                            min: MIN_PLAZO,
                            max: MAX_PLAZO,

                            onChange: handlePlazo,

                            label: "Plazo",
                            required: true,

                            validation: validations.plazo,
                        }, { // PRIMER PAGO
                            id: "primer_pago",
                            name: "primer_pago",
                            type: "date",
                            // placeholder: "",
                            textHelp: "Fecha en la que puedes realizar tu primer pago.",

                            min: MIN_PRIMER_PAGO.toISOString().split("T")[0],
                            max: MAX_PRIMER_PAGO.toISOString().split("T")[0],

                            label: "Primer pago",
                            default: defaultData.primer_pago,
                            required: true,

                            validation: validations.primer_pago,
                        }
                    ]
                ]
            }, {
                path: "resultado",
                name: "Resultados de tu simulación",
                contentForm: ({getFormData}) => <Result
                    formData={getFormData()}
                    selected={selected}
                    setSelected={setSelected}
                />
            }
        ]
    };
    
    return WizardRouter(struct);
}

export default Simulator;