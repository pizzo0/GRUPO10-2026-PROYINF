import { ArrowRight, ArrowLeft } from 'lucide-react';

import { WizardRouter } from "components/renderers/wizardRenderer"

const Apply = () => {
    const struct = {
        submitButtonText: "Solicitar credito",
        onSubmit: async ({ formData, setSubmitting, navigate }) => {
            // try {
            //     navigate(
            //         resPath,
            //         {
            //             relative: "route",
            //             state: { formData }
            //         }
            //     );
            // } catch (e) {
            //     console.error("ERROR:", e)
            //     setSubmitting(false);
            // }
        },
        steps: [
            { // 1
                path: "",
                content: (
                    <h1 className="display-3 krona-one-regular">
                        Solicita tu crédito de consumo
                    </h1>
                ),
                contentForm: (
                    <div>
                        <p className="mb-3">
                            Antes de continuar con tu solicitud, necesitaremos validar algunos antecedentes.
                        </p>
                        <p className="mb-2 fw-semibold">
                            Ten a mano los siguientes documentos:
                        </p>
                        <ul className="mb-3">
                            <li>Cédula de identidad</li>
                            <li>Liquidaciones de sueldo de los últimos 3 meses</li>
                            <li>Certificado de cotizaciones AFP (últimos 12 meses)</li>
                            <li>Comprobante de domicilio (cuenta de luz, agua o estado bancario)</li>
                            <li>Cartola de cuenta bancaria (opcional)</li>
                        </ul>
                        <p className="mb-3">
                            Si eres trabajador independiente, puedes acreditar tus ingresos con boletas de honorarios o el Formulario 29 del SII.
                        </p>

                        {/* <p>
                            Si no cuentas con toda la documentación en este momento, puedes guardar tu simulación y retomarla más adelante sin problemas.
                        </p> */}
                    </div>
                ),
                continueButtonText: (
                    <span className="d-inline-flex align-items-center gap-1">
                        Continuar con mi solicitud
                        <ArrowRight size={"1rem"} />
                    </span>
                ),
                bottomButtons: [
                    {
                        text: (
                            <span className="d-inline-flex align-items-center gap-1">
                                <ArrowLeft size={"1rem"} />
                                Volver al inicio
                            </span>
                        ),
                        onClick: ({navigate}) => navigate("/"),
                        className: "btn btn-secondary"
                    }
                ]
            },
        ]
    };

    return WizardRouter(struct);
}

export default Apply;