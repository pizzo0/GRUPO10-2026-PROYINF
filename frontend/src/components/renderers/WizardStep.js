import { Fragment, useCallback } from "react";
import { useFormikContext } from "formik";

import useWizard from "context/wizardContext";

import { handleOptionalProp, handleOtherKey } from "utils/handlers";

import FillContainer from "components/containers/FillContainer";
import InputsContainer from "components/containers/InputsContainer";

import Select from "components/inputs/Select";
import Input from "components/inputs/Input";

const WizardStep = () => {
    const { values, handleChange, handleBlur, setFieldValue, errors, touched, status } = useFormikContext();
    const { struct, currIndex } = useWizard();

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
        <>
            <FillContainer>
                {struct.steps[currIndex].content && struct.steps[currIndex].content}
            </FillContainer>
            
            <div
                className="d-flex flex-column gap-3"
            >
                {normalizedFields.map((fields, indexFields) => {
                    if (!( struct.steps[currIndex].contentForm || fields.length !== 0 )) return null;
                    return (
                        <InputsContainer key={indexFields}>
                            {struct.steps[currIndex].contentForm && struct.steps[currIndex].contentForm}
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
                                <span className="text-danger">
                                    {status}
                                </span>
                            ) }

                        </InputsContainer>
                    )
                })}
            </div>
        </>
    );
};

export default WizardStep;