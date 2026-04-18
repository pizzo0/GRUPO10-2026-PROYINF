import { ArrowLeft, ArrowRight } from "lucide-react";
import { WizardRouter } from "components/renderers/wizardRenderer";
import Span from "components/Span";

import { useAuth } from "context/authContext";
import { formatearRut } from "utils/formatoRut";
import { validations } from "schemas/schema";

const Register = () => {
    const { register } = useAuth();

    const handleRut = ({ e, field, handleChange, setFieldValue }) => {
        handleChange(e);
        setFieldValue(field, formatearRut(e.target.value));
    };

    const struct = {
        id: "register",
        submitButtonText: (
            <Span>
                Crear cuenta
                <ArrowRight size="1rem" />
            </Span>
        ),

        onSubmit: async ({ formData, setSubmitting, setStatus, navigate }) => {
            try {
                const res = await register(formData);
                if (res.ok) {
                    navigate("/iniciar-sesion", { replace: true });
                } else {
                    setStatus(res.error);
                }
            } catch (e) {
                console.error("REGISTER ERROR:", e);
                setSubmitting(false);
            }
        },

        steps: [
            { // 1
                path: "",

                fields: [
                    {
                        id: "nombre",
                        name: "nombre",
                        type: "text",
                        placeholder: "Juanito",
                        label: "Nombre",
                        validation: validations.nombre,
                        required: true
                    },
                    {
                        id: "apellido",
                        name: "apellido",
                        type: "text",
                        placeholder: "Perez",
                        label: "Apellido",
                        validation: validations.apellido,
                        required: true
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
            }, // 2
            {
                path: "credenciales",
                content: (
                    <h1 className="display-1 krona-one-regular">
                        Credenciales
                    </h1>
                ),

                fields: [
                    {
                        id: "rut",
                        name: "rut",
                        type: "text",
                        placeholder: "11.111.111-1",
                        label: "Rut",
                        onChange: handleRut,
                        validation: validations.rut_required,
                        required: true
                    },{
                        id: "email",
                        name: "email",
                        type: "email",
                        placeholder: "correo@ejemplo.com",
                        label: "Correo",
                        validation: validations.email,
                        required: true
                    },
                    {
                        id: "password",
                        name: "password",
                        type: "password",
                        placeholder: "••••••••",
                        label: "Contraseña",
                        validation: validations.password,
                        required: true
                    },
                    {
                        id: "confirmPassword",
                        name: "confirmPassword",
                        type: "password",
                        placeholder: "••••••••",
                        label: "Confirmar contraseña",
                        validation: validations.confirm_password,
                        required: true
                    }
                ],
            }
        ]
    };

    return WizardRouter(struct);
};

export default Register;