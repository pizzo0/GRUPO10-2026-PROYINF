import { z } from "zod";

import { formatearDineroStrBonito } from "utils/formatoDinero";

const cleanNumber = (val) => {
    if (typeof val === "string") {
        return val.replace(/[^\d.-]/g, "");
    }
    return val;
}

export const MIN_MONTO = 10_000;
export const MAX_MONTO = 100_000_000;

export const MIN_PLAZO = 2;
export const MAX_PLAZO = 60;

const MIN_MESES_PRIMER_PAGO = 1;
const MAX_MESES_PRIMER_PAGO = 3;

const hoy = new Date();
export const MIN_PRIMER_PAGO = new Date(hoy.getFullYear(),hoy.getMonth()+MIN_MESES_PRIMER_PAGO,hoy.getDate());
export const MAX_PRIMER_PAGO = new Date(hoy.getFullYear(),hoy.getMonth()+MAX_MESES_PRIMER_PAGO,hoy.getDate());
const MIN_PRIMER_PAGO_FIXED = new Date(MIN_PRIMER_PAGO);
MIN_PRIMER_PAGO_FIXED.setDate(MIN_PRIMER_PAGO.getDate()-1);

export const rutValidation = z.string().refine((val) => {
    if (!val || val === "" || val === "0") return true;
    
    return /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]{1}$/.test(val);
}, {
    message: "Formato de Rut invalido."
});

export const montoValidation = z.preprocess(
    cleanNumber,
    z.coerce.number({
        required_error: "Debes ingresar un monto.",
        invalid_type_error: "El monto no es valido.",
    })
        .min(MIN_MONTO, `Ingresa un monto superior a ${formatearDineroStrBonito(MIN_MONTO)}.`)
        .max(MAX_MONTO, `Ingresa un monto inferior a ${formatearDineroStrBonito(MAX_MONTO)}.`),
);

export const rentaValidation = z.preprocess(
    cleanNumber,
    z.coerce.number({
        required_error: "Debes ingresar tu renta.",
        invalid_type_error: "La renta no es valida.",
    })
        .min(1, "Debes ingresar tu renta."),
);

export const plazoValidation = z.preprocess(
    cleanNumber,
    z.coerce.number({
        required_error: "Debes ingresar un plazo.",
        invalid_type_error: "El plazo no es valido.",
    })
        .min(MIN_PLAZO, `Ingresa un plazo mayor a ${MIN_PLAZO} meses.`)
        .max(MAX_PLAZO, `Ingresa un plazo menor a ${MAX_PLAZO} meses.`),
);

// con Date no permitia validar fechas incompletas,
// asi que se dejo como string
export const primerPagoValidation = z.string({
    required_error: "Debes ingresar una fecha.",
})
    .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "La fecha no es válida.",
    })
    .transform((val) => new Date(val))
    .refine((date) => date >= MIN_PRIMER_PAGO_FIXED, {
        message: `El primer pago debe ser desde ${MIN_PRIMER_PAGO.toLocaleDateString()}`,
    })
    .refine((date) => date <= MAX_PRIMER_PAGO, {
        message: `El primer pago debe ser antes de ${MAX_PRIMER_PAGO.toLocaleDateString()}`,
    });

export const validations = {
    rut: rutValidation,
    monto: montoValidation,
    renta: rentaValidation,
    plazo: plazoValidation,
    primer_pago: primerPagoValidation,
    rut_required: z.string()
        .min(1, "El Rut es obligatorio.")
        .refine((val) => {
            if (!val || val === "" || val === "0") return true;
            
            return /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]{1}$/.test(val);
        }, {
            message: "Formato de Rut invalido."
        }),
    password_required: z.string()
        .min(1, "Debes ingresar tu contraseña."),
    nombre: z.string()
        .min(1, "El nombre es obligatorio.")
        .max(50, "El nombre es demasiado largo."),
    apellido: z.string()
        .min(1, "El apellido es obligatorio.")
        .max(50, "El apellido es demasiado largo."),
    email: z.string()
        .min(1, "El correo es obligatorio.")
        .email("Correo inválido."),
    password: z.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres.")
        .max(32, "La contraseña es demasiado larga."),
    confirm_password: z.string()
        .min(1, "Debes confirmar la contraseña."),
};

// ya no se usa esto
// export const schema = z.object({
//     rut: rutValidation,
//     monto: montoValidation,
//     renta: rentaValidation,
//     plazo: plazoValidation,
//     primer_pago: primerPagoValidation,
// });

export const primerPagoDefault = new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());

export const defaultData = {
    rut: "",
    monto: "",
    renta: "",
    renta_otro: "",
    plazo: "",
    primer_pago: primerPagoDefault.toISOString().split("T")[0],
};