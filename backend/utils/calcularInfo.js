import CONFIG_CREDITOS from "../config/creditos/configCreditos.js";
import { obtenerTasaBase } from "./obtenerInfo.js";

/**
 * calcula el ajuste de riesgo estimado
 *
 * - monto - monto del credito.
 * - plazo - numero de cuotas.
 * - renta - renta mensual de la persona.
 */
export const calcularRiesgoEstimado = (tipo, monto, plazo, renta) => {
    const ratio = monto/(renta*plazo);
    if (!Number.isFinite(ratio) || ratio < 0) return 0;

    // USAMOS LA TABLA
    const tabla = [...CONFIG_CREDITOS[tipo].tablaRiesgoEstimado].sort((a,b) => a.maxRango - b.maxRango);
    if (CONFIG_CREDITOS[tipo].usarTablaRiesgoEstimado) {
        for (const r of tabla) if (ratio <= r.maxRango) return r.ajuste;
        return tabla.at(-1).ajuste ?? 0; // por si acaso
    }

    // USAMOS EL AJUSTE LOGISTICO
    const {
        maximo: AJUSTE_MAX,
        pendiente: K,
        ratio: X0,
    } = CONFIG_CREDITOS[tipo].ajusteLogisticoRiesgoEstimado;

    return AJUSTE_MAX / (1 + Math.exp(-K * (ratio - X0)));
};

// pasa tasa mensual a anual nominal
export const calcularMensualAAnualNominal = (t) => t*12;

// pasa tasa anual a mensual nominal
export const calcularAnualAMensualNominal = (a) => a/12;

// pasa tasa mensual a anual
export const calcularMensualAAnual = (t) => Math.pow(1 + t, 12) - 1;

// pasa tasa anual a mensual
export const calcularAnualAMensual = (a) => Math.pow(1 + a, 1 / 12) - 1;

/**
 * calcula la tasa interna de retorno (TIR), para calcular el CAE del credito.
 * 
 * - flujoCaja - arreglo con flujos de dinero del credito
 * - guess - valor inicial de aproximacion
 */
const calcularTIR = (flujoCaja, guess = 0.01) => {
    const tienePos = flujoCaja.some(v => v > 0);
    const tieneNeg = flujoCaja.some(v => v < 0);
    if (!tienePos || !tieneNeg) return null;

    let rate = guess;

    for (let i = 0; i < 50; i++) {
        let f = 0;
        let df = 0;

        flujoCaja.forEach((v, t) => {
            const denom = Math.pow(1 + rate, t);
            f += v / denom;
            df -= (t * v) / (denom * (1 + rate));
        });

        if (df === 0) return null;

        const newRate = rate - f / df;
        if (Math.abs(newRate - rate) < 1e-10) return rate;

        rate = newRate;
    }
    return rate;
};

/**
 * calcula el cae, considerando costos unicos y mensuales tambien!!
 * 
 * - monto - monto del credito.
 * - plazo - numero de cuotas.
 * - cuota - cuanto pagara la persona mensualmente.
 * - costosUnicos - costos unicos del credito, como gasto de operaciones.
 * - costosMensuales - costos mensuales del credito, como seguros (desgravamen, cesantia, etc).
 */
export const calcularCAE = (
    monto,
    plazo,
    cuota,
    costosUnicos = 0,
    costosMensuales = 0
) => {
    const montoEntregado = monto - costosUnicos;

    const flujos = [montoEntregado];
    const cuotaReal = cuota + costosMensuales;

    for (let i = 1; i <= plazo; i++) flujos.push(-cuotaReal);

    const tirMensual = calcularTIR(flujos);
    if (tirMensual == null) return null;

    return (calcularMensualAAnual(tirMensual)) * 100;
};

/**
 * calcula tasa mensual final aplicando ajustes de riesgo estimado y limites anuales
 * 
 * - tasaBaseMensual - TNM desde la tabla
 * - ajusteRiesgoMensual - ajuste
 */
export const calcularTasaMensualFinal = (
    tipo,
    tasaBaseMensual,
    ajusteRiesgoMensual,
) => {
    const CONFIG_CREDITO_TIPO = CONFIG_CREDITOS[tipo];
    if (!CONFIG_CREDITO_TIPO) return null;

    const TASA_ANUAL_MIN = CONFIG_CREDITO_TIPO.interesAnualMin;
    const TASA_ANUAL_MAX = CONFIG_CREDITO_TIPO.interesAnualMax;

    if (TASA_ANUAL_MIN == null
        || TASA_ANUAL_MAX == null
        || !Number.isFinite(tasaBaseMensual)
        || !Number.isFinite(ajusteRiesgoMensual)
    ) return null;

    const tasaMensualPre = tasaBaseMensual + ajusteRiesgoMensual;
    const tasaAnualPre = calcularMensualAAnualNominal(tasaMensualPre);

    const tasaAnualAjustada = Math.min(Math.max(tasaAnualPre, TASA_ANUAL_MIN),TASA_ANUAL_MAX);
    return calcularAnualAMensualNominal(tasaAnualAjustada);
};

