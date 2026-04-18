import { Fragment, useCallback } from "react";
import { useFormikContext } from "formik";

import useWizard from "context/wizardContext";

import { handleOptionalProp, handleOtherKey } from "utils/handlers";

import InputsContainer from "components/containers/InputsContainer";

import Select from "components/inputs/Select";
import Input from "components/inputs/Input";
import Span from "components/Span";
import Container from "components/containers/Container";
import { SurfaceRow } from "components/containers/Surface";

const WizardStep = () => {
    const formikContext = useFormikContext();
    const { values, handleChange, handleBlur, setFieldValue, errors, touched, status } = formikContext;
    const wizardContext = useWizard();
    const { struct, currIndex, length } = wizardContext;

    // console.log("RENDERIZANDO STEP");

    const getOnChange = useCallback((field, otherField = null) => {
        if (otherField && otherField.onChange) {
            return (e) => otherField.onChange({
                e,
                field:handleOtherKey(field.name),
                handleChange,
                setFieldValue,
                values,
                ...handleOptionalProp("min", otherField.min),
                ...handleOptionalProp("max", otherField.max),
            })
        } else if (field.onChange) {
            return (e) => field.onChange({
                e,
                field:field.name,
                handleChange,
                setFieldValue,
                values,
                ...handleOptionalProp("min", field.min),
                ...handleOptionalProp("max", field.max),
            })
        }
        return handleChange;
    }, [values, handleChange, setFieldValue]);

    const rawFields = struct.steps[currIndex].fields ?? [];
    const normalizedFields = Array.isArray(rawFields[0]) ? rawFields : [rawFields];

    return (
        <Container
            className="d-flex flex-column justify-content-center gap-3 w-100"
        >
            <Container className="fit-flex-fixed px-4 justify-content-center align-items-center mb-4">
                <Container className="w-100">
                    <Span className="fs-2 krona-one-regular">
                        {struct.name ?? "Formulario"}
                    </Span>
                    <Span className="display-5 krona-one-regular">
                        {struct.steps[currIndex].name ?? "Completa los datos"}
                    </Span>
                </Container>
                {struct.steps[currIndex].content && struct.steps[currIndex].content({
                    ...formikContext, ...wizardContext,
                })}
            </Container>

            {
                struct.stepper ? (
                    <SurfaceRow className="align-items-center px-4 py-3 rounded-4">
                        {struct.steps.map((step, index) => {
                            return (
                                <Fragment key={index}>
                                    <div
                                        className={`d-flex justify-content-center align-items-center border ${currIndex === index ? "bg-primary text-black" : ""} ${index > currIndex ? "opacity-50" : ""} border-primary rounded-pill user-select-none`}
                                        style={{
                                            width: "2rem",
                                            height: "2rem",
                                        }}
                                    >
                                        {index+1}
                                    </div>
                                    {
                                        (index + 1) !== length &&
                                        <div className={`d-flex fit-flex bg-primary ${index >= currIndex ? "bg-opacity-50" : ""}`} style={{
                                            height: "1px",
                                        }}></div>
                                    }
                                </Fragment>
                            )
                        })}
                    </SurfaceRow>
                ) : (
                    <></>
                )
            }
            
            {normalizedFields.map((fields, indexFields) => {
                if (!( struct.steps[currIndex].contentForm || fields.length !== 0 )) return null;
                return (
                    <InputsContainer key={indexFields}>
                        {struct.steps[currIndex].contentForm && struct.steps[currIndex].contentForm({
                            ...formikContext, ...wizardContext,
                        })}
                        {fields.map((field, indexField) => {
                            if (field.type === "select") {
                                return (
                                    <Fragment
                                        key={field.id ?? field.name ?? indexField}
                                    >
                                        <Select
                                            id={field.id ?? field.name}
                                            name={field.name}
                                            type={field.type}
                                            value={values[field.name] ?? ""}
                                            options={field.options}
                                            label={field.label ?? field.name}
                                            {...handleOptionalProp("placeholder",field.placeholder)}
                                            {...handleOptionalProp("textHelp",field.textHelp)}
                                            onChange={getOnChange(field)}
                                            onBlur={handleBlur}
                                            errors={errors}
                                            touched={touched}
                                            required={field.required ?? false}
                                        />

                                        { field.otherField && (values[field.name] ?? "") === (field.otherValue ?? "0") && (
                                            <Input
                                                id={handleOtherKey((field.id ?? field.name))}
                                                name={handleOtherKey((field.name))}
                                                type={field.otherField.type}
                                                value={values[handleOtherKey((field.name))] ?? ""}
                                                label={field.otherField.label ?? `${field.label ?? field.name} (Otro)`}
                                                {...handleOptionalProp("placeholder",field.otherField.placeholder)}
                                                {...handleOptionalProp("textHelp",field.otherField.textHelp)}
                                                {...handleOptionalProp("min",field.otherField.min)}
                                                {...handleOptionalProp("max",field.otherField.max)}
                                                onChange={getOnChange(field,field.otherField)}
                                                onBlur={handleBlur}
                                                errors={errors}
                                                touched={touched}
                                                required={field.otherField.required ?? false}
                                            />
                                        )}
                                    </Fragment>
                                );
                            } else {
                                return (
                                    <Input
                                        key={field.id ?? field.name ?? indexField}
                                        id={field.id ?? field.name}
                                        name={field.name}
                                        type={field.type}
                                        value={values[field.name] ?? ""}
                                        label={field.label ?? field.name}
                                        {...handleOptionalProp("placeholder",field.placeholder)}
                                        {...handleOptionalProp("textHelp",field.textHelp)}
                                        {...handleOptionalProp("min",field.min)}
                                        {...handleOptionalProp("max",field.max)}
                                        onChange={getOnChange(field)}
                                        onBlur={handleBlur}
                                        errors={errors}
                                        touched={touched}
                                        required={field.required ?? false}
                                    />
                                );
                            }
                        })}
                        
                        { status && (
                            <Span className="text-danger">
                                {status}
                            </Span>
                        ) }

                    </InputsContainer>
                )
            })}
        </Container>
    );
};

export default WizardStep;