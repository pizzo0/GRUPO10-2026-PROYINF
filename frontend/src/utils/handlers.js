// solo para testeo
export const handleDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * con este se crea el key para los "otherField"
 */
export const handleOtherKey = (key) => `${key}_otro`;

/**
 * para que los props opcionales no tengan valor "" o null
 * al darselo a un componente, de forma que no tome estos
 * valores y use el por default (si asi esta definido)
 */
export const handleOptionalProp = (key, value) => value != null && value !== "" ? { [key]: value } : {};

/**
 * valida los `values` con el `schema` de zod, para retornar errores.
 * 
 * - `values` - valores del formulario.
 * - `schema` - schema Zod para validar los datos.
 * - retorna los errores para usar con Formik.
 */
export const handleValidation = (values, schema, step) => {
    // let valuesFix = handleData(values);
    // const res = handleSchema(valuesFix, schema).safeParse(valuesFix);
    const data = handleData(values);
    const res = schema.safeParse(data);

    if (res.success) return {};

    const errors = {};
    for (const i of res.error.issues) {
        const path = i.path[0];
        const field = step.fields?.flat().find(field => field.name === path);

        if (field?.otherField) {
            const otherKey = handleOtherKey(path);
            if (values[path] === "0" || values[path] === 0) {
                errors[otherKey] = i.message;
                continue;
            } else {
                errors[path] = i.message
            }
        }
        else errors[path] = i.message;
    }
    return errors;
};

/**
 * UPDATE: ya no es necesario
 * 
 * retorna un schema, que solo validara los datos presentes en `values`, a partir de un `schema`.
 * 
 * si un `key` no esta definido en el schema, se dejara como opcional.
 * 
 * - `values` - los valores que necesitas del schema, se pasan directo los values del formulario.
 * - `schema` - el schema a transformar
 * - retorna el schema modificado.
 */
// export const handleSchema = (values, schema) => {
//     const keys = Object.keys(values);
//     const shape = schema.shape;

//     const newShape = {};

//     for (const k of keys) {
//         if (k in shape) {
//             newShape[k] = shape[k];
//         } else {
//             newShape[k] = z.any().optional();
//         }
//     }

//     return z.object(newShape);
// };


/**
 * transforma los `values` del formulario, usarlo antes de validar o enviar.
 * 
 * Lo principal es transformar los valores a los que corresponden y mueve
 * los keys tipo "key_otro", al "key" que corresponde, para que su validacion
 * y envio (a backend por ejemplo) funcione correctamente.
 * 
 * - values - los datos a transformar.
 * - retorna los valores ya transformados.
 */
export const handleData = (values) => {
    const data = { ...values };

    Object.keys(values).forEach((key) => {
        const otherKey = handleOtherKey(key);
        if (otherKey in values) {
            if (data[key] === "0" || data[key] === 0) {
                data[key] = values[otherKey];
            }
            delete data[otherKey];
        }
    });
    return data;
};


/**
 * UPDATE: ahora usa el step hecho en el struct en vez de el schema
 * 
 * devuelve el initialValues / CurrentValues / formData del paso actual
 */
export const handleCurrentValues = (formData, step) => {
    const values = {};

    step.fields?.flat().forEach((field) => {
        values[field.name] = formData[field.name] ?? field.default ?? "";

        if (field.otherField) {
            const otherKey = handleOtherKey(field.name);
            values[otherKey] = formData[otherKey] ?? field.otherField.default ?? "";
        }
    });

    return values;
};