/**
 * redondea montos, ESTO ES SOLO PARA LAS RECOMENADCIONES EN EL
 * SIMULADOR !!!
 * 
 * por ejemplo:
 * 23_982_938 -> 24_000_000
 * 14_930 -> 15_000
 * 13_103_000 -> 13_000_000
 */
export const calcularRedondeoMonto = (monto) => {
    if (monto <= 0) return 0;
    const magnitud = Math.pow(10, Math.floor(Math.log10(monto)) - 1);
    return Math.round(monto/magnitud) * magnitud;
}

/**
 * genera montos candidatos, ESTO ES SOLO PARA LAS RECOMENDACIONES
 * EN EL SIMULADOR !!!!
 */
export const calcularMontosCandidatos = (
    monto,
    variacion = 0.075
) => {
    const min = monto * (1-variacion);
    const max = monto * (1+variacion);

    const candidatos = new Set();
    for (let i = min; i <= max; i += (max-min)/5) candidatos.add(calcularRedondeoMonto(i));

    return Array.from(candidatos);
}

/**
 * genera plazos candidatos, ESTO ES SOLO PARA LAS RECOMENDACIONES
 * EN EL SIMULADOR !!!!
 */
export const calcularPlazosCandidatos = (
    plazo,
    plazoMin,
    plazoMax,
    variacion = 0.5
) => {
    const min = Math.max(plazoMin, Math.floor(plazo * (1 - variacion)));
    const max = Math.min(plazoMax, Math.ceil(plazo * (1 + variacion)));

    const plazos = [];
    for (let p = min; p <= max; p++) {
        plazos.push(p);
    }

    return plazos;
};

export const calcularCreditoSimulado = ({
    tipo,
    rut,
    monto,
    plazo,
    renta,
    primer_pago,
    body
}) => {
    // const { montoMin, montoMax, plazoMin, plazoMax } = CONFIG_CREDITOS[tipo];
    
    const tasaBaseMensual = obtenerTasaBase(tipo, monto, plazo);
    if (tasaBaseMensual == null) {
        throw new Error("No se encontró una tasa base");
    };

    const ajusteRiesgoMensual = calcularRiesgoEstimado(tipo, monto, plazo, renta);
    const tasaMensual = calcularTasaMensualFinal(tipo, tasaBaseMensual, ajusteRiesgoMensual);

    if (!tasaMensual && tasaMensual !== 0) {
        throw new Error("No se pudo calcular la tasa mensual final");
    };

    const tasaAnual = calcularMensualAAnualNominal(tasaMensual);
    const cuota = monto * (tasaMensual / (1 - Math.pow(1+tasaMensual, -plazo)));
    if (!isFinite(cuota)) {
        throw new Error("No se pudo calculando la cuota mensual");
    }
    const CAE = calcularCAE(monto, plazo, cuota);

    if (CAE == null || !Number.isFinite(CAE)) {
        throw new Error("CAE inválido");
    }
    const CTC = cuota * plazo;

    return {
        tipo,
        monto,
        plazo,
        cuota_mensual: Math.round(cuota),
        tasa_mensual: (tasaMensual * 100).toFixed(3),
        tasa_anual: (tasaAnual * 100).toFixed(2),
        cae: parseFloat(CAE.toFixed(2)),
        ctc: Math.round(CTC),
        solicitud: body,
    };
}

export const calcularRecomendacionesCreditoSimulado = ({
    tipo,
    rut,
    monto,
    plazo,
    renta,
    primer_pago,
    body,
    sim,
}) => {
    const { montoMin, montoMax, plazoMin, plazoMax } = CONFIG_CREDITOS[tipo];

    const montos = calcularMontosCandidatos(monto).filter(m => m >= montoMin && m <= montoMax);
    const plazos = calcularPlazosCandidatos(plazo, plazoMin, plazoMax);

    const res = [];
    console.log(montos);
    console.log(plazos);
    for (const m of montos) {
        for (const p of plazos) {
            try {
                const newBody = {
                    ...body,
                    monto: m,
                    plazo: p,
                };
                const sim = calcularCreditoSimulado({
                    tipo,
                    rut,
                    monto: m,
                    plazo: p,
                    renta,
                    primer_pago,
                    body:newBody,
                });
                if (sim) res.push(sim);
            } catch (e) {
                // ignoramos el error nada mas xd
                continue;
            }
        }
    }
    if (res.length === 0) return [];

    const minCAE = res.reduce((a,b) => a.cae < b.cae ? a : b);
    const minCTC = res.reduce((a,b) => a.ctc < b.ctc ? a : b);
    const minCuota = res.reduce((a,b) => a.cuota_mensual < b.cuota_mensual ? a : b);

    const aux = [
        { obj: minCAE, rec: "Menor CAE" },
        { obj: minCTC, rec: "Menor CTC" },
        { obj: minCuota, rec: "Menor Cuota" }
    ];

    const map = new Map();

    map.set(sim, []); 

    for (const { obj, rec } of aux) {
        if (obj === sim) continue;

        if (!map.has(obj)) {
            map.set(obj, [rec]);
        } else {
            map.get(obj).push(rec);
        }
    }

    const final_res = [];

    for (const [obj, recs] of map.entries()) {
        if (obj === sim) continue;

        obj.rec = recs.join(", ");
        final_res.push(obj);
    }

    return final_res;
}