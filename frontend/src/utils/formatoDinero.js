/**
 * formatea un string (`value`) a numero.
 * 
 * ejemplo: "1.000.000" -> "1000000"
 * 
 * - `value` - el string a formatear.
 * - retorna el string como numero.
 * 
 */
export const formatearDineroNumber = (value) => (value) && Number(value.toString().replace(/\D/g, ''));

/**
 * formatea un numero (`value`) a un formato string.
 * 
 * ejemplo: "1000000" -> "1.000.000".
 * 
 * - `value` - el valor (numero) a formatear.
 * - retorna el valor formateado.
 */
export const formatearDineroStr = (value) => (value) && value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * formatea un numero (`value`) a un formato string bonito (xD).
 * 
 * ejemplo: "1000000" -> "CLP 1.000.000".
 * 
 * - `value` - el valor (numero) a formatear.
 * - retorna el valor formateado.
 * 
 */
export const formatearDineroStrBonito = (value) => (value) && '$ ' + formatearDineroStr(value);