import { ArrowLeft, ArrowRight } from "lucide-react";
import { WizardRouter } from "components/renderers/wizardRenderer";

import Span from "components/Span";

import { useAuth } from "context/authContext";
import { formatearRut } from "utils/formatoRut";
import { validations } from "schemas/schema";

const Login = () => {
    const { login } = useAuth();

    const handleRut = ({ e, field, handleChange, setFieldValue }) => {
        handleChange(e);
        setFieldValue(field, formatearRut(e.target.value));
    };

    const struct = {
        id: "login",
        submitButtonText: (
            <Span>
                Iniciar sesión
                <ArrowRight size="1rem" />
            </Span>
        ),

        onSubmit: async ({ formData, setSubmitting, setStatus, navigate }) => {
            try {
                const res = await login(formData.rut, formData.password);

                if (res.ok) {
                    navigate("/", { replace: true });
                } else {
                    setStatus(res.error);
                }
            } catch (e) {
                console.error(e);
                setSubmitting(false);
            }
        },

        steps: [
            {
                path: "",

                fields: [
                    {
                        id: "rut",
                        name: "rut",
                        type: "text",
                        placeholder: "11.111.111-1",
                        onChange: handleRut,
                        label: "Rut",
                        validation: validations.rut_required,
                        required: true,
                    },
                    {
                        id: "password",
                        name: "password",
                        type: "password",
                        placeholder: "••••••••",
                        label: "Contraseña",
                        validation: validations.password_required,
                        required: true,
                    }
                ],

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
            }
        ]
    };

    return WizardRouter(struct);
};

export default Login;