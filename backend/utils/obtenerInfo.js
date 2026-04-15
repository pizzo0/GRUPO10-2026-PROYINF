import CONFIG_CREDITOS from "../config/creditos/configCreditos.js";

/**
 * para obtener la tasa base a partir de la tabla.
 * 
 * - tipo - tipo de credito.
 * - monto - monto del credito.
 * - plazo - numero de cuotas.
 */
export const obtenerTasaBase = (
    tipo,
    monto,
    plazo
) => {
    const CONFIG_TASA_BASE_TIPO = CONFIG_CREDITOS[tipo].tablaTasaBase;
    if (!CONFIG_TASA_BASE_TIPO) return 1; // por si acaso
    
    const tabla = [...CONFIG_TASA_BASE_TIPO].sort((a,b) => {
        if (a.montoMax !== b.montoMax) return a.montoMax - b.montoMax;
        return a.plazoMax - b.plazoMax;
    });
    if (tabla.length === 0) return null; // por si acaso

    for ( const regla of tabla) if (monto <= regla.montoMax && plazo <= regla.plazoMax) return regla.tasa;
    
    return null; // por si acaso
};

export const obtenerScore = (rut) => {
    return 800;
}

export const obtenerCapacidadPago = (renta,monto,plazo) => {
    return 0;
}