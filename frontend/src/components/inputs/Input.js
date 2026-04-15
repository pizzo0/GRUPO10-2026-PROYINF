import { ErrorMessage } from "formik";
import TextHelp from "components/subComponents/TextHelp";


/**
 * input para un formulario.
 * 
 * - retorna el input.
*/
const Input = ({
    id,
    name,
    label,
    required = false,
    maxLength,
    placeholder = "",
    type = "text",
    textHelp,
    min,
    max,
    value,
    onChange,
    onBlur,
    className = "",
    errors = {},
    touched = {},
}) => {
    const hasError = touched[name] && errors[name];

    return (
        <div className="mt-2 position-relative mt-3">
            {label && (
                <label htmlFor={id || name} className={`form-label bg-light ${hasError ? "text-danger" : ""}`} style={{position:"absolute", display:"flex", justifyContent:"center", alignItems:"center", padding: "0 0.25rem", top:"-0.8rem", left: "0.75rem", gap:"0.25rem"}}>
                    {label}
                    {required && <span className="text-danger"> *</span>}
                </label>
            )}

            <input
                id={id || name}
                name={name}
                type={type}
                placeholder={placeholder}
                className={`input-form form-control ${hasError ? "is-invalid" : ""} ${className}`}
                maxLength={maxLength}
                min={min}
                max={max}
                required={required}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
            />

            { hasError ? (
                    <ErrorMessage name={name}>
                        {(msg) => <div className="invalid-feedback d-block">{msg}</div>}
                    </ErrorMessage>
                ) : (
                    textHelp
                    &&
                    <TextHelp
                        id={id ?? ""}
                        name={name ?? ""}
                    >
                        {textHelp}
                    </TextHelp>
                )
            }

        </div>
    );
};

export default Input;