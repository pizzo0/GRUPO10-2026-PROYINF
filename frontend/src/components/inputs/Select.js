import ReactSelect from "react-select";

import FieldWrapper from "components/subComponents/FieldWrapper";

const bootstrapSelectStyles = (hasError) => ({
    control: (base, state) => ({
        ...base,
        minHeight: "38px",
        borderRadius: "0.375rem",
        borderColor: hasError
            ? "var(--bs-danger)"
            : state.isFocused
            ? "var(--bs-text)"
            : "var(--bs-primary)",
        boxShadow: state.isFocused
            ? "0 0 0 0.1rem rgba(var(--bs-primary-rgb),.25)"
            : "none",
        "&:hover": {
            borderColor: hasError ? "var(--bs-danger)" : "var(--bs-primary)",
        },
        fontSize: "1rem",
        backgroundColor: "transparent",
        padding: "0.7rem 1rem",
    }),

    valueContainer: (base) => ({
        ...base,
        padding: "0rem 0rem",
    }),

    input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
    }),

    placeholder: (base) => ({
        ...base,
        color: "var(--bs-secondary-color)",
    }),

    singleValue: (base) => ({
        ...base,
        color: "var(--bs-body-color)",
    }),

    dropdownIndicator: (base) => ({
        ...base,
        padding: "0 0",
        color: "var(--bs-body-color)",
    }),

    clearIndicator: (base) => ({
        ...base,
        color: "var(--bs-body-color)",
        padding: "0 10px 0 0",
        cursor: "pointer",
    }),

    indicatorSeparator: () => ({
        display: "none",
    }),

    menu: (base) => ({
        ...base,
        borderRadius: "0.375rem",
        marginTop: "4px",
        boxShadow: "0 0.5rem 1rem rgba(var(--bs-primary-rgb),.1)",
        zIndex: 10,
        backgroundColor: "var(--bs-body-bg)",
    }),

    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? "var(--bs-primary)"
            : state.isFocused
            ? "rgba(var(--bs-secondary-rgb), 0.5)"
            : "transparent",
        color: state.isSelected ? "var(--bs-body-bg)" : "var(--bs-secondary-color)",
        cursor: "pointer",
    }),
});

const Select = ({
    id,
    name,
    label,
    required = false,
    options = [],
    placeholder = "Seleccione una opción",
    textHelp,
    value,
    onChange,
    onBlur,
    className = "",
    errors = {},
    touched = {},
}) => {
    const rsOptions = options.map(opt => ({
        value: opt.value,
        label: opt.label
    }));
    const selectedOption = rsOptions.find(opt => opt.value === value) || null;
    const handleChange = (selected) => {
        onChange({
            target: {
                name,
                value: selected ? selected.value : ""
            }
        });
    };
    const handleBlur = () => {
        onBlur({
            target: {
                name
            }
        });
    };

    return (
        <FieldWrapper
            id={id}
            name={name}
            label={label}
            textHelp={textHelp}
            required={required}
            errors={errors}
            touched={touched}
        >
            {({ hasError }) => (
                <ReactSelect
                    inputId={id || name}
                    name={name}
                    options={rsOptions}
                    value={selectedOption}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    classNamePrefix="react-select"
                    className={`${hasError ? "is-invalid" : ""} ${className}`}
                    // isClearable
                    styles={bootstrapSelectStyles(hasError)}
                />
            )}
        </FieldWrapper>
    );
};

export default Select;